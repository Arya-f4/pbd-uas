import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

interface SatuanView {
  idsatuan: number;
  nama_satuan: string;
  status: string;
}

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM satuan");
    connection.release();

    const units = rows as SatuanView[];

    return NextResponse.json({
      data: units,
      total: units.length,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching units:", error);
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
    const unitData: SatuanView = await request.json();
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "INSERT INTO satuan (nama_satuan, status) VALUES (?, ?)",
      [unitData.nama_satuan, unitData.status]
    );

    connection.release();

    return NextResponse.json(
      {
        message: "Unit created successfully",
        unit: { idsatuan: result.insertId, ...unitData },
        status: "success",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating unit:", error);
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

  try {
    const unitData: SatuanView = await request.json();
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "UPDATE satuan SET nama_satuan = ?, status = ? WHERE idsatuan = ?",
      [unitData.nama_satuan, unitData.status, unitData.idsatuan]
    );

    connection.release();

    return NextResponse.json({
      message: "Unit updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error updating unit:", error);
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
  const id = parseInt(searchParams.get("id") || "0");

  if (!id) {
    return NextResponse.json(
      { message: "Unit ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "DELETE FROM satuan WHERE idsatuan = ?",
      [id]
    );

    connection.release();

    return NextResponse.json({
      message: "Unit deleted successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
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