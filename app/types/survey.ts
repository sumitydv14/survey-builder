export interface ISurveyVersion {
  code: string;
  format: string;
  createdAt?: Date;
}

export interface ISurvey {
  title: string;
  description: string;
  product: string;
  rawCode?: string;
  schemaJson?: any;
  coverImage?: string;
  versions?: ISurveyVersion[];
}