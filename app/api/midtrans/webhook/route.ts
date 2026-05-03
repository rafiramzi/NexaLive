import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean {
  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(raw).digest("hex");
  return hash === receivedSignature;
}


// Calude update
// async function broadcastDonation(payload: {
//   user: string;
//   amount: number;
//   message?: string;
//   mediaUrl?: string;
// }) {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

//   // Supabase Realtime broadcast via REST API
//   const res = await fetch(
//     `${supabaseUrl}/realtime/v1/api/broadcast`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "apikey": serviceRoleKey,
//         "Authorization": `Bearer ${serviceRoleKey}`,
//       },
//       body: JSON.stringify({
//         messages: [
//           {
//             topic: "donation-alerts",
//             event: "donation",
//             payload,
//           },
//         ],
//       }),
//     }
//   );

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Supabase broadcast failed: ${res.status} — ${text}`);
//   }

//   return res;
// }

// chatgpt update
async function broadcastDonation(payload: {
  user: string;
  amount: number;
  message?: string;
  mediaUrl?: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      messages: [
        {
          topic: "donation-alerts",
          event: "donation",
          private: false,
          payload,
        },
      ],
    }),
  });

  const text = await res.text();

  console.log("Broadcast status:", res.status);
  console.log("Broadcast response:", text);

  if (!res.ok) {
    throw new Error(`Broadcast failed: ${res.status} ${text}`);
  }
}

export async function POST(req: NextRequest) {
    console.log("MIDTRANS WEBHOOK HIT");

  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1: message,
      custom_field2: mediaUrl,
      custom_field3: name,
    } = body;

    // 1. Verifikasi signature Midtrans
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key
    );

    if (!isValid) {
      console.warn("[Webhook] Invalid signature:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Hanya proses jika pembayaran sukses
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (!isSuccess) {
      console.log(`[Webhook] Skipped — status: ${transaction_status}`);
      return NextResponse.json({ received: true, processed: false });
    }

    // 3. Broadcast via Supabase REST API
    await broadcastDonation({
      user: name ?? "Anonymous",
      amount: Math.round(Number(gross_amount)),
      message: message || undefined,
      mediaUrl: mediaUrl || undefined,
    });

    console.log(`[Webhook] Alert sent for order ${order_id} — ${name} Rp${gross_amount}`);
    return NextResponse.json({ received: true, processed: true });
  } catch (err: any) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}