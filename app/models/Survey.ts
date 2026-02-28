import mongoose, { Schema, model, models } from "mongoose";
import { ISurvey } from "../types/survey";

const SurveySchema = new Schema<ISurvey>(
  {
    title: String,
    description: String,
    product: String,
    rawCode: String,
    schemaJson: Object,

    versions: {
      type: [
        {
          code: { type: String },
          format: { type: String },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default models.Survey ||
  model<ISurvey>("Survey", SurveySchema);