import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function authenticate(request: Request) {
  const cookie = request.headers.get("Cookie");
  console.log("Cookie:", cookie);

  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  console.log("Token:", token);

  if (!token) {
    console.log("No token provided");
    return NextResponse.json(
      { message: "Unauthorized", status: "error" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    return { user: decoded };
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { message: "Unauthorized", status: "error" },
      { status: 401 }
    );
  }
}