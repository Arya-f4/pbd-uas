import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";
export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const url = new URL(request.url);
  const idretur = url.searchParams.get('idretur');

  try {
    const connection = await pool.getConnection();
    let query, params;

    if (idretur) {
      // Fetch detail retur
      query = `
        SELECT dr.iddetail_retur, dr.jumlah, dr.alasan, dr.iddetail_penerimaan, dr.idretur,
               b.nama as nama_barang
        FROM detail_retur dr
        JOIN detail_penerimaan dp ON dr.iddetail_penerimaan = dp.iddetail_penerimaan
        JOIN barang b ON dp.barang_idbarang = b.idbarang
        WHERE dr.idretur = ?
      `;
      params = [idretur];
    } else {
      // Fetch main retur list
      query = `
        SELECT r.idretur, r.created_at, r.idpenerimaan, r.iduser
        FROM retur r
        ORDER BY r.created_at DESC
      `;
      params = [];
    }

    const [rows] = await connection.query(query, params);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching retur data:", error);
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

export async function POST(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { idpenerimaan, iduser, details } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Insert retur header
      const [returResult] = await connection.query(
        "INSERT INTO retur (created_at, idpenerimaan, iduser) VALUES (NOW(), ?, ?)",
        [idpenerimaan, iduser]
      );
      const idretur = (returResult as any).insertId;

      // Insert retur details
      for (const detail of details) {
        if (detail.jumlah > 0) { // Only insert if there are items to return
          await connection.query(
            "INSERT INTO detail_retur (jumlah, alasan, iddetail_penerimaan, idretur) VALUES (?, ?, ?, ?)",
            [detail.jumlah, detail.alasan, detail.iddetail_penerimaan, idretur]
          );
        }
      }

      await connection.commit();
      return NextResponse.json({
        message: "Retur created successfully",
        id: idretur,
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating retur:", error);
    return NextResponse.json(
      {
        message: "Error creating retur",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}