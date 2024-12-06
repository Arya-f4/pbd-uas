import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const id = params.id;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT p.*, dp.idbarang, b.nama AS nama_barang, dp.jumlah, dp.harga_satuan, (dp.jumlah * dp.harga_satuan) AS sub_total
       FROM penjualan p
       JOIN detail_penjualan dp ON p.idpenjualan = dp.idpenjualan
       JOIN barang b ON dp.idbarang = b.idbarang
       WHERE p.idpenjualan = ?`,
      [id]
    );
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching penjualan details:", error);
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const id = params.id;

  try {
    const { status, details } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query(
        "UPDATE penjualan SET status = ? WHERE idpenjualan = ?",
        [status, id]
      );

      // Delete old details
      await connection.query("DELETE FROM detail_penjualan WHERE idpenjualan = ?", [id]);

      // Insert new details
      for (const detail of details) {
        const { idbarang, jumlah, harga_satuan } = detail;
        await connection.query(
          "INSERT INTO detail_penjualan (idpenjualan, idbarang, jumlah, harga_satuan) VALUES (?, ?, ?, ?)",
          [id, idbarang, jumlah, harga_satuan]
        );
      }

      await connection.commit();

      return NextResponse.json({
        message: "Penjualan updated successfully",
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating penjualan:", error);
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