import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';


export async function GET(req: NextRequest) {
  try {
    const param = req.nextUrl.pathname.split('/').pop();

    if (!param) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', param)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: preference, error: prefError } = await supabaseAdmin
      .from('theme_preference')
      .select('*')
      .eq('user_id', param)
      .single();

    if (prefError) {
      console.error('DB error:', prefError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    return NextResponse.json({ preference: preference ?? null });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}