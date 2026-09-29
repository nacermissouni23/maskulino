import { NextResponse } from "next/server";
import { sendTestPush, pushConfigured } from "@/lib/push-server";

/** Admin taps "Tester" → a real background push lands on all subscribed devices. */
export async function POST() {
  if (!pushConfigured()) {
    return NextResponse.json({ error: "vapid_missing" }, { status: 500 });
  }
  const r = await sendTestPush();
  return NextResponse.json(r);
}
