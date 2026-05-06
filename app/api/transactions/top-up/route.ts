import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamer_username, donator_user_id, donator_name, amount, mediashare_link, message, order_id } = body;

    // 1. Find streamer
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', streamer_username)
      .single();

    if (!users) {
      return NextResponse.json({ error: 'Streamer not found' }, { status: 404 });
    }

    // 2. Verify payment status with Midtrans
    const midtransUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
      ? `https://api.midtrans.com/v2/${order_id}/status`
      : `https://api.sandbox.midtrans.com/v2/${order_id}/status`;

    const res = await fetch(midtransUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(process.env.MIDTRANS_SERVER_KEY + ':'),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error_message || 'Failed to check order status');
    }

    const validStatuses = ['settlement', 'capture'];
    if (!validStatuses.includes(data.transaction_status)) {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${data.transaction_status}` },
        { status: 400 }
      );
    }

    // 3. Find streamer wallet
    const { data: wallet } = await supabaseAdmin
      .from('wallet')
      .select('id, balance')
      .eq('user_id', users.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: 'Streamer does not have a wallet' }, { status: 404 });
    }

    // 4. Insert transaction
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        wallet_id: wallet.id,
        donator_user_id,
        donator_name,
        amount,
        mediashare_link,
        message,
        order_id: order_id,
        status: 'SUCCESS',
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction insert error:', txError);
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
    }

    // 5. Update wallet balance
    const { data: updatedWallet, error: walletError } = await supabaseAdmin
      .from('wallet')
      .update({ balance: wallet.balance + amount })
      .eq('id', wallet.id)
      .select()
      .single();

    if (walletError) {
      console.error('Wallet update error:', walletError);
      return NextResponse.json({ error: 'Failed to update wallet balance' }, { status: 500 });
    }

    return NextResponse.json({ transaction, wallet: updatedWallet });

  } catch (error) {
    console.error('Add Transactions error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}