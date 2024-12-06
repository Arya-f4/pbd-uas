import { NextResponse } from "next/server";
import pool from "@/lib/db";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken"; // Import jwt

interface VendorView {
  idvendor: number;
  nama_vendor: string;
  badan_hukum: string;
  status: string;
}

// Middleware untuk memeriksa autentikasi
async function authenticate(request: Request) {
  const cookie = request.headers.get("Cookie"); // Ambil cookie dari header
  console.log("Cookie:", cookie); // Log cookie untuk debugging

  // Ambil token dari cookie
  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  console.log("Token:", token); // Log token untuk debugging

  if (!token) {
    console.log("No token provided"); // Log jika tidak ada token
    return NextResponse.json(
      { message: "Unauthorized", status: "error" },
      { status: 401 },
    );
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Log hasil decode token
    (request as any).user = decoded; // Menyimpan informasi pengguna di request
  } catch (error) {
    console.error("Token verification error:", error); // Log kesalahan verifikasi
    return NextResponse.json(
      { message: "Unauthorized", status: "error" },
      { status: 401 },
    );
  }

  return null; // Tidak ada kesalahan, lanjutkan ke handler API
}

// GET: Mengambil semua vendor
export async function GET(request: Request) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse; // Jika tidak terautentikasi, kembalikan respons

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM view_vendor");
    connection.release();

    const vendors = rows as VendorView[];

    return NextResponse.json({
      data: vendors,
      total: vendors.length,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET: Mengambil vendor dengan pagination
export async function GETWithPagination(request: Request) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse; // Jika tidak terautentikasi, kembalikan respons

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    // Get total count
    const [countResult] = await connection.query(
      "SELECT COUNT(*) as total FROM view_vendor",
    );
    const total = (countResult as any)[0].total;

    // Get paginated data
    const [rows] = await connection.query(
      "SELECT * FROM view_vendor LIMIT ? OFFSET ?",
      [limit, offset],
    );

    connection.release();

    const vendors = rows as VendorView[];

    return NextResponse.json({
      data: vendors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST: Menambahkan vendor baru
export async function POST(request: Request) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse; // Jika tidak terautentikasi, kembalikan respons

  try {
    const vendorData: VendorView = await request.json();
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "INSERT INTO vendor (nama_vendor, badan_hukum, status) VALUES (?, ?, ?)",
      [vendorData.nama_vendor, vendorData.badan_hukum, vendorData.status],
    );

    connection.release();

    return NextResponse.json(
      {
        message: "Vendor created successfully",
        vendor: { idvendor: result.insertId, ...vendorData },
        status: "success",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT: Memperbarui vendor
export async function PUT(request: Request) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse; // Jika tidak terautentikasi, kembalikan respons

  try {
    const vendorData: VendorView = await request.json();
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "UPDATE vendors SET nama_vendor = ?, badan_hukum = ?, status = ? WHERE idvendor = ?",
      [
        vendorData.nama_vendor,
        vendorData.badan_hukum,
        vendorData.status,
        vendorData.idvendor,
      ],
    );

    connection.release();

    return NextResponse.json({
      message: "Vendor updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE: Menghapus vendor
export async function DELETE(request: Request) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse; // Jika tidak terautentikasi, kembalikan respons

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");

  if (!id) {
    return NextResponse.json(
      { message: "Vendor ID is required", status: "error" },
      { status: 400 },
    );
  }

  try {
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "DELETE FROM vendor WHERE idvendor = ?",
      [id],
    );

    connection.release();

    return NextResponse.json({
      message: "Vendor deleted successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
