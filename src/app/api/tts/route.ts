/**
 * ElevenLabs TTS endpoint.
 *
 * POST { text: string, voiceId?: string } → audio/mpeg
 *
 * - Returns the synthesized MP3 directly (so the client can stream into <audio>)
 * - Caches in-process by md5(voiceId + text) — most messages are static demo
 *   content, so cache hit rate is high
 * - Returns 503 when ELEVENLABS_API_KEY is missing so the client can gracefully
 *   render the voice icon as inactive
 */

import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createHash } from "node:crypto";

// Default to "Adam" — a warm, slightly low masculine voice that reads
// as the kind of person you'd want as your Sand Hill concierge.
const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

declare global {
  // eslint-disable-next-line no-var
  var __ttsCache: Map<string, Buffer> | undefined;
}
const cache: Map<string, Buffer> =
  globalThis.__ttsCache ||
  (globalThis.__ttsCache = new Map<string, Buffer>());

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    text?: string;
    voiceId?: string;
  };
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "TTS not configured (no ELEVENLABS_API_KEY)" },
      { status: 503 },
    );
  }

  const voiceId = body.voiceId || DEFAULT_VOICE_ID;
  const cacheKey = createHash("md5").update(`${voiceId}:${text}`).digest("hex");
  const cached = cache.get(cacheKey);
  if (cached) {
    return audioResponse(cached);
  }

  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    const audio = (await client.textToSpeech.convert(voiceId, {
      text,
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
    })) as unknown;

    const buf = await audioToBuffer(audio);
    cache.set(cacheKey, buf);
    return audioResponse(buf);
  } catch (err) {
    console.error("[/api/tts] ElevenLabs call failed", err);
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 500 },
    );
  }
}

/**
 * Coerce whatever the ElevenLabs SDK returns into a Node Buffer.
 * Versions return either: ReadableStream<Uint8Array>, async iterable of chunks,
 * Uint8Array, Buffer, or a Blob-like with arrayBuffer().
 */
async function audioToBuffer(audio: unknown): Promise<Buffer> {
  if (!audio) throw new Error("empty TTS response");

  if (Buffer.isBuffer(audio)) return audio;
  if (audio instanceof Uint8Array) return Buffer.from(audio);

  // Web ReadableStream — has getReader()
  const maybeStream = audio as { getReader?: () => ReadableStreamDefaultReader<Uint8Array> };
  if (typeof maybeStream.getReader === "function") {
    const reader = maybeStream.getReader();
    const chunks: Buffer[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  }

  // Async iterable
  const maybeAsyncIter = audio as { [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array> };
  if (typeof maybeAsyncIter[Symbol.asyncIterator] === "function") {
    const chunks: Buffer[] = [];
    for await (const chunk of audio as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // Blob-like
  const maybeBlob = audio as { arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof maybeBlob.arrayBuffer === "function") {
    return Buffer.from(await maybeBlob.arrayBuffer());
  }

  throw new Error("unexpected ElevenLabs response shape");
}

function audioResponse(buf: Buffer): NextResponse {
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buf.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// Health check / quick capability probe for the client.
export async function GET() {
  return NextResponse.json({
    available: Boolean(process.env.ELEVENLABS_API_KEY),
    voiceId: DEFAULT_VOICE_ID,
    model: MODEL_ID,
  });
}
