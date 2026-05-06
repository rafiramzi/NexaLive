import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';


export async function GET(req: NextRequest) {
  try {
    const param = req.nextUrl.pathname.split('/').pop();

    if (!param) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: quick_amount_preference, error: userError } = await supabaseAdmin
      .from('quick_amount_preference')
      .select('*')
      .eq('user_id', param)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found : ' + param + " : " + userError.message }, { status: 404 });
    }

    return NextResponse.json({ quick_amount_preference: quick_amount_preference ?? null });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}