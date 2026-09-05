import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);

  return NextResponse.json({
    ok: supabaseConfigured && openaiConfigured,
    service: "ZORD API",
    imageGeneration: openaiConfigured ? "configured" : "missing OPENAI_API_KEY",
    supabase: supabaseConfigured ? "configured" : "missing Supabase environment variables",
    timestamp: new Date().toISOString(),
  });
}
