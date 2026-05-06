import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';


export async function GET(req: NextRequest) {
  try {
    const param = req.nextUrl.pathname.split('/').pop();

    if (!param) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', param)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: user ?? null });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}