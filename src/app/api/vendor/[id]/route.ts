import { NextResponse } from "next/server";
import pool from "@/lib/db";

interface VendorView {
  idvendor: number;
  vendor_name: string;
  badan_hukum: string;
  status: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM view_vendor WHERE idvendor = ?",
      [id],
    );
    connection.release();

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Vendor not found", status: "error" },
        { status: 404 },
      );
    }

    const vendor = rows[0] as VendorView;

    return NextResponse.json({
      data: vendor,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const vendorData: VendorView = await request.json();
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "UPDATE vendor SET nama_vendor = ?, badan_hukum = ?, status = ? WHERE idvendor = ?",
      [vendorData.nama_vendor, vendorData.badan_hukum, vendorData.status, id],
    );

    connection.release();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Vendor not found", status: "error" },
        { status: 404 },
      );
    }

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "DELETE FROM vendor WHERE idvendor = ?",
      [id],
    );

    connection.release();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Vendor not found", status: "error" },
        { status: 404 },
      );
    }

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
