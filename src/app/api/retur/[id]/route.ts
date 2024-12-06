import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const id = params.id;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT r.idretur, r.created_at AS return_date, r.idpenerimaan, 
              u.username AS handled_by, dr.idbarang, b.nama AS item_name, 
              dr.jumlah, dr.alasan
       FROM retur r
       JOIN detail_retur dr ON r.idretur = dr.iddetail_retur
       JOIN barang b ON dr.idbarang = b.idbarang
       JOIN user u ON r.iduser = u.iduser
       WHERE r.idretur = ?`,
      [id]
    );
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching retur details:", error);
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