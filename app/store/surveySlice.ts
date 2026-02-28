import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SurveyState {
  title: string;
  description: string;
  product: string;
}

const initialState: SurveyState = {
  title: "",
  description: "",
  product: "",
};

const surveySlice = createSlice({
  name: "survey",
  initialState,
  reducers: {
    setSurveyData(
      state,
      action: PayloadAction<Partial<SurveyState>>
    ) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setSurveyData } = surveySlice.actions;
export default surveySlice.reducer;