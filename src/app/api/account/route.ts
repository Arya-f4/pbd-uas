import { NextResponse } from "next/server";
import pool from "@/lib/db";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken"; // Import jwt

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

// PUT : Edit user by jwt
export async function PUT(request: Request) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse; // Jika tidak terautentikasi, kembalikan respons

  const body = await request.json();
  const { iduser, username, password, idrole } = body;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "UPDATE user SET username = ?, password = ? WHERE iduser = ?",
      [username, password, idrole, iduser],
    );
    connection.release();

    return NextResponse.json({ message: "User updated" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "An error occurred during user update" },
      { status: 500 },
    );
  }
}
