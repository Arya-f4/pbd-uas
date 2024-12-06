import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT p.*, v.nama_vendor
      FROM pengadaan p
      JOIN vendor v ON p.vendor_idvendor = v.idvendor
      ORDER BY p.timestamp DESC
    `);
   
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching procurements:", error);
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

export async function POST(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { vendor_idvendor, details, user_iduser } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        "INSERT INTO pengadaan (vendor_idvendor, status, user_iduser) VALUES (?, 'P', ?)",
        [vendor_idvendor, user_iduser]
      );

      const idpengadaan = result.insertId;

      let subtotal_nilai = 0;
      for (const detail of details) {
        const { idbarang, jumlah } = detail;
        const [barangResult] = await connection.query(
          "SELECT harga FROM barang WHERE idbarang = ?",
          [idbarang]
        );
        const harga_satuan = barangResult[0].harga;
        const sub_total = harga_satuan * jumlah;
        subtotal_nilai += sub_total;

        await connection.query(
          "INSERT INTO detail_pengadaan (idpengadaan, idbarang, harga_satuan, jumlah, sub_total) VALUES (?, ?, ?, ?, ?)",
          [idpengadaan, idbarang, harga_satuan, jumlah, sub_total]
        );
      }

      const ppn = subtotal_nilai * 0.11; // Assuming 11% tax
      const total_nilai = subtotal_nilai + ppn;

      await connection.query(
        "UPDATE pengadaan SET subtotal_nilai = ?, ppn = ?, total_nilai = ? WHERE idpengadaan = ?",
        [subtotal_nilai, ppn, total_nilai, idpengadaan]
      );

      await connection.commit();

      return NextResponse.json(
        {
          message: "Procurement created successfully",
          id: idpengadaan,
          status: "success",
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating procurement:", error);
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

export async function PUT(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id) {
    return NextResponse.json(
      { message: "Procurement ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      if (action === "complete") {
        await connection.query(
          "UPDATE pengadaan SET status = 'c' WHERE idpengadaan = ?",
          [id]
        );

        await connection.commit();

        return NextResponse.json({
          message: "Procurement marked as complete successfully",
          status: "success",
        });
      } else {
        const { vendor_idvendor, details } = await request.json();

        await connection.query(
          "UPDATE pengadaan SET vendor_idvendor = ? WHERE idpengadaan = ?",
          [vendor_idvendor, id]
        );

        await connection.query("DELETE FROM detail_pengadaan WHERE idpengadaan = ?", [id]);

        let subtotal_nilai = 0;
        for (const detail of details) {
          const { idbarang, jumlah } = detail;
          const [barangResult] = await connection.query(
            "SELECT harga FROM barang WHERE idbarang = ?",
            [idbarang]
          );
          const harga_satuan = barangResult[0].harga;
          const sub_total = harga_satuan * jumlah;
          subtotal_nilai += sub_total;

          await connection.query(
            "INSERT INTO detail_pengadaan (idpengadaan, idbarang, harga_satuan, jumlah, sub_total) VALUES (?, ?, ?, ?, ?)",
            [id, idbarang, harga_satuan, jumlah, sub_total]
          );
        }

        const ppn = subtotal_nilai * 0.11; // Assuming 11% tax
        const total_nilai = subtotal_nilai + ppn;

        await connection.query(
          "UPDATE pengadaan SET subtotal_nilai = ?, ppn = ?, total_nilai = ? WHERE idpengadaan = ?",
          [subtotal_nilai, ppn, total_nilai, id]
        );

        await connection.commit();

        return NextResponse.json({
          message: "Procurement updated successfully",
          status: "success",
        });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating procurement:", error);
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

export async function DELETE(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Procurement ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query("DELETE FROM detail_pengadaan WHERE idpengadaan = ?", [id]);
      await connection.query("DELETE FROM pengadaan WHERE idpengadaan = ?", [id]);

      await connection.commit();

      return NextResponse.json({
        message: "Procurement deleted successfully",
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting procurement:", error);
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