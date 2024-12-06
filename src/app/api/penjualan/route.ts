import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT * FROM view_penjualan
      ORDER BY sale_date DESC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching penjualan:", error);
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
    const { iduser, idmargin_penjualan, details } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        "INSERT INTO penjualan (created_at, iduser, idmargin_penjualan) VALUES (NOW(), ?, ?)",
        [iduser, idmargin_penjualan]
      );
      const idpenjualan = result.insertId;

      let subtotal_nilai = 0;
      for (const detail of details) {
        const { idbarang, jumlah, harga_satuan } = detail;
        const subtotal = jumlah * harga_satuan;
        subtotal_nilai += subtotal;

        await connection.query(
          "INSERT INTO detail_penjualan (harga_satuan, jumlah, subtotal, penjualan_idpenjualan, idbarang) VALUES (?, ?, ?, ?, ?)",
          [harga_satuan, jumlah, subtotal, idpenjualan, idbarang]
        );
      }

      const ppn = subtotal_nilai * 0.11;
      const total_nilai = subtotal_nilai + ppn;

      await connection.query(
        "UPDATE penjualan SET subtotal_nilai = ?, ppn = ?, total_nilai = ? WHERE idpenjualan = ?",
        [subtotal_nilai, ppn, total_nilai, idpenjualan]
      );

      await connection.commit();

      return NextResponse.json(
        {
          message: "Penjualan created successfully",
          id: idpenjualan,
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
    console.error("Error creating penjualan:", error);
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