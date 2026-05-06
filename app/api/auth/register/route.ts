import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // cek email sudah ada
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert(
        { 
            username, 
            email, 
            password: hashedPassword ,
            is_active: true,
            created_at: new Date().toISOString()
        })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}