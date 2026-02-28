import { connectDB } from "@/app/lib/db";
import Survey from "@/app/models/Survey";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const survey = await Survey.findById(id);

  return Response.json({ survey });
}