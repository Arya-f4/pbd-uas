import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const idpengadaan = params.id;
    const { iduser, details } = await request.json();

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert a new penerimaan record
      const [penerimaan] = await connection.query(
        "INSERT INTO penerimaan (idpengadaan, iduser, status, created_at) VALUES (?, ?, 'A', NOW())",
        [idpengadaan, iduser]
      );
      const idpenerimaan = (penerimaan as any).insertId;

      for (const detail of details) {
        const { idbarang, jumlah, harga_satuan, subtotal } = detail;
        const sub_total_terima = jumlah * harga_satuan;

        // Insert detail_penerimaan
        await connection.query(
          "INSERT INTO detail_penerimaan (idpenerimaan, barang_idbarang, jumlah_terima, harga_satuan_terima, sub_total_terima) VALUES (?, ?, ?, ?, ?)",
          [idpenerimaan, idbarang, jumlah, harga_satuan, sub_total_terima]
        );

    
      }

      // Fetch remaining items
      const [remainingItems] = await connection.query(`
        SELECT 
          dp.idbarang,
          b.nama AS nama_barang,
          dp.jumlah AS jumlah_dipesan,
          COALESCE(SUM(dpr.jumlah_terima), 0) AS jumlah_diterima,
          dp.jumlah - COALESCE(SUM(dpr.jumlah_terima), 0) AS jumlah_sisa
        FROM 
          detail_pengadaan dp
        JOIN 
          barang b ON dp.idbarang = b.idbarang
        LEFT JOIN 
          penerimaan p ON dp.idpengadaan = p.idpengadaan
        LEFT JOIN 
          detail_penerimaan dpr ON p.idpenerimaan = dpr.idpenerimaan AND dp.idbarang = dpr.barang_idbarang
        WHERE 
          dp.idpengadaan = ?
        GROUP BY 
          dp.idbarang, b.nama, dp.jumlah
        HAVING 
          jumlah_sisa > 0
      `, [idpengadaan]);

      const totalRemaining = (remainingItems as any[]).reduce((sum, item) => sum + item.jumlah_sisa, 0);

      if (totalRemaining === 0) {
        // All items received, update pengadaan status to 'C' (Completed)
        await connection.query(
          "UPDATE pengadaan SET status = 'C' WHERE idpengadaan = ?",
          [idpengadaan]
        );
        await connection.query(
          "UPDATE penerimaan SET status = 'C' WHERE idpengadaan = ?",
          [idpengadaan]
        );
      } else {
        // Some items still pending, update pengadaan status to 'A' (Partially received)
        await connection.query(
          "UPDATE pengadaan SET status = 'A' WHERE idpengadaan = ?",
          [idpengadaan]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        message: "Penerimaan berhasil disimpan.",
        remainingItems: remainingItems,
        totalRemaining: totalRemaining,
        status: totalRemaining === 0 ? 'C' : 'A'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();

      console.error("Error saving penerimaan:", error);
      return NextResponse.json(
        {
          message: "Internal server error",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}