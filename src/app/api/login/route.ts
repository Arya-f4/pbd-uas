import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { iduser: user.iduser, username: user.username, role: user.idrole },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as {
      username: string;
    };

    const response = NextResponse.json({
      success: true,
      username: decodedToken.username,
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 },
    );
  } finally {
    if (conn) conn.release();
  }
}
