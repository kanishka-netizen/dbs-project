import type {
  AnalyzeNormalizationRequest,
  NormalizationResponse,
} from '../types/normalization';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Thrown when the backend is unreachable or answers with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * `POST /normalization/analyze`
 *
 * Note that an *invalid schema* is not an error: the backend answers `200` with
 * `valid: false` and a list of problems. Only transport and server faults throw.
 */
export async function analyzeNormalization(
  request: AnalyzeNormalizationRequest,
  signal?: AbortSignal,
): Promise<NormalizationResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/normalization/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause;
    }

    throw new ApiError(
      'Could not reach the analysis service. Is the backend running on port 3001?',
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `The analysis service responded with ${response.status} ${response.statusText}.`,
      response.status,
    );
  }

  return (await response.json()) as NormalizationResponse;
}
