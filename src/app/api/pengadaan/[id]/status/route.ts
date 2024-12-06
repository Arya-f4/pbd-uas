import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE pengadaan SET status = ? WHERE idpengadaan = ?',
      [status, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Pengadaan not found or status not changed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pengadaan status updated successfully' });
  } catch (error) {
    console.error('Error updating pengadaan status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}