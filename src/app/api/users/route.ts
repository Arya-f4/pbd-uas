import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
// Helper function to authenticate requests
async function authenticate(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    console.log("No token provided");
    return NextResponse.json(
      { message: "Unauthorized", status: "error" },
      { status: 401 },
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      idrole: number;
      username: string;
    };
    (request as any).user = decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { message: "Unauthorized", status: "error" },
      { status: 401 },
    );
  }

  return null;
}

// GET: Fetch all users
export async function GET(request: NextRequest) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse;

  const user = (request as any).user;
  if (!user || user.role !== 1) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      "SELECT iduser, username, idrole FROM user",
    );
    return NextResponse.json({ data: users, status: "success" });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { message: "Internal Server Error", status: "error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse;

  const user = (request as any).user;
  if (!user || user.role !== 1) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const { username, password, idrole } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10); // Hash password menggunakan bcryptjs

  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      "INSERT INTO user (username, password, idrole) VALUES (?, ?, ?)",
      [username, hashedPassword, idrole], // Gunakan hashed password
    );
    return NextResponse.json({
      message: "User created successfully",
      status: "success",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { message: "Internal Server Error", status: "error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

// PUT: Update an existing user
export async function PUT(request: NextRequest) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse;

  const user = (request as any).user;
  if (!user || user.role !== 1) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const { iduser, username, password, idrole } = await request.json();

  const connection = await pool.getConnection();
  try {
    await connection.query(
      "UPDATE user SET username = ?, password = ?, idrole = ? WHERE iduser = ?",
      [username, password, idrole, iduser],
    );
    return NextResponse.json({
      message: "User updated successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error in PUT /api/users:", error);
    return NextResponse.json(
      { message: "Internal Server Error", status: "error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

// DELETE: Remove a user
export async function DELETE(request: NextRequest) {
  const authResponse = await authenticate(request);
  if (authResponse) return authResponse;

  const user = (request as any).user;
  if (!user || user.role !== 1) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const { iduser } = await request.json();

  const connection = await pool.getConnection();
  try {
    await connection.query("DELETE FROM user WHERE iduser = ?", [iduser]);
    return NextResponse.json({
      message: "User deleted successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error in DELETE /api/users:", error);
    return NextResponse.json(
      { message: "Internal Server Error", status: "error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
