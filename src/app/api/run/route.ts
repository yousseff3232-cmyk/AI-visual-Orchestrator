import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await new Promise(resolve => setTimeout(resolve, 800));
  return NextResponse.json({ decision: "YES" });
}