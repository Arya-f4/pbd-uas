import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticate } from '@/lib/authMiddleware';

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        DATE_FORMAT(p.timestamp, '%Y-%m-01') AS month,
        SUM(p.total_nilai) AS monthly_cost
      FROM 
        pengadaan p
      WHERE 
        p.timestamp >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)
      GROUP BY 
        DATE_FORMAT(p.timestamp, '%Y-%m-01')
      ORDER BY 
        month ASC
    `);
    connection.release();

    return NextResponse.json({
      data: rows,
      status: 'success',
    });
  } catch (error) {
    console.error('Error fetching monthly cost:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}