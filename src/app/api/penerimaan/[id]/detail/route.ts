import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const idpengadaan = params.id;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        pn.idpenerimaan,
        dpr.iddetail_penerimaan,
        pn.created_at as reception_date,
        u.username as received_by,
        b.nama as nama_barang,
        dpr.jumlah_terima,
        dpr.harga_satuan_terima,
        dpr.sub_total_terima
      FROM penerimaan pn
      JOIN detail_penerimaan dpr ON pn.idpenerimaan = dpr.idpenerimaan
      JOIN user u ON pn.iduser = u.iduser
      JOIN barang b ON dpr.barang_idbarang = b.idbarang
      WHERE pn.idpengadaan = ?
      ORDER BY pn.created_at DESC
    `, [idpengadaan]);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching penerimaan details:", error);
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