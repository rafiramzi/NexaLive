import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { get } from "http";

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
  streamerId?: string;
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
      messages: [{ topic: `donation-alerts-${payload.streamerId}`, event: "donation", private: false, payload }],
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

  // 4. Insert transaction
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
      status: "SUCCESS",
    });

  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

  // 5. Update wallet balance
  const { error: updateError } = await supabaseAdmin
    .from("wallet")
    .update({ balance: wallet.balance + amount })
    .eq("id", wallet.id);

  if (updateError) throw new Error(`Balance update failed: ${updateError.message}`);

  return true;
}

function getStreamer(username: string) {
  return supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .single();
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
      custom_field1: streamerUsername,
      custom_field2: donatorUserId,
      custom_field3: extraJson,
    } = body;

    // 1. Verify signature
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

    // 3. Guard against test pings / missing streamer
    if (!streamerUsername) {
      console.warn("[Webhook] No streamerUsername in payload — likely a test ping, skipping");
      return NextResponse.json({ received: true, processed: false, reason: "missing_streamer" });
    }

    // 4. Parse custom_field3: { name, message, mediaUrl }
    //    customer_details.full_name is NOT returned by Midtrans webhook, so name is encoded here
    let donatorName = "Anonymous";
    let message: string | undefined;
    let mediaUrl: string | undefined;
    try {
      const parsed = JSON.parse(extraJson ?? "{}");
      donatorName = parsed.name || "Anonymous";
      message = parsed.message || undefined;
      mediaUrl = parsed.mediaUrl || undefined;
    } catch {
      console.warn("[Webhook] Failed to parse custom_field3:", extraJson);
    }

    const amount = Math.round(Number(gross_amount));

    // 5. Store transaction in DB
    const stored = await storeTransaction({
      orderId: order_id,
      streamerUsername,
      donatorName,
      donatorUserId: donatorUserId || undefined,
      amount,
      message,
      mediaUrl,
    });

    const streamerResult = await getStreamer(streamerUsername);
    const streamerId = streamerResult.data?.id;

    if (!streamerId) {
      console.warn(`[Webhook] Streamer not found after storing transaction: ${streamerUsername}`);
    }

    // 6. Broadcast alert
    await broadcastDonation({
      user: donatorName,
      amount,
      message,
      mediaUrl,
      streamerId: streamerId || undefined, 
    });

    console.log(`[Webhook] Done — order ${order_id}, stored: ${stored}`);
    return NextResponse.json({ received: true, processed: true });

  } catch (err: any) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}