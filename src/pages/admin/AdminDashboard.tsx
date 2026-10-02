import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Globe,
  Users,
  Percent,
  TrendingUp,
} from 'lucide-react';
import * as api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import type { AdminDashboardStats } from '@/types';
import StatCard from '@/components/StatCard';
import { Card, CardHeader, CardBody } from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import Alert from '@/components/Alert';
import { SkeletonRow } from '@/components/Skeleton';
import Table from '@/components/Table';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'error' | 'slate' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score > 0) return 'error';
  return 'slate';
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  useAuth(); // verify auth
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const maxWeekly = Math.max(1, ...(stats?.weeklyAttempts ?? [0]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-900">Admin Dashboard</h1>
      <p className="mt-1 text-slate-500">
        Overview of quiz activity across the platform.
      </p>

      {error && (
        <div className="mt-6">
          <Alert variant="error" title="Error loading dashboard" onClose={() => setError(null)}>
            {error}
            <div className="mt-3">
              <Button size="sm" variant="primary" onClick={loadStats}>
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {loading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SkeletonRow columns={2} className="!border-0 !px-0 !py-0 !gap-0">
              </SkeletonRow>
              <div className="mt-3">
                <div className="h-8 w-24 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Quizzes"
              value={stats.totalQuizzes}
              icon={<ClipboardList className="h-5 w-5" />}
              accent="primary"
            />
            <StatCard
              title="Published Quizzes"
              value={stats.publishedQuizzes}
              icon={<Globe className="h-5 w-5" />}
              accent="success"
            />
            <StatCard
              title="Total Attempts"
              value={stats.totalAttempts}
              icon={<Users className="h-5 w-5" />}
              accent="secondary"
            />
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              icon={<Percent className="h-5 w-5" />}
              accent="warning"
            />
          </>
        ) : null}
      </div>

      <section className="mt-10 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Recent Quiz Activity"
              subtitle="Attempts and averages per quiz"
            />
            <CardBody>
              {loading && !stats ? (
                <div className="space-y-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} columns={4} />
                  ))}
                </div>
              ) : stats && stats.recentActivity.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="h-10 w-10" />}
                  title="No quiz activity yet."
                  description="Once students start taking quizzes, activity will appear here."
                  action={
                    <Button variant="primary" onClick={() => navigate('/admin/quizzes/new')}>
                      Create a Quiz
                    </Button>
                  }
                />
              ) : stats ? (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Quiz</Table.Th>
                      <Table.Th>Attempts</Table.Th>
                      <Table.Th>Avg Score</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {stats.recentActivity.map((activity) => (
                      <Table.Tr key={activity.quizId}>
                        <Table.Td>{activity.quizTitle}</Table.Td>
                        <Table.Td>{activity.attempts}</Table.Td>
                        <Table.Td>
                          <Badge variant={getScoreBadgeVariant(activity.avgScore)}>
                            {activity.avgScore}%
                          </Badge>
                        </Table.Td>
                        <Table.Td label="Actions">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/quizzes/${activity.quizId}`)}
                          >
                            Manage
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : null}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Attempts Last 7 Days"
            />
            <CardBody>
              {loading && !stats ? (
                <div className="flex items-end gap-2 h-48 mt-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex-1 w-full flex items-end">
                        <div
                          className="bg-slate-200 w-full rounded-t-md animate-pulse"
                          style={{ height: `${30 + Math.random() * 60}%` }}
                        />
                      </div>
                      <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : stats ? (
                <div className="flex items-end gap-2 h-48 mt-4">
                  {stats.weeklyAttempts.map((count, i) => {
                    const pct = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="flex-1 w-full flex items-end">
                          <div
                            className={cn(
                              'bg-primary-500 hover:bg-primary-600 transition w-full rounded-t-md relative group',
                              pct === 0 && 'bg-slate-200 hover:bg-slate-200'
                            )}
                            style={{ height: `${Math.max(pct, 2)}%` }}
                            title={`${count} attempts`}
                          >
                            {count > 0 && (
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-dark-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                                {count}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{DAY_LABELS[i]}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
