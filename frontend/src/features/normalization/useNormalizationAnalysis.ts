import { useCallback, useRef, useState } from 'react';

import { ApiError, analyzeNormalization } from '../../lib/api';
import type {
  AnalyzeNormalizationRequest,
  NormalizationResponse,
} from '../../types/normalization';

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; response: NormalizationResponse }
  | { status: 'error'; message: string };

export interface UseNormalizationAnalysis {
  state: AnalysisState;
  analyze: (request: AnalyzeNormalizationRequest) => Promise<void>;
  /** Re-submits the last request — the network can fail for reasons that are not the schema's fault. */
  retry: () => Promise<void>;
  reset: () => void;
}

export function useNormalizationAnalysis(): UseNormalizationAnalysis {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });

  // Keeps only the most recent request in flight, so a fast typist cannot
  // render the result of a stale submission.
  const abortRef = useRef<AbortController | null>(null);

  // Remembered so a failed request can be retried without retyping the schema.
  const lastRequestRef = useRef<AnalyzeNormalizationRequest | null>(null);

  const analyze = useCallback(async (request: AnalyzeNormalizationRequest) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    lastRequestRef.current = request;

    setState({ status: 'loading' });

    try {
      const response = await analyzeNormalization(request, controller.signal);

      setState({ status: 'success', response });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        return;
      }

      setState({
        status: 'error',
        message:
          cause instanceof ApiError
            ? cause.message
            : 'Something went wrong while analysing the schema.',
      });
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  const retry = useCallback(async () => {
    const lastRequest = lastRequestRef.current;

    if (!lastRequest) {
      return;
    }

    await analyze(lastRequest);
  }, [analyze]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    lastRequestRef.current = null;
    setState({ status: 'idle' });
  }, []);

  return { state, analyze, retry, reset };
}
