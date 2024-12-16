import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function POST(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { subtotal_nilai, ppn, total_nilai, iduser, idmargin_penjualan, details } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Insert into penjualan table
      const [penjualanResult] = await connection.query(
        "INSERT INTO penjualan (created_at, subtotal_nilai, ppn, total_nilai, iduser, idmargin_penjualan) VALUES (NOW(), ?, ?, ?, ?, ?)",
        [subtotal_nilai, ppn, total_nilai, iduser, idmargin_penjualan]
      );
      const idpenjualan = penjualanResult.insertId;

      // Insert details into detail_penjualan table
      for (const detail of details) {
        await connection.query(
          "INSERT INTO detail_penjualan (harga_satuan, jumlah, subtotal, penjualan_idpenjualan, idbarang) VALUES (?, ?, ?, ?, ?)",
          [detail.harga_satuan, detail.jumlah, detail.subtotal, idpenjualan, detail.idbarang]
        );
      }

      await connection.commit();

      return NextResponse.json(
        {
          message: "Sale recorded successfully",
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
    console.error("Error recording sale:", error);
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

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT p.idpenjualan, p.created_at, p.subtotal_nilai, p.ppn, p.total_nilai, 
             p.iduser, u.username, p.idmargin_penjualan, mp.persen as margin_persen
      FROM penjualan p
      JOIN user u ON p.iduser = u.iduser
      JOIN margin_penjualan mp ON p.idmargin_penjualan = mp.idmargin_penjualan
      ORDER BY p.created_at DESC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
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

export async function PUT(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json(
    { message: "PUT method not supported for sales", status: "error" },
    { status: 405 }
  );
}

export async function DELETE(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json(
    { message: "DELETE method not supported for sales", status: "error" },
    { status: 405 }
  );
}