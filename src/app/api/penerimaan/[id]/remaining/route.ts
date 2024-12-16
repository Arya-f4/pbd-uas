import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const conn = await pool.getConnection();

  try {
    const [items] = await conn.query(`
      SELECT 
        b.idbarang,
        b.nama as nama_barang,
        dp.jumlah as total_ordered,
        dp.harga_satuan,
        COALESCE(SUM(dr.jumlah_terima), 0) as total_received,
        dp.jumlah - COALESCE(SUM(dr.jumlah_terima), 0) as remaining
      FROM detail_pengadaan dp
      JOIN barang b ON b.idbarang = dp.idbarang
      LEFT JOIN penerimaan p ON p.idpengadaan = dp.idpengadaan
      LEFT JOIN detail_penerimaan dr ON dr.idpenerimaan = p.idpenerimaan AND dr.barang_idbarang = dp.idbarang
      WHERE dp.idpengadaan = ?
      GROUP BY b.idbarang, b.nama, dp.jumlah, dp.harga_satuan
      HAVING remaining > 0
    `, [id]);

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

