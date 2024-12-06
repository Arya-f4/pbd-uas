import { NextResponse } from 'next/server';
import pool from '@/lib/db'
import mysql from 'mysql2/promise'



export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT COUNT(*) as total FROM view_barang');
    connection.release();

    const total = (rows as any)[0].total;

    return NextResponse.json({
      total: total
    });

  } catch (error) {
    console.error('Error fetching barang count:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}