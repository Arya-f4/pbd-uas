import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT r.idretur, r.created_at AS return_date, r.idpenerimaan, u.username AS handled_by
      FROM retur r
      JOIN user u ON r.iduser = u.iduser
      ORDER BY r.created_at DESC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching retur:", error);
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
      const [result] = await connection.query(
        "INSERT INTO retur (created_at, idpenerimaan, iduser) VALUES (NOW(), ?, ?)",
        [idpenerimaan, iduser]
      );
      const idretur = result.insertId;

      for (const detail of details) {
        const { idbarang, jumlah, alasan, iddetail_penerimaan } = detail;
        await connection.query(
          "INSERT INTO detail_retur (jumlah, alasan, idbarang, iddetail_penerimaan) VALUES (?, ?, ?, ?)",
          [jumlah, alasan, idbarang, iddetail_penerimaan]
        );
      }

      await connection.commit();

      return NextResponse.json(
        {
          message: "Retur created successfully",
          id: idretur,
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
    console.error("Error creating retur:", error);
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