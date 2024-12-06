import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  const cookie = request.headers.get("Cookie");
  const token = cookie
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "") as unknown as {
      iduser: number;
      username: string;
      role: number; 
    };

    return NextResponse.json({
      iduser : decoded.iduser,
      username: decoded.username,
      idrole: decoded.role,
    });
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
