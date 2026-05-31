import { NextResponse } from "next/server";

import { LANGUAGE_OPTIONS } from "@/lib/languages";

export function GET() {
  return NextResponse.json({ languages: LANGUAGE_OPTIONS });
}