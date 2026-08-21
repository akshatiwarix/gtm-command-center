import { NextResponse } from "next/server";
import { ACCOUNTS, SIGNALS, AS_OF_DATE } from "@/data/corpus";
import { runCommandCenter } from "@/lib/command-center";
import { CommandCenterResultSchema, type CommandCenterResult } from "@/lib/domain/result";

let cached: CommandCenterResult | null = null;

function getCommandCenterResult(): CommandCenterResult {
  if (!cached) {
    const computed = runCommandCenter(ACCOUNTS, SIGNALS, AS_OF_DATE, new Date().toISOString());
    cached = CommandCenterResultSchema.parse(computed);
  }
  return cached;
}

/** No auth, no persistence, no rate limit, no input to validate. */
export async function GET() {
  return NextResponse.json(getCommandCenterResult());
}
