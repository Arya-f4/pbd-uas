import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT b.idbarang, b.nama AS nama_barang, COALESCE(SUM(
        CASE 
          WHEN ks.jenis_transaksi = 'masuk' THEN ks.jumlah
          WHEN ks.jenis_transaksi = 'keluar' THEN -ks.jumlah
          ELSE 0
        END
      ), 0) AS stok
      FROM barang b
      LEFT JOIN kartu_stok ks ON b.idbarang = ks.idbarang
      GROUP BY b.idbarang, b.nama
      ORDER BY b.nama
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
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