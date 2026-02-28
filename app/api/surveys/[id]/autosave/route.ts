import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Survey from "../../../../models/Survey";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await context.params;
  const { code, format } = await req.json();

  await Survey.findByIdAndUpdate(id, {
    $push: {
      versions: {
        code,
        format,
        createdAt: new Date(),
      },
    },
  });

  return NextResponse.json({ success: true });
}