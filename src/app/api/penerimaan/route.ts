import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT p.*, u.username, pg.idpengadaan
      FROM penerimaan p
      JOIN user u ON p.iduser = u.iduser
      LEFT JOIN pengadaan pg ON p.idpengadaan = pg.idpengadaan
      ORDER BY p.created_at DESC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching penerimaan:", error);
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
    const { status, idpengadaan, iduser } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        "CALL InsertPenerimaan(?, ?, ?)",
        [status, idpengadaan, iduser]
      );
      const idpenerimaan = result[0][0].idpenerimaan;

      await connection.commit();

      return NextResponse.json(
        {
          message: "Penerimaan created successfully",
          id: idpenerimaan,
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
    console.error("Error creating penerimaan:", error);
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Penerimaan ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const { status, idpengadaan, iduser } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query(
        "CALL UpdatePenerimaan(?, ?, ?, ?)",
        [id, status, idpengadaan, iduser]
      );

      await connection.commit();

      return NextResponse.json({
        message: "Penerimaan updated successfully",
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating penerimaan:", error);
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

export async function DELETE(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Penerimaan ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query("CALL DeletePenerimaan(?)", [id]);

      await connection.commit();

      return NextResponse.json({
        message: "Penerimaan deleted successfully",
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting penerimaan:", error);
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