import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, amount, message, mediaUrl } = body;

    if (!name || !amount) {
      return NextResponse.json({ error: "name and amount are required" }, { status: 400 });
    }

    const orderId = `donation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
      },
      // Simpan metadata di custom_field agar bisa dipakai saat webhook
      custom_field1: message ?? "",
      custom_field2: mediaUrl ?? "",
      custom_field3: name,
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (err: any) {
    console.error("[Midtrans] create-transaction error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}