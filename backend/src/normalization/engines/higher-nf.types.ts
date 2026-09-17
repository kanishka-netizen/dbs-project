export interface HigherNormalFormViolation {
  normalForm: '4NF' | '5NF';
  dependency: string;
  reason: string;
}

export interface HigherNormalFormRelation {
  name: string;
  attributes: string[];
  reason: string;
}

export interface HigherNormalFormResult {
  normalForms: {
    '4NF': boolean;
    '5NF': boolean;
  };

  highestNormalForm: '4NF' | '5NF' | null;

  violations: HigherNormalFormViolation[];

  decomposition: HigherNormalFormRelation[];
}