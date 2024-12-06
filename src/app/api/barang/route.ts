import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT b.idbarang, b.nama, b.idsatuan, s.nama_satuan, b.status,b.harga
      FROM barang b
      JOIN satuan s ON b.idsatuan = s.idsatuan
      ORDER BY b.idbarang DESC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
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
    const { nama, idsatuan, status, harga } = await request.json();
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "INSERT INTO barang (nama, idsatuan, status, harga) VALUES (?, ?, ?, ?)",
      [nama, idsatuan, status, harga]
    );

    connection.release();

    return NextResponse.json(
      {
        message: "Product created successfully",
        id: result.insertId,
        status: "success",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
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
      { message: "Product ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const { nama, idsatuan, status } = await request.json();
    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE barang SET nama = ?, idsatuan = ?, status = ?, harga = ? WHERE idbarang = ?",
      [nama, idsatuan, status, id]
    );

    connection.release();

    return NextResponse.json({
      message: "Product updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error updating product:", error);
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
      { message: "Product ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      "DELETE FROM barang WHERE idbarang = ?",
      [id]
    );

    connection.release();

    return NextResponse.json({
      message: "Product deleted successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
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