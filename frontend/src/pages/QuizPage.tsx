import { useState } from 'react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { GATE_QUESTIONS, type QuizQuestion } from '../features/quiz/questions';

export function QuizPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (showResults) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    return GATE_QUESTIONS.reduce((score, q) => {
      return score + (selectedAnswers[q.id] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="GATE Previous Year Questions"
        subtitle="Test your knowledge on Functional Dependencies and Normalization with authentic GATE questions."
        ownedBy="Team 1 — TLE"
      />

      <div className="space-y-8">
        {GATE_QUESTIONS.map((q: QuizQuestion, index: number) => {
          const selectedOption = selectedAnswers[q.id];
          const isCorrect = selectedOption === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              className="card-padded relative flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="badge-info text-xs">{q.year}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Question {index + 1} of {GATE_QUESTIONS.length}
                </span>
              </div>

              <p className="text-base font-medium text-slate-900 dark:text-white">
                {q.text}
              </p>

              <div className="grid gap-2">
                {q.options.map((opt, optIndex) => {
                  let buttonStyle =
                    'border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900';

                  if (selectedOption === optIndex) {
                    buttonStyle =
                      'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold';
                  }

                  if (showResults) {
                    if (optIndex === q.correctAnswerIndex) {
                      buttonStyle =
                        'border-ok-500 bg-ok-500/20 text-ok-700 dark:text-ok-300 font-semibold';
                    } else if (selectedOption === optIndex && !isCorrect) {
                      buttonStyle =
                        'border-danger-500 bg-danger-500/20 text-danger-700 dark:text-danger-300 font-semibold';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={showResults}
                      onClick={() => handleOptionSelect(q.id, optIndex)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors ${buttonStyle}`}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div
                  className={`mt-4 rounded-lg p-4 text-sm ${
                    isCorrect
                      ? 'border border-ok-500/40 bg-ok-500/5 text-ok-800 dark:text-ok-200'
                      : 'border border-danger-500/40 bg-danger-500/5 text-danger-800 dark:text-danger-200'
                  }`}
                >
                  <p className="font-semibold">
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                  </p>
                  <p className="mt-1 text-xs">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer actions / submission */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 sm:flex-row dark:border-slate-800">
          <div>
            {showResults && (
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Your Score: {calculateScore()} / {GATE_QUESTIONS.length}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {!showResults ? (
              <button
                type="button"
                className="btn-primary"
                disabled={Object.keys(selectedAnswers).length === 0}
                onClick={() => setShowResults(true)}
              >
                Submit Answers
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
