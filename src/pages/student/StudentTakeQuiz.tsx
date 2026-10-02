import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PlayCircle,
  Clock,
  BookOpenCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Check,
  Send,
} from "lucide-react";
import type { Quiz, Question, Difficulty } from "@/types";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import cn from "@/utils/cn";
import { formatTime } from "@/utils/format";
import Button from "@/components/Button";
import Card, { CardHeader, CardBody } from "@/components/Card";
import Badge from "@/components/Badge";
import ProgressBar from "@/components/ProgressBar";
import Timer from "@/components/Timer";
import RadioGroup from "@/components/RadioGroup";
import StatCard from "@/components/StatCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Alert from "@/components/Alert";
import { SkeletonCard } from "@/components/Skeleton";

type Step = "instructions" | "take" | "review" | "submitting";

const DIFFICULTY_VARIANT: Record<string, "primary" | "warning" | "error"> = {
  Beginner: "primary",
  Intermediate: "warning",
  Advanced: "error",
};

export default function StudentTakeQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [step, setStep] = useState<Step>("instructions");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalSeconds = useMemo(
    () => (quiz ? quiz.durationMins * 60 : 0),
    [quiz],
  );

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => answers[k] !== undefined).length,
    [answers],
  );
  const unansweredCount = questions.length - answeredCount;
  const progressPct =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  // Reserved for future low-time warning feature

  const loadData = useCallback(async () => {
    if (!quizId) return;
    setLoading(true);
    setError(null);
    try {
      const [q, qs] = await Promise.all([
        api.getQuizById(quizId),
        api.getQuizQuestions(quizId),
      ]);
      setQuiz(q);
      setQuestions(qs);
      setTimeRemaining(q.durationMins * 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const autoSubmit = useCallback(async () => {
    if (!user || !quizId || submitting || step === "submitting") return;
    setStep("submitting");
    setSubmitting(true);
    try {
      const timeTaken = Math.max(0, totalSeconds - timeRemaining);
      const attempt = await api.submitQuizAttempt(
        user.id,
        quizId,
        { ...answers },
        timeTaken,
      );
      navigate(`/student/results/${attempt.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit quiz.");
      setStep("review");
      setSubmitting(false);
    }
  }, [
    user,
    quizId,
    totalSeconds,
    timeRemaining,
    answers,
    navigate,
    submitting,
    step,
  ]);

  useEffect(() => {
    if (step !== "take") return;
    if (timeRemaining <= 0) {
      autoSubmit();
      return;
    }
    const t = window.setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [step, timeRemaining, autoSubmit]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (step === "take" || step === "review") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [step]);

  const setAnswer = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    if (!user || !quizId) return;
    setStep("submitting");
    setSubmitting(true);
    try {
      const timeTaken = Math.max(0, totalSeconds - timeRemaining);
      const attempt = await api.submitQuizAttempt(
        user.id,
        quizId,
        { ...answers },
        timeTaken,
      );
      navigate(`/student/results/${attempt.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit quiz.");
      setStep("review");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-dark-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-6">
        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-dark-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Link>
        <Alert
          variant="error"
          title="Unable to load quiz"
          onClose={() => setError(null)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error ?? "Quiz not found."}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate("/student/quizzes")}
              >
                Back to Quizzes
              </Button>
              <Button size="sm" variant="outline-primary" onClick={loadData}>
                Retry
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {step === "instructions" && (
        <div className="space-y-6">
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-dark-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Quizzes
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 leading-tight">
              {quiz.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3 mb-6">
              <Badge variant="slate" size="md">
                <BookOpenCheck className="h-3.5 w-3.5 mr-1" />
                {questions.length} Questions
              </Badge>
              <Badge variant="cyan" size="md">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {quiz.durationMins} Minutes
              </Badge>
              <Badge variant="amber" size="md">
                Multiple Choice
              </Badge>
              <Badge
                variant={DIFFICULTY_VARIANT[quiz.difficulty as Difficulty]}
                size="md"
              >
                {quiz.difficulty}
              </Badge>
            </div>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
              {quiz.description}
            </p>
          </div>

          <Card>
            <CardHeader title="How this assessment works" />
            <CardBody>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>Select one answer for each question.</li>
                <li>Review your answers before submitting.</li>
                <li>Once submitted, the attempt will be recorded.</li>
                <li>Your score will be calculated automatically.</li>
              </ul>
            </CardBody>
          </Card>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Questions</p>
              <p className="text-2xl font-bold text-dark-900 mt-2">
                {questions.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Time limit</p>
              <p className="text-2xl font-bold text-dark-900 mt-2">
                {quiz.durationMins} min
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">
                Attempts allowed
              </p>
              <p className="text-2xl font-bold text-dark-900 mt-2">
                {quiz.attemptsAllowed}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<PlayCircle className="h-5 w-5" />}
              onClick={() => setStep("take")}
            >
              Start Quiz
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/student/quizzes")}
            >
              Back to Quizzes
            </Button>
          </div>
        </div>
      )}

      {step === "take" && (
        <div className="space-y-6">
          <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-0 sm:static">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-dark-900 truncate max-w-full sm:max-w-[55%]">
                {quiz.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-slate-500">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <Timer
                  secondsRemaining={timeRemaining}
                  totalSeconds={totalSeconds}
                />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={progressPct}
                showLabel
                size="md"
                color="primary"
              />
            </div>
          </div>

          <Card className="p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-dark-900 mb-6 whitespace-pre-wrap leading-relaxed">
              {questions[currentQuestionIdx]?.text}
            </h3>
            {questions[currentQuestionIdx] && (
              <RadioGroup
                variant="quiz"
                options={questions[currentQuestionIdx].options.map(
                  (opt, i) => ({
                    value: i,
                    label: opt,
                  }),
                )}
                value={
                  answers[questions[currentQuestionIdx].id] !== undefined
                    ? answers[questions[currentQuestionIdx].id]
                    : -1
                }
                onChange={(v) =>
                  setAnswer(questions[currentQuestionIdx].id, v as number)
                }
              />
            )}
          </Card>

          <Card className="p-4">
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Question Navigator
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((q, i) => {
                const isCurrent = i === currentQuestionIdx;
                const isAnswered = answers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(i)}
                    type="button"
                    aria-label={
                      isCurrent
                        ? `Question ${i + 1} (current)`
                        : `Go to question ${i + 1}${isAnswered ? ", answered" : ""}`
                    }
                    className={cn(
                      "relative rounded-md h-10 w-10 text-sm font-medium transition flex items-center justify-center",
                      isCurrent
                        ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                        : isAnswered
                          ? "bg-success-100 text-success-700 border border-success-200 font-semibold hover:bg-success-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {isAnswered && !isCurrent ? (
                      <span className="flex items-center gap-0.5">
                        {i + 1}
                        <Check className="h-3 w-3 ml-0.5" />
                      </span>
                    ) : (
                      i + 1
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-primary-600" />{" "}
                Current
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-success-100 border border-success-300" />{" "}
                Answered ✓
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-slate-100" />{" "}
                Unanswered
              </span>
            </div>
          </Card>

          <div className="flex justify-between gap-3">
            <Button
              variant="secondary"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            {currentQuestionIdx === questions.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                leftIcon={<ClipboardCheck className="h-5 w-5" />}
                onClick={() => setStep("review")}
              >
                Review Answers
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() =>
                  setCurrentQuestionIdx((i) =>
                    Math.min(questions.length - 1, i + 1),
                  )
                }
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">
              Review Your Answers
            </h1>
            <p className="text-slate-500 mt-1">
              Check your answers before final submission.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <StatCard
              title="Answered"
              value={answeredCount}
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              title="Unanswered"
              value={unansweredCount}
              icon={<AlertCircle className="h-5 w-5" />}
              accent="warning"
            />
            <StatCard
              title="Time Remaining"
              value={formatTime(timeRemaining)}
              icon={<Clock className="h-5 w-5" />}
              accent="primary"
            />
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader title="All Questions" />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {questions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const answerIdx = answers[q.id];
                    const answerText =
                      isAnswered && q.options[answerIdx]
                        ? q.options[answerIdx].length > 60
                          ? `${q.options[answerIdx].slice(0, 57)}…`
                          : q.options[answerIdx]
                        : "";
                    return (
                      <div
                        key={q.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setCurrentQuestionIdx(i);
                          setStep("take");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setCurrentQuestionIdx(i);
                            setStep("take");
                          }
                        }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-6 -mx-6 sm:mx-0 sm:rounded-lg cursor-pointer hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded-lg"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {isAnswered ? (
                            <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-warning-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-dark-900">
                              Question {i + 1}
                            </div>
                            <div className="text-sm text-slate-600 truncate mt-0.5">
                              {q.text}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-8 sm:ml-0 flex-shrink-0">
                          {isAnswered ? (
                            <>
                              <Badge variant="success">Answered</Badge>
                              <span className="text-xs text-slate-500 hidden sm:inline">
                                Selected: {answerText}
                              </span>
                            </>
                          ) : (
                            <Badge variant="warning">Unanswered</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            <Button variant="secondary" onClick={() => setStep("take")}>
              Return to Quiz
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Send className="h-5 w-5" />}
              onClick={() => setShowSubmitConfirm(true)}
            >
              Submit Quiz
            </Button>
          </div>

          <ConfirmationDialog
            open={showSubmitConfirm}
            onCancel={() => setShowSubmitConfirm(false)}
            onConfirm={handleSubmit}
            title="Submit Quiz?"
            description={
              <>
                You have answered {answeredCount} of {questions.length}{" "}
                questions.{" "}
                {unansweredCount > 0 && (
                  <>
                    {unansweredCount} question{unansweredCount === 1 ? "" : "s"}{" "}
                    unanswered.{" "}
                  </>
                )}
                Once submitted, your answers cannot be changed.
              </>
            }
            confirmText="Submit Quiz"
            confirmVariant="primary"
            confirmLoading={submitting}
            icon="warning"
          />
        </div>
      )}

      {step === "submitting" && (
        <LoadingOverlay text="Submitting your quiz..." />
      )}
    </div>
  );
}
