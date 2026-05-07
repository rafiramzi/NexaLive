import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import jwt from 'jsonwebtoken';


export async function POST(req: NextRequest) {
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
      const body = await req.json();
      const { 
            layout_type,
            bg_color,
            card_color,
            button_color,
            shadow_color,
            theme_mode,
        } = body;


    // 1. Find streamer
    const { data: preference, error: prefError } = await supabaseAdmin
      .from('theme_preference')
      .select('*')
      .eq('user_id', decoded.id)
      .single();

    // 2. Update or insert preference
    const newConfig = {
      layout_type,
      bg_color,
      card_color,
      button_color,
      shadow_color,
      theme_mode,
    };

    let updatedPreference;
    if (preference) {
      const { data, error } = await supabaseAdmin
        .from('theme_preference')
        .update({
            layout_type,
            bg_color,
            card_color,
            shadow_color,
            theme_mode,
         })
        .eq('user_id', decoded.id)
        .single();
      if (error) {
        console.error('DB error:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
      }
      updatedPreference = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('theme_preference')
        .insert({ 
            user_id: decoded.id, 
            layout_type,
            bg_color,
            card_color,
            shadow_color,
            theme_mode,
         })
        .single();
      if (error) {
        console.error('DB error:', error);
        return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
      }
      updatedPreference = data;
    }

    // 3. Return updated preference
    return NextResponse.json({ preference: "Updated successfully" });


  } catch (error) {
    console.error('Add Transactions error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}