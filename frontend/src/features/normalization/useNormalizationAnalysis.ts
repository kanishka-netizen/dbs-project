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
  reset: () => void;
}

export function useNormalizationAnalysis(): UseNormalizationAnalysis {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });

  // Keeps only the most recent request in flight, so a fast typist cannot
  // render the result of a stale submission.
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (request: AnalyzeNormalizationRequest) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

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

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ status: 'idle' });
  }, []);

  return { state, analyze, reset };
}
