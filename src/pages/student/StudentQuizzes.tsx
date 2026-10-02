import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import type { Quiz, Category, Difficulty } from '@/types';
import * as api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import QuizCard from '@/components/QuizCard';
import Select from '@/components/Select';
import SearchInput from '@/components/SearchInput';
import EmptyState from '@/components/EmptyState';
import { SkeletonCard } from '@/components/Skeleton';
import Alert from '@/components/Alert';

type CategoryOption = 'All Categories' | Category;
type DifficultyOption = 'All Difficulties' | Difficulty;
type SortOption = 'recent' | 'az' | 'duration' | 'difficulty';

const CATEGORY_OPTIONS: CategoryOption[] = [
  'All Categories',
  'Cloud Computing',
  'AWS Fundamentals',
  'Networking',
  'Database',
  'Computer Science',
  'Serverless',
];

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  'All Difficulties',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Sort: Recent' },
  { value: 'az', label: 'A–Z' },
  { value: 'duration', label: 'Duration (Shortest)' },
  { value: 'difficulty', label: 'Difficulty' },
];

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

export default function StudentQuizzes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryOption>('All Categories');
  const [difficulty, setDifficulty] = useState<DifficultyOption>('All Difficulties');
  const [sort, setSort] = useState<SortOption>('recent');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const q = await api.getAvailableQuizzes(user.id);
      setQuizzes(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredQuizzes = useMemo(() => {
    let list = [...quizzes];
    const needle = search.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(needle) ||
          q.description.toLowerCase().includes(needle),
      );
    }
    if (category !== 'All Categories') {
      list = list.filter((q) => q.category === category);
    }
    if (difficulty !== 'All Difficulties') {
      list = list.filter((q) => q.difficulty === difficulty);
    }
    switch (sort) {
      case 'az':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'duration':
        list.sort((a, b) => a.durationMins - b.durationMins);
        break;
      case 'difficulty':
        list.sort(
          (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
        );
        break;
      case 'recent':
      default:
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return list;
  }, [quizzes, search, category, difficulty, sort]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setDifficulty('All Difficulties');
    setSort('recent');
  };

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">Available Quizzes</h1>
        <p className="text-slate-500 mt-1">
          Choose an assessment to test your knowledge.
        </p>
      </div>

      {error && (
        <div className="mt-6">
          <Alert variant="error" onClose={() => setError(null)} title="Unable to load quizzes">
            <div className="flex items-center justify-between flex-wrap gap-3">
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
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryOption)}
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyOption)}
            aria-label="Filter by difficulty"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort quizzes"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredQuizzes.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-10 w-10" />}
              title="No quizzes match your filters"
              description="Try adjusting the search term, category, or difficulty to find what you're looking for."
              action={
                <Button variant="primary" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStart={() => navigate(`/student/quizzes/${quiz.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
