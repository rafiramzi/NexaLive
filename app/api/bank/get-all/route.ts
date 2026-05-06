import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {

    const { data: bank_name, error: bankError } = await supabaseAdmin
      .from('bank_name')
      .select('*')
      .eq('is_active', true)
      .order('bank_name', { ascending: true });

    if (bankError) {
      return NextResponse.json({ error: 'Bank names not found' }, { status: 404 });
    }

    return NextResponse.json({ bank_name: bank_name });
  } catch (error) {
    console.error('Fetch bank names error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}