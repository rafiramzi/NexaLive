import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
      messages: [{ topic: "donation-alerts", event: "donation", private: false, payload }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Broadcast failed: ${res.status} ${text}`);
  }
}

async function storeTransaction({
  orderId,
  streamerUsername,
  donatorName,
  donatorUserId,
  amount,
  message,
  mediaUrl,
}: {
  orderId: string;
  streamerUsername: string;
  donatorName: string;
  donatorUserId?: string;
  amount: number;
  message?: string;
  mediaUrl?: string;
}) {
  // 1. Prevent duplicate processing (idempotency)
  const { data: existing } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    console.log(`[Webhook] Duplicate skipped — order ${orderId}`);
    return false;
  }

  // 2. Look up streamer
  const { data: streamer } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", streamerUsername)
    .single();

  if (!streamer) throw new Error(`Streamer not found: ${streamerUsername}`);

  // 3. Look up wallet
  const { data: wallet } = await supabaseAdmin
    .from("wallet")
    .select("id, balance")
    .eq("user_id", streamer.id)
    .single();

  if (!wallet) throw new Error(`Wallet not found for streamer: ${streamerUsername}`);

  // 4. Atomic insert + balance update
 const { error: insertError } = await supabaseAdmin
    .from("transactions")
    .insert({
      wallet_id: wallet.id,
      donator_user_id: donatorUserId || null,
      donator_name: donatorName,
      amount,
      mediashare_link: mediaUrl ?? null,
      message: message ?? null,
      order_id: orderId,
    });

  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
  return true;
}

// Production

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
      custom_field4: streamerUsername, // 👈 add this when creating Midtrans transaction
      custom_field5: donatorUserId, // 👈 add this when creating Midtrans transaction
    } = body;

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

    // 2. Only process successful payments
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (!isSuccess) {
      console.log(`[Webhook] Skipped — status: ${transaction_status}`);
      return NextResponse.json({ received: true, processed: false });
    }

    const amount = Math.round(Number(gross_amount));
    const donatorName = name ?? "Anonymous";

    // 3. Store transaction in DB
    const stored = await storeTransaction({
      orderId: order_id,
      streamerUsername,
      donatorName,
      donatorUserId,
      amount,
      message: message || undefined,
      mediaUrl: mediaUrl || undefined,
    });

    // 4. Broadcast alert (even if duplicate — alert may not have fired)
    await broadcastDonation({
      user: donatorName,
      amount,
      message: message || undefined,
      mediaUrl: mediaUrl || undefined,
    });

    console.log(`[Webhook] Done — order ${order_id}, stored: ${stored}`);
    return NextResponse.json({ received: true, processed: true });

  } catch (err: any) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}


// export async function POST(req: NextRequest) {
//   console.log("MIDTRANS WEBHOOK HIT");

//   try {
//     const body = await req.json();
//     console.log("[Webhook] Full body:", JSON.stringify(body, null, 2));

//     const {
//       order_id,
//       status_code,
//       gross_amount,
//       signature_key,
//       transaction_status,
//       fraud_status,
//       custom_field1: message,
//       custom_field2: mediaUrl,
//       custom_field3: name,
//       custom_field4: streamerUsername,
//       custom_field5: donatorUserId,
//     } = body;

//     console.log("[Webhook] Parsed fields:", {
//       order_id,
//       status_code,
//       gross_amount,
//       transaction_status,
//       fraud_status,
//       name,
//       streamerUsername,
//       donatorUserId,
//     });

//     // 1. Verify signature
//     // const isValid = verifySignature(
//     //   order_id,
//     //   status_code,
//     //   gross_amount,
//     //   process.env.MIDTRANS_SERVER_KEY!,
//     //   signature_key
//     // );
//     // console.log("[Webhook] Signature valid:", isValid);

//     // if (!isValid) {
//     //   console.warn("[Webhook] Invalid signature:", order_id);
//     //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//     // }

//     // 2. Check payment status
//     const isSuccess =
//       transaction_status === "settlement" ||
//       (transaction_status === "capture" && fraud_status === "accept");

//     console.log("[Webhook] isSuccess:", isSuccess, { transaction_status, fraud_status });

//     if (!isSuccess) {
//       console.log(`[Webhook] Skipped — status: ${transaction_status}`);
//       return NextResponse.json({ received: true, processed: false });
//     }

//     const amount = Math.round(Number(gross_amount));
//     const donatorName = name ?? "Anonymous";

//     // 3. Store transaction
//     console.log("[Webhook] Storing transaction...");
//     const stored = await storeTransaction({
//       orderId: order_id,
//       streamerUsername,
//       donatorName,
//       donatorUserId,
//       amount,
//       message: message || undefined,
//       mediaUrl: mediaUrl || undefined,
//     });
//     console.log("[Webhook] Transaction stored:", stored);

//     // 4. Broadcast
//     console.log("[Webhook] Broadcasting...");
//     await broadcastDonation({
//       user: donatorName,
//       amount,
//       message: message || undefined,
//       mediaUrl: mediaUrl || undefined,
//     });
//     console.log("[Webhook] Broadcast done");

//     return NextResponse.json({ received: true, processed: true });

//   } catch (err: any) {
//     console.error("[Webhook] Unhandled error:", err);
//     return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
//   }
// }