/**
 * Failure notice with a retry affordance.
 *
 * A schema that cannot be analysed is *not* an error — the backend answers
 * 200 with `valid: false` for that. This is for the cases where the request
 * never got an answer: the backend is down, or the network dropped.
 */
export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="notice-error flex flex-wrap items-center justify-between gap-3"
      role="alert"
    >
      <p className="min-w-0 flex-1">{message}</p>

      {onRetry && (
        <button type="button" className="btn-secondary no-print" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
