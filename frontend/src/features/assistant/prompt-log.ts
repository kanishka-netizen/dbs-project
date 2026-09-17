export type PromptLogType =
  | 'analysis'
  | 'normalization'
  | 'verification'
  | 'generation';

export interface PromptLogEntry {
  id: string;
  timestamp: string;
  prompt: string;
  type: PromptLogType;
}

/**
 * Prompt history used by the Automatic Normalization Assistant.
 *
 * These entries represent the analysis operations requested during
 * normalization rather than conversations with an external AI service.
 */
export const PROMPT_LOG: PromptLogEntry[] = [
  {
    id: 'prompt-1',
    timestamp: '2026-09-17T10:00:00.000Z',
    prompt:
      'Analyze the relation and determine its highest normal form using the provided dependencies.',
    type: 'analysis',
  },
  {
    id: 'prompt-2',
    timestamp: '2026-09-17T10:01:00.000Z',
    prompt:
      'Identify all candidate keys for the given relation.',
    type: 'analysis',
  },
  {
    id: 'prompt-3',
    timestamp: '2026-09-17T10:02:00.000Z',
    prompt:
      'Check whether the relation satisfies 1NF, 2NF, 3NF and BCNF.',
    type: 'verification',
  },
  {
    id: 'prompt-4',
    timestamp: '2026-09-17T10:03:00.000Z',
    prompt:
      'Identify the functional dependency violations responsible for the current normal form.',
    type: 'verification',
  },
  {
    id: 'prompt-5',
    timestamp: '2026-09-17T10:04:00.000Z',
    prompt:
      'Check the relation for 4NF and 5NF violations using the provided multivalued dependencies.',
    type: 'verification',
  },
  {
    id: 'prompt-6',
    timestamp: '2026-09-17T10:05:00.000Z',
    prompt:
      'Generate a step-by-step normalization path showing each decomposition and the reason for it.',
    type: 'normalization',
  },
  {
    id: 'prompt-7',
    timestamp: '2026-09-17T10:06:00.000Z',
    prompt:
      'Generate the final normalized schema after applying the required decomposition.',
    type: 'generation',
  },
];

export function getPromptLog(): PromptLogEntry[] {
  return PROMPT_LOG;
}