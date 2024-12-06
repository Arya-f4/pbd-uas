import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const [rows] = await pool.query('SELECT * FROM penjualan WHERE idpenjualan = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Penjualan not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve penjualan' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const { subtotal_nilai, ppn, total_nilai, iduser, idmargin_penjualan } = await req.json();

  try {
    await pool.query(
      'UPDATE penjualan SET subtotal_nilai = ?, ppn = ?, total_nilai = ?, iduser = ?, idmargin_penjualan = ? WHERE idpenjualan = ?', 
      [subtotal_nilai, ppn, total_nilai, iduser, idmargin_penjualan, id]
    );
    return NextResponse.json({ message: 'Penjualan updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update penjualan' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await pool.query('DELETE FROM penjualan WHERE idpenjualan = ?', [id]);
    return NextResponse.json({ message: 'Penjualan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete penjualan' }, { status: 500 });
  }
}
