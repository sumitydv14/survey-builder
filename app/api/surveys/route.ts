import { connectDB } from  "../../lib/db";
import Survey from '../../models/Survey';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      title,
      description,
      product,
      coverImage,
      schemaJson,
    } = body;

    if (!title) {
      return Response.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const survey = await Survey.create({
      title,
      description,
      product,
      coverImage,
      schemaJson,
    });

    return Response.json({ survey });
  } catch (error: any) {
    console.error("Survey create error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();

  const surveys = await Survey.find().sort({ createdAt: -1 });

  return Response.json({ surveys });
}