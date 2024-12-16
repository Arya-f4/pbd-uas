import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { iduser, details } = await request.json();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO penerimaan (status, idpengadaan, iduser, created_at) VALUES (?, ?, ?, NOW())',
      ['P', id, iduser]
    );
    const idpenerimaan = result.insertId;

    await Promise.all(details.map((detail: any) =>
      conn.query(
        'INSERT INTO detail_penerimaan (idpenerimaan, barang_idbarang, jumlah_terima, harga_satuan_terima) VALUES (?, ?, ?, ?)',
        [idpenerimaan, detail.idbarang, detail.jumlah, detail.harga_satuan]
      )
    ));

    const [totals] = await conn.query(`
      SELECT 
        dp.idbarang,
        dp.jumlah as ordered,
        COALESCE(SUM(dr.jumlah_terima), 0) as received
      FROM detail_pengadaan dp
      LEFT JOIN penerimaan p ON p.idpengadaan = dp.idpengadaan
      LEFT JOIN detail_penerimaan dr ON dr.idpenerimaan = p.idpenerimaan AND dr.barang_idbarang = dp.idbarang
      WHERE dp.idpengadaan = ?
      GROUP BY dp.idbarang, dp.jumlah
    `, [id]);

    const newStatus = totals.every((item: any) => item.ordered === item.received) ? 'C' :
                      totals.some((item: any) => item.received > 0) ? 'A' : 'P';

    await conn.query('UPDATE pengadaan SET status = ? WHERE idpengadaan = ?', [newStatus, id]);
    await conn.commit();

    return NextResponse.json({ success: true, idpenerimaan, status: newStatus });
  } catch (error) {
    await conn.rollback();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query(`
      SELECT 
        p.idpenerimaan,
        p.created_at as return_date,
        p.idpengadaan,
        u.username as handled_by
      FROM penerimaan p
      JOIN user u ON p.iduser = u.iduser
      WHERE p.idpengadaan = ?
      ORDER BY p.created_at DESC
    `, [id]);

    return NextResponse.json({ data: rows, status: 'success' });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}