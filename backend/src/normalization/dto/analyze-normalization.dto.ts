export class AnalyzeNormalizationDto {
  relationName: string;

  attributes: string[];

  functionalDependencies: {
    left: string[];
    right: string[];
  }[];

  multivaluedDependencies?: {
    left: string[];
    right: string[];
  }[];
}