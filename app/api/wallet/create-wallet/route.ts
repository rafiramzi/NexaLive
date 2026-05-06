import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id;


    const { user_id, bank_name_id, bank_type, cc_number, phone_number, va_number} = body;

    if (body.bank_type === 'bank') {
      if (!user_id || !bank_name_id || !bank_type || !cc_number) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
    } else {
      if (!user_id || !bank_name_id || !bank_type || !va_number) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }
    }

    const { data: existing } = await supabaseAdmin
      .from('wallet')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'User already has a wallet' }, { status: 400 });
    }
    const { data: wallet, error } = await supabaseAdmin
      .from('wallet')
      .insert(
        { 
            user_id: userId,
            bank_name_id,
            bank_type,
            phone_number : phone_number || null,
            va_number : va_number || null,
            cc_number : cc_number || null,
            balance : 0
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Add Wallet error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}