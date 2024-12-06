import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function POST(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { idbarang, jenis_transaksi, jumlah, keterangan } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        "INSERT INTO kartu_stok (idbarang, jenis_transaksi, jumlah, keterangan) VALUES (?, ?, ?, ?)",
        [idbarang, jenis_transaksi, jumlah, keterangan]
      );

      await connection.commit();

      return NextResponse.json(
        {
          message: "Stock movement recorded successfully",
          id: result.insertId,
          status: "success",
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error recording stock movement:", error);
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