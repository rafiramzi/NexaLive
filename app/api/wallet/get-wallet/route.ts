import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const { data: wallet, error } = await supabaseAdmin
      .from('wallet')
      .select(`
        *,
        bank_name (
          id,
          bank_name
        )
      `)
      .eq('user_id', decoded.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ wallet: wallet ?? null });
  } catch (error) {
    console.error('Fetch wallet error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}