import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT idmargin_penjualan, created_at, updated_at, persen, status
      FROM margin_penjualan
      ORDER BY created_at DESC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching sales margins:", error);
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
    const { persen } = await request.json();
    const connection = await pool.getConnection();

    // First, create the SQL function if it doesn't exist
    await connection.query(`
      CREATE FUNCTION IF NOT EXISTS check_margin_exists(margin_percent DECIMAL(5,2))
      RETURNS BOOLEAN
      DETERMINISTIC
      BEGIN
        DECLARE margin_exists BOOLEAN;
        SELECT EXISTS(SELECT 1 FROM margin_penjualan WHERE persen = margin_percent) INTO margin_exists;
        RETURN margin_exists;
      END;
    `);

    // Now use the function to check if the margin already exists
    const [marginExists] = await connection.query(
      "SELECT check_margin_exists(?) AS margin_exists",
      [persen]
    );

    if (marginExists[0].margin_exists) {
      connection.release();
      return NextResponse.json(
        {
          message: "Margin already exists",
          status: "error",
        },
        { status: 400 }
      );
    }

    // If the margin doesn't exist, insert it
    const [result] = await connection.query(
      "INSERT INTO margin_penjualan (created_at, updated_at, persen, status) VALUES (NOW(), NOW(), ?, '1')",
      [persen]
    );

    connection.release();

    return NextResponse.json(
      {
        message: "Sales margin created successfully",
        id: result.insertId,
        status: "success",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sales margin:", error);
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
      { message: "Sales margin ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const { persen, status } = await request.json(); //removed iduser
    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE margin_penjualan SET updated_at = NOW(), persen = ?, status = ? WHERE idmargin_penjualan = ?",
      [persen, status, id]
    );

    connection.release();

    return NextResponse.json({
      message: "Sales margin updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error updating sales margin:", error);
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
      { message: "Sales margin ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE margin_penjualan SET status = '0' WHERE idmargin_penjualan = ?",
      [id]
    );

    connection.release();

    return NextResponse.json({
      message: "Sales margin deactivated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error deactivating sales margin:", error);
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