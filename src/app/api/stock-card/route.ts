import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'penjualan',
  })

  try {
    const [rows] = await connection.execute('SELECT * FROM view_kartu_stok ORDER BY transaction_date DESC LIMIT 100')
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch stock card data:', error)
    return NextResponse.json({ error: 'An error occurred while fetching stock card data' }, { status: 500 })
  } finally {
    await connection.end()
  }
}