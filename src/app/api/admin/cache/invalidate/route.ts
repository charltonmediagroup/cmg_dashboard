import { NextRequest, NextResponse } from "next/server";
import { isDenied, requireAdminApi } from "@/lib/auth/adminAuth";
import { getCache } from "@/lib/cache";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireAdminApi(req);
  if (isDenied(session)) return session;

  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  const prefix = typeof body?.prefix === "string" ? body.prefix.trim() : "";

  if (!key && !prefix) {
    return NextResponse.json({ error: "key or prefix required" }, { status: 400 });
  }

  const target = prefix || key;
  const removed = await getCache().invalidate(target, { prefix: !!prefix });
  return NextResponse.json({ ok: true, removed });
}
