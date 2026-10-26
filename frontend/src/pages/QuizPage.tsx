
import { useMemo, useState } from 'react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { GATE_QUESTIONS, type QuizQuestion } from '../features/quiz/questions';

type Difficulty = 'Easy' | 'Medium' | 'Hard';


export function QuizPage() {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

const availableQuestions = useMemo(() => {
  const matching = GATE_QUESTIONS.filter(
    (question) => question.difficulty === difficulty,
  );

  return [...matching].sort(() => Math.random() - 0.5);
}, [difficulty]); 

  const currentQuestion = questions[currentIndex];

  const score = questions.reduce(
    (total, question) =>
      total + (answers[question.id] === question.correctAnswerIndex ? 1 : 0),
    0,
  );

  function startQuiz() {
  const selected = availableQuestions.slice(0, questionCount);

  if (selected.length === 0) return;

  setQuestions(selected);
  setAnswers({});
  setCurrentIndex(0);
  setSelectedAnswer(null);
  setFinished(false);
  setStarted(true);
}
  function submitAnswer() {
    if (selectedAnswer === null || !currentQuestion) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: selectedAnswer,
    }));
  }

  function nextQuestion() {
    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
  }

  function restart() {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setSelectedAnswer(null);
  }

  const alreadyAnswered =
    currentQuestion !== undefined &&
    answers[currentQuestion.id] !== undefined;

  const percentage = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title="DBMS QUIZ"
        subtitle="Test your database management knowledge, one question at a time."
        ownedBy="Team 1"
      />

      {!started ? (
        <section className="card-padded mx-auto max-w-2xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Configure your quiz
          </h2>

          <div>
            <label
              htmlFor="question-count"
              className="mb-2 block text-sm font-medium"
            >
              Number of questions
            </label>
            <select
              id="question-count"
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"
            >
              {[5, 10, 15, 20, 25, 30, 40].map((count) => (
                <option key={count} value={count}>
                  {count} questions
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
            {availableQuestions.length} questions are available at the selected difficulty.
The quiz will use up to your selected number of questions.
</p>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium">Difficulty</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                  className={`rounded-lg border p-4 font-semibold transition-colors ${
                    difficulty === level
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="btn-primary w-full"
            onClick={startQuiz}
            disabled={GATE_QUESTIONS.length === 0}
          >
            Start Quiz
          </button>
        </section>
      ) : finished ? (
        <section className="card-padded mx-auto max-w-2xl space-y-5 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quiz complete!
          </h2>
          <p className="text-5xl font-bold text-brand-600 dark:text-brand-400">
            {score}/{questions.length}
          </p>
          <p className="text-lg">{percentage}% correct</p>
          <p className="text-slate-600 dark:text-slate-400">
            {percentage >= 80
              ? 'Excellent work! You have a strong grasp of these topics.'
              : percentage >= 50
                ? 'Good effort! Review the explanations to strengthen your understanding.'
                : 'Keep practising! Review the solutions and try again.'}
          </p>
          <button type="button" className="btn-primary" onClick={restart}>
            Try Again
          </button>
        </section>
      ) : currentQuestion ? (
        <section className="card-padded mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <span className="badge-info text-xs">{difficulty}</span>
            <span className="text-sm text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentQuestion.text}
          </h2>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={`${currentQuestion.id}-${index}`}
                type="button"
                disabled={alreadyAnswered}
                onClick={() => setSelectedAnswer(index)}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                  selectedAnswer === index
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'
                }`}
              >
                <span className="font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>

          {alreadyAnswered && (
            <div
              className={`rounded-lg border p-4 ${
                answers[currentQuestion.id] === currentQuestion.correctAnswerIndex
                  ? 'border-green-500/40 bg-green-500/5'
                  : 'border-red-500/40 bg-red-500/5'
              }`}
            >
              <p className="font-semibold">
                {answers[currentQuestion.id] === currentQuestion.correctAnswerIndex
                  ? 'Yes, you have correctly answered the question.'
                  : 'Yet to answer correctly.'}
              </p>
              <p className="mt-2 text-sm">
                <strong>Correct answer:</strong>{' '}
                {currentQuestion.options[currentQuestion.correctAnswerIndex]}
              </p>
              <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            {!alreadyAnswered ? (
              <button
                type="button"
                className="btn-primary"
                disabled={selectedAnswer === null}
                onClick={submitAnswer}
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={nextQuestion}
              >
                {currentIndex === questions.length - 1
                  ? 'View Results'
                  : 'Next Question'}
              </button>
            )}
          </div>
        </section>
      ) : null}
    </PageContainer>
  );
}
