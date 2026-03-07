import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Survey from "../../../../models/Survey";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { code, format } = await req.json();

    // ✅ Update rawCode + format directly on the survey document
    // AND push to versions history — single DB call
    await Survey.findByIdAndUpdate(id, {
      $set: {
        rawCode: code,
        format: format,
      },
      $push: {
        versions: {
          code,
          format,
          createdAt: new Date(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}