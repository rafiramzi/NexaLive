// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
    };

    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}