import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    product: String,
    rawCode: String,
    format: { type: String, default: "xml" },
    schemaJson: mongoose.Schema.Types.Mixed,
    coverImage: String,  // ✅ MUST BE HERE
    versions: [
      {
        code: String,
        format: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Survey ||
  mongoose.model("Survey", SurveySchema);