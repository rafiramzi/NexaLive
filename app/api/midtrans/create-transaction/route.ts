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
    const { name, amount, message, mediaUrl, streamerUsername, donatorUserId } = body;

    if (!name || !amount || !streamerUsername) {
      return NextResponse.json(
        { error: "name, amount, and streamerUsername are required" },
        { status: 400 }
      );
    }

    const orderId = `donation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      // Midtrans only supports 3 custom fields:
      // custom_field1 → streamerUsername       (required for webhook DB lookup)
      // custom_field2 → donatorUserId          (optional)
      // custom_field3 → { name, message, mediaUrl } encoded as JSON
      //
      // NOTE: customer_details.full_name is NOT returned in webhook payload,
      // so we encode the donor name inside custom_field3 instead.
      custom_field1: streamerUsername,
      custom_field2: donatorUserId ?? "",
      custom_field3: JSON.stringify({
        name: name ?? "",
        message: message ?? "",
        mediaUrl: mediaUrl ?? "",
      }),
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