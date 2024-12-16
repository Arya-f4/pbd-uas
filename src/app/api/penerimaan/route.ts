import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticate } from "@/lib/authMiddleware";


export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
     WITH TotalDipesan AS (
    SELECT 
        dp.idpengadaan,
        SUM(dp.jumlah) AS jumlah_dipesan
    FROM detail_pengadaan dp
    GROUP BY dp.idpengadaan
),
TotalDiterima AS (
    SELECT 
        pn.idpengadaan,
        SUM(dpr.jumlah_terima) AS total_diterima
    FROM penerimaan pn
    JOIN detail_penerimaan dpr ON pn.idpenerimaan = dpr.idpenerimaan
    GROUP BY pn.idpengadaan
)
SELECT 
    p.idpengadaan,
    MAX(pn.idpenerimaan) AS idpenerimaan,
    MAX(pn.created_at) AS reception_date,
    MAX(pn.status) AS status,
    MAX(u.username) AS received_by,
    GROUP_CONCAT(DISTINCT b.nama SEPARATOR ', ') AS nama_barang,
    MAX(td.jumlah_dipesan) AS jumlah_dipesan, -- Use MAX for aggregated CTE values
    MAX(tr.total_diterima) AS total_diterima, -- Use MAX for aggregated CTE values
    MAX(td.jumlah_dipesan) - COALESCE(MAX(tr.total_diterima), 0) AS sisa_barang
FROM pengadaan p
LEFT JOIN TotalDipesan td ON p.idpengadaan = td.idpengadaan
LEFT JOIN TotalDiterima tr ON p.idpengadaan = tr.idpengadaan
LEFT JOIN penerimaan pn ON p.idpengadaan = pn.idpengadaan
LEFT JOIN user u ON pn.iduser = u.iduser
LEFT JOIN detail_pengadaan dp ON p.idpengadaan = dp.idpengadaan
LEFT JOIN barang b ON dp.idbarang = b.idbarang
GROUP BY p.idpengadaan
HAVING sisa_barang > 0 OR MAX(pn.idpenerimaan) IS NOT NULL
ORDER BY MAX(pn.created_at) DESC, p.idpengadaan DESC;

 `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching penerimaan:", error);
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
    const { status, idpengadaan, iduser, details } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Insert into penerimaan
      const [result] = await connection.query(
        "CALL InsertPenerimaan(?, ?, ?)",
        [status, idpengadaan, iduser]
      );
      const idpenerimaan = result[0][0].idpenerimaan;

      // Insert into detail_penerimaan
      for (const detail of details) {
        await connection.query(
          "INSERT INTO detail_penerimaan (idpenerimaan, idbarang, jumlah, jumlah_diterima, harga_satuan) VALUES (?, ?, ?, ?, ?)",
          [idpenerimaan, detail.idbarang, detail.jumlah, detail.jumlah_diterima, detail.harga_satuan]
        );
      }

      await connection.commit();

      return NextResponse.json(
        {
          message: "Penerimaan created successfully",
          id: idpenerimaan,
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
    console.error("Error creating penerimaan:", error);
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
      { message: "Penerimaan ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      if (action === "complete") {
        // Check if all items in the related pengadaan have been fully received
        const [rows] = await connection.query(
          `
          SELECT 
            dp.idpengadaan, 
            dp.idbarang, 
            dp.jumlah AS jumlah_dipesan, 
            COALESCE(SUM(dpr.jumlah_terima), 0) AS total_diterima
          FROM detail_pengadaan dp
          LEFT JOIN detail_penerimaan dpr ON dp.idbarang = dpr.barang_idbarang
          WHERE dp.idpengadaan = (SELECT idpengadaan FROM penerimaan WHERE idpenerimaan = ?)
          GROUP BY dp.idpengadaan, dp.idbarang
          HAVING jumlah_dipesan > total_diterima
          `,
          [id]
        );

        if (rows.length > 0) {
          // There are still items to be received
          return NextResponse.json(
            { message: "Not all items have been received yet", status: "error" },
            { status: 400 }
          );
        }

        // Mark the penerimaan as complete
        await connection.query(
          "UPDATE penerimaan SET status = 'C' WHERE idpenerimaan = ?",
          [id]
        );

        // Optionally, mark the related pengadaan as complete if all its items are received
        await connection.query(
          `
          UPDATE pengadaan p
          SET p.status = 'C'
          WHERE p.idpengadaan = (
            SELECT idpengadaan FROM penerimaan WHERE idpenerimaan = ?
          ) AND NOT EXISTS (
            SELECT 1
            FROM detail_pengadaan dp
            LEFT JOIN detail_penerimaan dpr 
              ON dp.idbarang = dpr.barang_idbarang
              AND dp.idpengadaan = (SELECT idpengadaan FROM penerimaan WHERE idpenerimaan = ?)
            GROUP BY dp.idbarang
            HAVING dp.jumlah > COALESCE(SUM(dpr.jumlah_terima), 0)
          )
          `,
          [id, id]
        );

        await connection.commit();

        return NextResponse.json({
          message: "Penerimaan marked as complete successfully",
          status: "success",
        });
      } else {
        // Default update logic
        const { status, idpengadaan, iduser } = await request.json();
        await connection.query(
          "CALL UpdatePenerimaan(?, ?, ?, ?)",
          [id, status, idpengadaan, iduser]
        );

        await connection.commit();

        return NextResponse.json({
          message: "Penerimaan updated successfully",
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


export async function DELETE(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Penerimaan ID is required", status: "error" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      await connection.query("CALL DeletePenerimaan(?)", [id]);

      await connection.commit();

      return NextResponse.json({
        message: "Penerimaan deleted successfully",
        status: "success",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting penerimaan:", error);
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