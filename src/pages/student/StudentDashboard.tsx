import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Percent, Clock, BookOpenCheck, Trophy, ArrowRight } from 'lucide-react';
import type { DashboardStats, Quiz, QuizAttempt } from '@/types';
import * as api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { getGreeting, formatDate } from '@/utils/format';
import Button from '@/components/Button';
import StatCard from '@/components/StatCard';
import QuizCard from '@/components/QuizCard';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import { SkeletonCard, SkeletonRow } from '@/components/Skeleton';
import Alert from '@/components/Alert';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    available: 0,
    completed: 0,
    avgScore: 0,
    upcoming: 0,
  });
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [s, q, a] = await Promise.all([
        api.getDashboardStats(user.id),
        api.getAvailableQuizzes(user.id),
        api.getStudentResults(user.id),
      ]);
      setStats(s);
      setQuizzes(q);
      setAttempts(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const recentAttempts = attempts.slice(0, 3);
  const previewQuizzes = quizzes.slice(0, 6);

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">
          {getGreeting()}, {user?.name.split(' ')[0]}.
        </h1>
        <p className="text-slate-500 mt-1">Ready for your next quiz?</p>
      </div>

      {error && (
        <div className="mt-6">
          <Alert
            variant="error"
            onClose={() => setError(null)}
            title="Unable to load dashboard"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline-primary" onClick={loadData}>
                Try again
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {loading && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="space-y-0 border border-slate-200 rounded-xl bg-white overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard
              title="Available Quizzes"
              value={stats.available}
              accent="secondary"
              icon={<BookOpen className="h-5 w-5" />}
            />
            <StatCard
              title="Completed Quizzes"
              value={stats.completed}
              accent="success"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              accent="primary"
              icon={<Percent className="h-5 w-5" />}
            />
            <StatCard
              title="Upcoming"
              value={stats.upcoming || '—'}
              accent="warning"
              icon={<Clock className="h-5 w-5" />}
            />
          </div>

          <section className="mt-10">
            <h2 className="text-lg sm:text-xl font-semibold text-dark-900 mb-4">
              Available Quizzes
            </h2>
            {quizzes.length === 0 ? (
              <EmptyState
                icon={<BookOpenCheck className="h-10 w-10" />}
                title="No available quizzes"
                description="Quizzes will appear here once published by your instructors."
                action={
                  <Button variant="primary" onClick={() => navigate('/student/quizzes')}>
                    Browse Quizzes
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {previewQuizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onStart={() => navigate(`/student/quizzes/${quiz.id}`)}
                    />
                  ))}
                </div>
                {quizzes.length > 6 && (
                  <Button
                    variant="outline-primary"
                    className="mt-4"
                    onClick={() => navigate('/student/quizzes')}
                  >
                    View All Quizzes <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {quizzes.length <= 6 && (
                  <Button
                    variant="outline-primary"
                    className="mt-4"
                    onClick={() => navigate('/student/quizzes')}
                  >
                    View All Quizzes
                  </Button>
                )}
              </>
            )}
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-semibold text-dark-900">
                Recent Results
              </h2>
              <Link
                to="/student/results"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {attempts.length === 0 ? (
              <EmptyState
                icon={<Trophy className="h-10 w-10" />}
                title="Haven't taken any quizzes yet"
                description="Complete a quiz to see your results here."
                action={
                  <Button variant="primary" onClick={() => navigate('/student/quizzes')}>
                    Start Your First Quiz
                  </Button>
                }
              />
            ) : (
              <>
                <Card className="overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {recentAttempts.map((attempt) => {
                      const attemptQuiz = quizzes.find((q) => q.id === attempt.quizId);
                      return (
                        <div
                          key={attempt.id}
                          className="p-4 hover:bg-slate-50 transition sm:mx-0 sm:rounded-none sm:px-6"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <BookOpenCheck className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-semibold text-dark-900 truncate">
                                  {attemptQuiz?.title ?? `Quiz ${attempt.quizId}`}
                                </div>
                                <div className="text-sm text-slate-500 mt-0.5">
                                  {formatDate(attempt.submittedAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6 ml-8 sm:ml-0">
                              <div className="text-right">
                                <Badge
                                  variant={attempt.percentage >= 60 ? 'success' : 'error'}
                                  size="md"
                                >
                                  {attempt.percentage}%
                                </Badge>
                                <div className="text-xs text-slate-500 mt-1">
                                  {attempt.score}/{attempt.total} Score
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/student/results/${attempt.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Button
                  variant="outline-primary"
                  fullWidth
                  className="mt-4 sm:inline-block sm:w-auto sm:fullWidth-none"
                  onClick={() => navigate('/student/results')}
                >
                  View All Results
                </Button>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
