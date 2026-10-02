import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Eye, Pencil, Copy, Globe, EyeOff, Trash2, ClipboardList } from 'lucide-react';
import * as api from '@/services/api';
import { formatDate } from '@/utils/format';
import type { Quiz, Category } from '@/types';
import Button from '@/components/Button';
import SearchInput from '@/components/SearchInput';
import Select from '@/components/Select';
import Badge from '@/components/Badge';
import Alert from '@/components/Alert';
import EmptyState from '@/components/EmptyState';
import { SkeletonRow } from '@/components/Skeleton';
import Table from '@/components/Table';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const CATEGORY_OPTIONS: Category[] = [
  'Cloud Computing',
  'AWS Fundamentals',
  'Networking',
  'Database',
  'Computer Science',
  'Serverless',
];

type ConfirmAction = 'unpublish' | 'publish' | 'delete' | null;

const AdminQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmTarget, setConfirmTarget] = useState<Quiz | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quizzes.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      !search || q.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || q.category === category;
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openConfirm = (action: ConfirmAction, quiz: Quiz) => {
    setConfirmAction(action);
    setConfirmTarget(quiz);
    setConfirmOpen(true);
  };

  const handleDuplicate = async (quiz: Quiz) => {
    try {
      const copy = await api.createQuiz({
        title: `${quiz.title} (Copy)`,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        durationMins: quiz.durationMins,
        attemptsAllowed: quiz.attemptsAllowed,
        questionCount: 0,
        status: 'draft',
      });
      const questions = await api.getQuizQuestions(quiz.id);
      for (const q of questions) {
          await api.addQuestionToQuiz(copy.id, {
            text: q.text,
            options: [...q.options],
            correctOption: q.correctOption,
            explanation: q.explanation,
          });
        }
      setSuccessToast('Quiz duplicated.');
      loadQuizzes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate quiz.';
      setError(message);
    }
  };

  const handleConfirm = async () => {
    if (!confirmTarget || !confirmAction) return;
    setConfirmLoading(true);
    try {
      switch (confirmAction) {
      case 'publish':
        await api.publishQuiz(confirmTarget.id, true);
        setSuccessToast('Quiz published.');
        break;
      case 'unpublish':
        await api.publishQuiz(confirmTarget.id, false);
        setSuccessToast('Quiz unpublished.');
        break;
      case 'delete':
        await api.deleteQuiz(confirmTarget.id);
        setSuccessToast('Quiz deleted.');
        break;
      }
      loadQuizzes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed.';
      setError(message);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setConfirmAction(null);
      setConfirmTarget(null);
    }
  };

  const confirmTitle = () => {
    if (!confirmAction) return '';
    if (confirmAction === 'publish') return 'Publish Quiz?';
    if (confirmAction === 'unpublish') return 'Unpublish Quiz?';
    return 'Delete Quiz?';
  };

  const confirmDesc = () => {
    if (!confirmAction || !confirmTarget) return null;
    if (confirmAction === 'publish') {
      return 'Students will be able to take this quiz immediately.';
    }
    if (confirmAction === 'unpublish') {
      return 'Students will no longer see this quiz. Attempts will be preserved.';
    }
    return 'This action cannot be undone. All questions and results associated with this quiz will be removed.';
  };

  const confirmVariant: 'primary' | 'danger' | 'success' =
    confirmAction === 'publish'
      ? 'success'
      : confirmAction === 'delete'
      ? 'danger'
      : 'primary';

  const confirmText =
    confirmAction === 'delete' ? 'Delete Quiz' : confirmAction === 'publish' ? 'Publish' : 'Unpublish';
  const confirmIcon: 'warning' | 'danger' | 'info' =
    confirmAction === 'delete' ? 'danger' : 'warning';

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Quiz Management</h1>
          <p className="mt-1 text-slate-500">
            Create, edit, and publish assessments for students.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/admin/quizzes/new')}
        >
          Create Quiz
        </Button>
      </div>

      {successToast && (
        <div className="mt-4">
          <Alert variant="success" onClose={() => setSuccessToast(null)}>
            {successToast}
          </Alert>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
            <div className="mt-3">
              <Button size="sm" variant="primary" onClick={loadQuizzes}>
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="mt-6 mb-6 flex flex-wrap gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} columns={7} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title={quizzes.length === 0 ? 'No quizzes yet' : 'No matching quizzes'}
          description={
            quizzes.length === 0
              ? 'Create your first quiz to start assessing students.'
              : 'Try adjusting your search or filters.'
          }
          action={
            quizzes.length === 0 ? (
              <Button variant="primary" onClick={() => navigate('/admin/quizzes/new')}>
              Create Your First Quiz
            </Button>
            ) : undefined
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Quiz</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Questions</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th label="Actions">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((quiz) => (
              <Table.Tr key={quiz.id}>
                <Table.Td>
                  <div>
                    <div className="font-medium text-dark-900">{quiz.title}</div>
                    {quiz.description && (
                      <div className="text-sm text-slate-500 truncate max-w-md">
                        {quiz.description}
                      </div>
                    )}
                  </div>
                </Table.Td>
                <Table.Td>{quiz.category}</Table.Td>
                <Table.Td>{quiz.questionCount}</Table.Td>
                <Table.Td>{quiz.durationMins} min</Table.Td>
                <Table.Td>
                  <Badge variant={quiz.status === 'published' ? 'success' : 'slate'}>
                    {quiz.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </Table.Td>
                <Table.Td>{formatDate(quiz.createdAt)}</Table.Td>
                <Table.Td label="Actions">
                  <div className="flex flex-wrap gap-1 items-center justify-end sm:justify-start">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="View"
                      onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Edit"
                      onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Duplicate"
                      onClick={() => handleDuplicate(quiz)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {quiz.status === 'published' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Unpublish"
                        onClick={() => openConfirm('unpublish', quiz)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Publish"
                        onClick={() => openConfirm('publish', quiz)}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Delete"
                      className="!text-error-600"
                      onClick={() => openConfirm('delete', quiz)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
          setConfirmTarget(null);
        }}
        onConfirm={handleConfirm}
        title={confirmTitle()}
        description={confirmDesc()}
        confirmVariant={confirmVariant}
        confirmText={confirmText}
        confirmLoading={confirmLoading}
        icon={confirmIcon}
      />
    </div>
  );
};

export default AdminQuizzes;
