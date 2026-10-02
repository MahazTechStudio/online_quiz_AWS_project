import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Trophy,
  Check,
  X,
} from 'lucide-react';
import type { QuizAttempt, Quiz, Question } from '@/types';
import * as api from '@/services/api';
import { formatTime, formatDate } from '@/utils/format';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import StatCard from '@/components/StatCard';
import Table from '@/components/Table';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';

export default function StudentResultDetail() {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const loadData = async () => {
    if (!attemptId) return;
    setLoading(true);
    setError(null);
    try {
      const a = await api.getAttemptById(attemptId);
      const [q, qs] = await Promise.all([
        api.getQuizById(a.quizId),
        api.getQuizQuestions(a.quizId),
      ]);
      setAttempt(a);
      setQuiz(q);
      setQuestions(qs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load result.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [attemptId]);

  const computed = (() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    questions.forEach((q) => {
      if (attempt === null) return;
      const selected = attempt.answers[q.id];
      if (selected === undefined) {
        unanswered += 1;
      } else if (selected === q.correctOption) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });
    return { correct, incorrect, unanswered };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <div className="space-y-6">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-dark-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <Alert variant="error" title="Unable to load result" onClose={() => setError(null)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error ?? 'Attempt not found.'}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/student/dashboard')}
              >
                Back to Dashboard
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

  const passed = attempt.percentage >= 60;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-10 text-white shadow-lg overflow-hidden relative">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mt-6">{quiz.title}</h1>
        <p className="text-white/80 mt-1 text-sm sm:text-base">
          Attempt submitted on {formatDate(attempt.submittedAt)}
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left">
            <p className="text-sm text-white/80 mb-1 font-medium">Final Score</p>
            <h2 className="text-5xl font-extrabold tracking-tight">{attempt.score}</h2>
            <p className="text-xl text-white/90 mt-1">out of {attempt.total}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/80 mb-1 font-medium">Percentage</p>
            <h2 className="text-6xl font-black tracking-tight">{attempt.percentage}%</h2>
          </div>
          <div className="text-center md:text-right">
            <Badge variant={passed ? 'success' : 'error'} size="md" className="text-sm px-4 py-1.5">
              {passed ? (
                <span className="inline-flex items-center gap-1">
                  <Trophy className="h-4 w-4" /> Passed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Needs Review
                </span>
              )}
            </Badge>
            <p className="text-sm text-white/80 mt-3">
              <Clock className="h-4 w-4 inline mr-1 -mt-0.5" /> Time:{' '}
              {formatTime(attempt.timeTakenSecs)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Correct"
          value={computed.correct}
          accent="success"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Incorrect"
          value={computed.incorrect}
          accent="error"
          icon={<XCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Unanswered"
          value={computed.unanswered}
          accent="warning"
          icon={<HelpCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Time Taken"
          value={formatTime(attempt.timeTakenSecs)}
          accent="primary"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-dark-900 mb-4">Quiz Summary</h2>
        <Card className="overflow-hidden">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '90px' }}>#</Table.Th>
                <Table.Th>Question</Table.Th>
                <Table.Th style={{ width: '140px' }}>Status</Table.Th>
                <Table.Th>Your Answer</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {questions.map((q, i) => {
                const selected = attempt.answers[q.id];
                const isCorrect = selected === q.correctOption;
                const isAnswered = selected !== undefined;
                const userAnswer = isAnswered ? q.options[selected] : '—';
                return (
                  <Table.Tr key={q.id}>
                    <Table.Td label="#">
                      <span className="font-semibold text-slate-500">{i + 1}</span>
                    </Table.Td>
                    <Table.Td label="Question">
                      <div className="max-w-xl truncate">{q.text}</div>
                    </Table.Td>
                    <Table.Td label="Status">
                      {!isAnswered ? (
                        <Badge variant="warning" size="md">
                          <HelpCircle className="h-3.5 w-3.5 mr-1" /> Unanswered
                        </Badge>
                      ) : isCorrect ? (
                        <Badge variant="success" size="md">
                          <Check className="h-3.5 w-3.5 mr-1" /> Correct
                        </Badge>
                      ) : (
                        <Badge variant="error" size="md">
                          <X className="h-3.5 w-3.5 mr-1" /> Incorrect
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td label="Your Answer">
                      {isAnswered ? (
                        <span className="text-dark-800 truncate block max-w-xs">
                          {userAnswer}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No answer</span>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Card>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
        <Button variant="primary" onClick={() => navigate('/student/results')}>
          View All Results
        </Button>
      </div>
    </div>
  );
}
