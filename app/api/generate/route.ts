import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function jsonError(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, ...(code ? { code } : {}) }, { status });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("Image generation is not configured on the server. Add OPENAI_API_KEY to the deployment environment.", 503, "OPENAI_NOT_CONFIGURED");
    }

    if (!supabaseUrl || !supabaseKey) {
      return jsonError("Supabase is not configured on the server.", 503, "SUPABASE_NOT_CONFIGURED");
    }

    const authorization = req.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) {
      return jsonError("Please log in before generating an image.", 401, "AUTH_REQUIRED");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return jsonError("Your session is invalid or expired. Please log in again.", 401, "AUTH_INVALID");
    }

    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const reference = typeof body?.reference === "string" ? body.reference : "";

    if (!prompt) {
      return jsonError("Prompt is required.", 400, "PROMPT_REQUIRED");
    }
    if (prompt.length > 12000) {
      return jsonError("Prompt is too long. Keep it under 12,000 characters.", 400, "PROMPT_TOO_LONG");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let response;

    if (reference) {
      const match = reference.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/s);
      if (!match) {
        return jsonError("Reference image must be a PNG, JPEG, or WebP data URL.", 400, "INVALID_REFERENCE");
      }

      const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
      const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
      const buffer = Buffer.from(match[2], "base64");
      if (!buffer.length) {
        return jsonError("Reference image is empty.", 400, "EMPTY_REFERENCE");
      }
      if (buffer.length > 20 * 1024 * 1024) {
        return jsonError("Reference image is too large. Keep it under 20 MB.", 413, "REFERENCE_TOO_LARGE");
      }

      const file = await toFile(buffer, `reference.${extension}`, { type: mimeType });
      response = await openai.images.edit({
        model: "gpt-image-1.5",
        image: file,
        prompt,
        size: "1024x1536",
        quality: "medium",
      });
    } else {
      response = await openai.images.generate({
        model: "gpt-image-1.5",
        prompt,
        size: "1024x1536",
        quality: "medium",
      });
    }

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return jsonError("OpenAI completed the request but returned no image data.", 502, "NO_IMAGE_DATA");
    }

    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
      demo: false,
      model: "gpt-image-1.5",
      userId: userData.user.id,
    });
  } catch (error) {
    console.error("ZORD image generation error", error);

    const message = error instanceof Error ? error.message : "Image generation failed.";
    const status = typeof error === "object" && error && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;

    if (status === 401 || status === 403) {
      return jsonError("OpenAI rejected the API credentials. Check OPENAI_API_KEY in the deployment environment.", 502, "OPENAI_AUTH_ERROR");
    }
    if (status === 429) {
      return jsonError("OpenAI rate limit or quota was reached. Please try again shortly or check the API project billing/quota.", 429, "OPENAI_RATE_LIMIT");
    }

    return jsonError(message || "Image generation failed.", status >= 400 && status < 600 ? status : 500, "GENERATION_FAILED");
  }
}
