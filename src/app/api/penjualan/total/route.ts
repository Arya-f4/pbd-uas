import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticate } from '@/lib/authMiddleware';

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
    SELECT SUM(total_nilai) AS total_penjualan
      FROM penjualan
    `);
    connection.release();

    return NextResponse.json({
      data: rows[0],
      status: 'success',
    });
  } catch (error) {
    console.error('Error fetching total penjualan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}