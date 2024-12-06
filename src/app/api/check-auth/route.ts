import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET)
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error('Invalid token:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}