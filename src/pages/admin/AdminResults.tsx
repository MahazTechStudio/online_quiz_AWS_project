import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Trophy } from 'lucide-react';
import type { QuizAttempt, Quiz } from '@/types';
import * as api from '@/services/api';
import { formatDate } from '@/utils/format';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import SearchInput from '@/components/SearchInput';
import Select from '@/components/Select';
import EmptyState from '@/components/EmptyState';
import Table from '@/components/Table';
import { SkeletonRow } from '@/components/Skeleton';
import Alert from '@/components/Alert';

type SortOption = 'newest' | 'oldest' | 'score-hi' | 'score-lo';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Date (Newest)' },
  { value: 'oldest', label: 'Date (Oldest)' },
  { value: 'score-hi', label: 'Score (Highest)' },
  { value: 'score-lo', label: 'Score (Lowest)' },
];

export default function AdminResults() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [search, setSearch] = useState('');
  const [quizFilter, setQuizFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, q] = await Promise.all([
        api.getAllResults(),
        api.getAllQuizzes(),
      ]);
      setAttempts(a);
      setQuizzes(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const quizMap = useMemo(() => {
    const map = new Map<string, Quiz>();
    quizzes.forEach((q) => map.set(q.id, q));
    return map;
  }, [quizzes]);

  const studentMap = useMemo(() => {
    // In the mock, userId "u1" -> "Mahaz Khan"
    const map = new Map<string, string>();
    map.set('u1', 'Mahaz Khan');
    map.set('u2', 'Admin User');
    attempts.forEach((a) => {
      if (!map.has(a.userId)) {
        map.set(a.userId, `Student ${a.userId}`);
      }
    });
    return map;
  }, [attempts]);

  const uniqueQuizzes = useMemo(() => {
    const ids = new Set<string>();
    attempts.forEach((a) => ids.add(a.quizId));
    return Array.from(ids).map((id) => ({
      id,
      title: quizMap.get(id)?.title ?? `Quiz ${id}`,
    }));
  }, [attempts, quizMap]);

  const filteredAttempts = useMemo(() => {
    let list = [...attempts];
    const needle = search.trim().toLowerCase();
    if (needle) {
      list = list.filter((a) => {
        const q = quizMap.get(a.quizId);
        const studentName = studentMap.get(a.userId) ?? '';
        return (
          q?.title.toLowerCase().includes(needle) ||
          studentName.toLowerCase().includes(needle)
        );
      });
    }
    if (quizFilter !== 'all') {
      list = list.filter((a) => a.quizId === quizFilter);
    }
    switch (sort) {
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
        );
        break;
      case 'oldest':
        list.sort(
          (a, b) =>
            new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
        );
        break;
      case 'score-hi':
        list.sort((a, b) => b.percentage - a.percentage);
        break;
      case 'score-lo':
        list.sort((a, b) => a.percentage - b.percentage);
        break;
    }
    return list;
  }, [attempts, search, quizFilter, sort, quizMap, studentMap]);

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">Student Results</h1>
        <p className="text-slate-500 mt-1">
          View all quiz submissions and student scores.
        </p>
      </div>

      {error && (
        <div className="mt-6">
          <Alert
            variant="error"
            onClose={() => setError(null)}
            title="Unable to load results"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline-primary" onClick={loadData}>
                Try again
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-6 mb-6">
        <div className="flex-1 min-w-[220px] max-w-md">
          <SearchInput
            placeholder="Search by student or quiz..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-60">
          <Select
            value={quizFilter}
            onChange={(e) => setQuizFilter(e.target.value)}
            aria-label="Filter by quiz"
          >
            <option value="all">All Quizzes</option>
            {uniqueQuizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-52">
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort results"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading && (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} columns={6} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {attempts.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-10 w-10" />}
              title="No student results yet"
              description="Student results will appear here once quizzes have been submitted."
            />
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Quiz</Table.Th>
                  <Table.Th>Score</Table.Th>
                  <Table.Th>Percentage</Table.Th>
                  <Table.Th>Submitted</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredAttempts.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} label="No results">
                      <div className="py-8 text-center text-slate-500">
                        No results match your filters.
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredAttempts.map((attempt) => {
                    const attemptQuiz = quizMap.get(attempt.quizId);
                    const studentName = studentMap.get(attempt.userId) ?? `Student ${attempt.userId}`;
                    return (
                      <Table.Tr key={attempt.id}>
                        <Table.Td label="Student">
                          <span className="font-medium text-dark-900">
                            {studentName}
                          </span>
                        </Table.Td>
                        <Table.Td label="Quiz">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <BookOpenCheck className="h-4 w-4 text-primary-600 flex-shrink-0" />
                            <span className="font-medium text-dark-900 truncate max-w-xs">
                              {attemptQuiz?.title ?? `Quiz ${attempt.quizId}`}
                            </span>
                          </div>
                        </Table.Td>
                        <Table.Td label="Score">
                          <span className="font-medium">
                            {attempt.score}/{attempt.total}
                          </span>
                        </Table.Td>
                        <Table.Td label="Percentage">
                          <Badge
                            variant={attempt.percentage >= 60 ? 'success' : 'error'}
                            size="md"
                          >
                            {attempt.percentage}%
                          </Badge>
                        </Table.Td>
                        <Table.Td label="Submitted">
                          {formatDate(attempt.submittedAt)}
                        </Table.Td>
                        <Table.Td label="Status">
                          <Badge variant="primary" size="md">
                            Completed
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
