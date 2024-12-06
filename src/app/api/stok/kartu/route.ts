import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const idbarang = searchParams.get("idbarang");

  if (!idbarang) {
    return NextResponse.json(
      { message: "Product ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT ks.*, b.nama AS nama_barang
      FROM kartu_stok ks
      JOIN barang b ON ks.idbarang = b.idbarang
      WHERE ks.idbarang = ?
      ORDER BY ks.timestamp DESC
    `, [idbarang]);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching stock card:", error);
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