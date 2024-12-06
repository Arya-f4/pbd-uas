import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { QueryResult } from 'mysql2';


export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const idpenerimaan = params.id;

    if (!idpenerimaan) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
        const result = await pool.execute<QueryResult>(
            'SELECT * FROM view_penerimaan WHERE idpenerimaan = ?',
            [idpenerimaan]
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Penerimaan not found' }, { status: 404 });
        }

        const penerimaan = result[0];

        return NextResponse.json({ penerimaan });
    } catch (error) {
        console.error('Error retrieving penerimaan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idpengadaan = params.id;
  const { status, iduser } = await request.json();

  if (!idpengadaan || !status || !iduser) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const [result] = await pool.execute(
      'CALL InsertPenerimaan(?, ?, ?)',
      [status, idpengadaan, iduser]
    );

    const idpenerimaan = (result as any)[0][0].idpenerimaan;

    return NextResponse.json({ 
      message: 'Penerimaan created successfully', 
      idpenerimaan: idpenerimaan 
    });
  } catch (error) {
    console.error('Error creating penerimaan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idpenerimaan = params.id;
  const { status, idpengadaan, iduser } = await request.json();

  if (!idpenerimaan || !status || !idpengadaan || !iduser) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    await pool.execute(
      'CALL UpdatePenerimaan(?, ?, ?, ?)',
      [idpenerimaan, status, idpengadaan, iduser]
    );

    return NextResponse.json({ message: 'Penerimaan updated successfully' });
  } catch (error) {
    console.error('Error updating penerimaan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idpenerimaan = params.id;

  if (!idpenerimaan) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    await pool.execute(
      'CALL DeletePenerimaan(?)',
      [idpenerimaan]
    );

    return NextResponse.json({ message: 'Penerimaan deleted successfully' });
  } catch (error) {
    console.error('Error deleting penerimaan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}