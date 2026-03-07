import { connectDB } from "../../lib/db";
import Survey from "../../models/Survey";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Ensure rawCode is saved properly — never fall through to undefined
    const surveyData = {
      ...body,
      rawCode: body.rawCode && body.rawCode.trim()
        ? body.rawCode
        : "<survey>\n</survey>",
      format: body.format || "xml",
    };

    const survey = await Survey.create(surveyData);
    return Response.json({ survey });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  const surveys = await Survey.find().sort({ createdAt: -1 });
  return Response.json({ surveys });
}