import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamer_username, donator_user_id, donator_name, amount, mediashare_link, message} = body;

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', streamer_username)
      .single();

     if (!users) {
        return NextResponse.json({ error: 'Streamer not found' }, { status: 404 });
      }

      const { data: wallet } = await supabaseAdmin
      .from('wallet')
      .select('id, balance')
      .eq('user_id', users?.id)
      .single();

     if (!wallet) {
        return NextResponse.json({ error: 'Streamer does not have a wallet' }, { status: 404 });
      }

    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .insert(
        { 
            wallet_id: wallet.id,
            donator_user_id,
            donator_name,
            amount,
            mediashare_link,
            message
        }
      )
      .select()
      .single();

    const {data: updatedWallet, error: walletError} = await supabaseAdmin
      .from('wallet')
      .update({ balance: wallet.balance + amount })
      .eq('id', wallet.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ transactions:"Transaction recorded successfully" });
  } catch (error) {
    console.error('Add Transactions error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

