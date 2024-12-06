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
      `SELECT p.*, dp.barang_idbarang, b.nama AS nama_barang, dp.jumlah_terima, dp.harga_satuan_terima
       FROM penerimaan p
       JOIN detail_penerimaan dp ON p.idpenerimaan = dp.idpenerimaan
       JOIN barang b ON dp.barang_idbarang = b.idbarang
       WHERE p.idpenerimaan = ?`,
      [id]
    );
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const id = params.id;

  try {
    const { idpengadaan, status, details } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query(
        "UPDATE penerimaan SET idpengadaan = ?, status = ? WHERE idpenerimaan = ?",
        [idpengadaan, status, id]
      );

      // Delete old details and stock entries
      const [oldDetails] = await connection.query(
        "SELECT barang_idbarang, jumlah_terima FROM detail_penerimaan WHERE idpenerimaan = ?",
        [id]
      );
      await connection.query("DELETE FROM detail_penerimaan WHERE idpenerimaan = ?", [id]);
      for (const oldDetail of oldDetails) {
        await connection.query(
          "INSERT INTO kartu_stok (idbarang, jenis_transaksi, jumlah, keterangan) VALUES (?, 'keluar', ?, ?)",
          [oldDetail.idbarang, oldDetail.jumlah_diterima, `Pembatalan Penerimaan #${id}`]
        );
      }

      // Insert new details and update stock
      for (const detail of details) {
        const { idbarang, jumlah_diterima, harga_satuan } = detail;
        await connection.query(
          "INSERT INTO detail_penerimaan (idpenerimaan, idbarang, jumlah_diterima, harga_satuan) VALUES (?, ?, ?, ?)",
          [id, idbarang, jumlah_diterima, harga_satuan]
        );

        await connection.query(
          "INSERT INTO kartu_stok (idbarang, jenis_transaksi, jumlah, keterangan) VALUES (?, 'masuk', ?, ?)",
          [idbarang, jumlah_diterima, `Penerimaan #${id}`]
        );
      }

      await connection.commit();

      return NextResponse.json({
        message: "Penerimaan updated successfully",
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating penerimaan:", error);
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