import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, HelpCircle, ArrowUp, ArrowDown, Pencil, Trash2, ChevronLeft,
} from 'lucide-react';
import * as api from '@/services/api';
import { cn } from '@/utils/cn';
import type { Quiz, Question, Category, Difficulty, QuizStatus } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import RadioGroup from '@/components/RadioGroup';
import { Card, CardHeader, CardBody } from '@/components/Card';
import Alert from '@/components/Alert';
import EmptyState from '@/components/EmptyState';
import { SkeletonRow } from '@/components/Skeleton';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Breadcrumb from '@/components/Breadcrumb';

type RadioOption = { value: string | number; label: string };
type BreadcrumbItem = { label: string; to?: string; onClick?: () => void };

const CATEGORY_OPTIONS: Category[] = [
  'Cloud Computing',
  'AWS Fundamentals',
  'Networking',
  'Database',
  'Computer Science',
  'Serverless',
];

const DIFFICULTY_OPTIONS: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const STATUS_OPTIONS: RadioOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

interface EditingQuestion {
  open: boolean;
  isNew: boolean;
  question?: Question;
}

interface QuestionForm {
  id?: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface QuestionErrors {
  text?: string;
  options?: Record<number, string>;
  correctOption?: string;
}

const AdminQuizEditor = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const isNew = quizId === 'new' || !quizId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [savedQuiz, setSavedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [durationMins, setDurationMins] = useState<number | ''>(30);
  const [attemptsAllowed, setAttemptsAllowed] = useState<number | ''>(1);
  const [status, setStatus] = useState<QuizStatus>('draft');

  const [validation, setValidation] = useState<{
    title?: string; category?: string; durationMins?: string;
  }>({});

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [editing, setEditing] = useState<EditingQuestion>({ open: false, isNew: true });
  const [qForm, setQForm] = useState<QuestionForm>({
    text: '', options: ['', '', '', ''], correctOption: 0, explanation: '',
  });
  const [qErrors, setQErrors] = useState<QuestionErrors>({});
  const [qSaveLoading, setQSaveLoading] = useState(false);

  const [deleteQOpen, setDeleteQOpen] = useState(false);
  const [deleteQTarget, setDeleteQTarget] = useState<Question | null>(null);
  const [deleteQLoading, setDeleteQLoading] = useState(false);

  const [saveDraftOpen, setSaveDraftOpen] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);

  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null);

  const [discardOpen, setDiscardOpen] = useState(false);
  const navBackTarget = '/admin/quizzes';

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Quiz Management', onClick: () => handleNavBack() },
    { label: isNew ? 'New Quiz' : 'Edit Quiz' },
  ], [isNew, unsavedChanges, discardOpen]);

  useEffect(() => {
    if (!isNew && quizId) {
      loadQuiz(quizId);
    }
  }, [isNew, quizId]);

  useEffect(() => {
    if (!isNew && !loading) {
      setUnsavedChanges(true);
    } else if (isNew && !loading && (title || description || questions.length > 0)) {
      setUnsavedChanges(true);
    }
  }, [title, description, category, difficulty, durationMins, attemptsAllowed, status, questions.length, isNew, loading, savedQuiz]);

  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  const loadQuiz = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [q, qs] = await Promise.all([
        api.getQuizById(id),
        api.getQuizQuestions(id),
      ]);
      setSavedQuiz(q);
      setTitle(q.title);
      setDescription(q.description);
      setCategory(q.category);
      setDifficulty(q.difficulty);
      setDurationMins(q.durationMins);
      setAttemptsAllowed(q.attemptsAllowed);
      setStatus(q.status);
      setQuestions(qs);
      setUnsavedChanges(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quiz.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavBack = () => {
    if (unsavedChanges) {
      setDiscardOpen(true);
    } else {
      navigate(navBackTarget);
    }
  };

  const validateQuizForm = (forPublish: boolean): { ok: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Quiz title is required.';
    if (!category) errors.category = 'Please select a category.';
    if (durationMins === '' || Number(durationMins) < 1) {
      errors.durationMins = 'Duration must be at least 1 minute.';
    }
    if (forPublish && questions.length === 0) {
      errors.questions = 'Cannot publish a quiz without questions. Please add at least one question.';
    }
    return { ok: Object.keys(errors).length === 0, errors };
  };

  const buildQuizPatch = (statusOverride?: QuizStatus) => ({
    title: title.trim(),
    description: description.trim(),
    category: category as Category,
    difficulty,
    durationMins: Number(durationMins) || 30,
    attemptsAllowed: Number(attemptsAllowed) || 1,
    questionCount: questions.length,
    status: statusOverride ?? status,
  });

  const saveQuizInstance = async (desiredStatus?: QuizStatus) => {
    const patch = buildQuizPatch(desiredStatus);
    const quizPayload = {
      ...patch,
      id: isNew ? undefined : savedQuiz?.id,
      questions,
    };
    const saved = await api.createQuiz(quizPayload);
    setSavedQuiz(saved);
    return saved;
  };

  const handleSaveDraftConfirm = async () => {
    if (saveDraftLoading) return;
    setSaveDraftLoading(true);
    setError(null);
    try {
      const { ok, errors } = validateQuizForm(false);
      if (!ok) {
        setValidation({
          title: errors.title,
          category: errors.category,
          durationMins: errors.durationMins,
        });
        throw new Error('Please fill in all required fields before saving.');
      }
      setValidation({});
      await saveQuizInstance('draft');
      setUnsavedChanges(false);
      setSuccessToast('Quiz saved as draft.');
      setSaveDraftOpen(false);
      setTimeout(() => navigate(navBackTarget), 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save quiz.';
      setError(message);
    } finally {
      setSaveDraftLoading(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (publishLoading) return;
    setPublishLoading(true);
    setError(null);
    try {
      const { ok, errors } = validateQuizForm(true);
      if (!ok) {
        setPublishErrors(Object.values(errors));
        setValidation({
          title: errors.title,
          category: errors.category,
          durationMins: errors.durationMins,
        });
        return;
      }
      setPublishErrors(null);
      setValidation({});
      await saveQuizInstance('published');
      setUnsavedChanges(false);
      setSuccessToast('Quiz published successfully.');
      setPublishConfirmOpen(false);
      setTimeout(() => navigate(navBackTarget), 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish quiz.';
      setError(message);
    } finally {
      setPublishLoading(false);
    }
  };

  const openQuestionEditor = (existing?: Question) => {
    if (existing) {
      setEditing({ open: true, isNew: false, question: existing });
      setQForm({
        id: existing.id,
        text: existing.text,
        options: [...existing.options],
        correctOption: existing.correctOption,
        explanation: existing.explanation ?? '',
      });
    } else {
      setEditing({ open: true, isNew: true });
      setQForm({
        text: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
      });
    }
    setQErrors({});
  };

  const closeQuestionEditor = () => {
    setEditing({ open: false, isNew: true });
  };

  const validateQuestion = (): { ok: boolean; errors: QuestionErrors; summary: string[] } => {
    const errors: QuestionErrors = {};
    const summary: string[] = [];
    if (!qForm.text.trim()) {
      errors.text = 'Question text is required.';
      summary.push('Question text is required');
    }
    const optErrors: Record<number, string> = {};
    qForm.options.forEach((opt, i) => {
      if (!opt.trim()) {
        optErrors[i] = `Option ${String.fromCharCode(65 + i)} is required.`;
        summary.push(`Option ${String.fromCharCode(65 + i)} is required`);
      }
    });
    if (Object.keys(optErrors).length > 0) errors.options = optErrors;
    if (typeof qForm.correctOption !== 'number' || qForm.correctOption < 0 || qForm.correctOption > 3 || !qForm.options[qForm.correctOption]?.trim()) {
      errors.correctOption = 'A valid correct answer must be selected.';
      summary.push('A correct answer must be selected');
    }
    return { ok: summary.length === 0, errors, summary };
  };

  const handleQuestionSave = async () => {
    setQSaveLoading(true);
    const { ok, errors } = validateQuestion();
    if (!ok) {
      setQErrors(errors);
      setQSaveLoading(false);
      return;
    }
    setQErrors({});
    try {
      const questionPayload = {
        text: qForm.text.trim(),
        options: qForm.options.map((o) => o.trim()),
        correctOption: qForm.correctOption,
        explanation: qForm.explanation.trim() || undefined,
      };

      if (editing.isNew) {
        const newQ: Question = {
          id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          quizId: savedQuiz?.id || 'new',
          ...questionPayload,
        };
        setQuestions((prev) => [...prev, newQ]);
      } else if (editing.question) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editing.question!.id
              ? { ...q, ...questionPayload }
              : q
          )
        );
      }
      closeQuestionEditor();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save question.';
      setError(message);
    } finally {
      setQSaveLoading(false);
    }
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    setQuestions((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const confirmDeleteQuestion = (q: Question) => {
    setDeleteQTarget(q);
    setDeleteQOpen(true);
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQTarget) return;
    setDeleteQLoading(true);
    try {
      setQuestions((prev) => prev.filter((q) => q.id !== deleteQTarget.id));
      setDeleteQOpen(false);
      setDeleteQTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete question.';
      setError(message);
    } finally {
      setDeleteQLoading(false);
    }
  };

  const correctAnswerOptions: RadioOption[] = [
    { value: 0, label: `A. ${qForm.options[0] || 'Option A'}` },
    { value: 1, label: `B. ${qForm.options[1] || 'Option B'}` },
    { value: 2, label: `C. ${qForm.options[2] || 'Option C'}` },
    { value: 3, label: `D. ${qForm.options[3] || 'Option D'}` },
  ];

  if (loading && !isNew) {
    return (
      <div>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonRow key={i} columns={2} />
          ))}
        </div>
      </div>
    );
  }

  // Layout adapts via CSS responsive classes

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems as any} className="mb-4" />
        <div className="flex items-center gap-2 mb-2 sm:hidden">
          <Button
            size="sm"
            variant="ghost"
            aria-label="Back"
            onClick={handleNavBack}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-dark-900">
          {isNew ? 'Create Quiz' : 'Edit Quiz'}
        </h1>
        <p className="mt-1 text-slate-500">
          {isNew
            ? 'Configure quiz details and add questions.'
            : 'Modify quiz details or manage its questions.'}
        </p>
      </div>

      {successToast && (
        <div className="mb-6">
          <Alert variant="success" onClose={() => setSuccessToast(null)}>
            {successToast}
          </Alert>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="Quiz Details" />
        <CardBody>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Quiz Title"
                required
                placeholder="e.g. AWS Cloud Practitioner Certification Prep"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={validation.title}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                rows={3}
                placeholder="Describe what the quiz covers."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Select
              label="Category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              error={validation.category}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select
              label="Difficulty"
              required
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              label="Duration (minutes)"
              required
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value === '' ? '' : Number(e.target.value))}
              error={validation.durationMins}
            />
            <Input
              type="number"
              min={1}
              label="Attempts Allowed"
              value={attemptsAllowed}
              onChange={(e) => setAttemptsAllowed(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <div className="md:col-span-2">
              <div className="block text-sm font-medium text-dark-800 mb-2">Status</div>
              <RadioGroup
                name="quiz-status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => setStatus(v as QuizStatus)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Questions</h3>
              <p className="mt-1 text-sm text-slate-500">
                {questions.length} question{questions.length !== 1 ? 's' : ''} added
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => openQuestionEditor()}
            >
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {questions.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="h-10 w-10" />}
              title="No questions yet."
              description="Add your first multiple-choice question."
            />
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <Card key={q.id} className="border-slate-200">
                  <CardBody>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary-100 text-primary-700 text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <p className="truncate font-medium text-dark-900">{q.text}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm text-slate-500">
                          {q.options.map((opt, j) => (
                            <div
                              key={j}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded-md border',
                                j === q.correctOption
                                  ? 'border-success-300 bg-success-50'
                                  : 'border-slate-200 bg-slate-50'
                              )}
                            >
                              <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-white border text-xs font-semibold flex-shrink-0">
                                {String.fromCharCode(65 + j)}
                              </span>
                              <span
                                className={cn(
                                  j === q.correctOption && 'text-success-700 font-medium',
                                  'truncate min-w-0'
                                )}
                              >
                                {opt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Move Up"
                          disabled={i === 0}
                          onClick={() => moveQuestion(i, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Move Down"
                          disabled={i === questions.length - 1}
                          onClick={() => moveQuestion(i, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => openQuestionEditor(q)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Delete"
                          className="!text-error-600"
                          onClick={() => confirmDeleteQuestion(q)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div
        className={cn(
          'sticky bottom-4 z-20 rounded-xl border border-slate-200 bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 mt-10'
        )}
      >
        <div className="text-sm text-slate-500">
          Remember to save before leaving. Unsaved changes will be lost.
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            disabled={saveDraftLoading || publishLoading}
            onClick={() => setSaveDraftOpen(true)}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            disabled={publishLoading || saveDraftLoading}
            onClick={() => {
              const { errors } = validateQuizForm(true);
              setPublishErrors(Object.keys(errors).length > 0 ? Object.values(errors) : null);
              setPublishConfirmOpen(true);
            }}
          >
            Publish Quiz
          </Button>
        </div>
      </div>

      <Modal
        open={editing.open}
        onClose={() => {
          if (!qSaveLoading) closeQuestionEditor();
        }}
        size="xl"
        title={editing.isNew ? 'Add Question' : 'Edit Question'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeQuestionEditor}
              disabled={qSaveLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleQuestionSave}
              loading={qSaveLoading}
            >
              Save Question
            </Button>
          </>
        }
      >
        {Object.keys(qErrors).length > 0 && (() => {
          const { summary } = validateQuestion();
          return (
            <Alert variant="error" title="Please fix the following errors:" className="mb-4">
              <ul className="list-disc pl-5 space-y-1">
                {summary.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Alert>
          );
        })()}

        <div>
          <Textarea
            label="Question"
            required
            rows={3}
            placeholder="Enter the question text."
            value={qForm.text}
            onChange={(e) => setQForm((p) => ({ ...p, text: e.target.value }))}
            error={qErrors.text}
            className="mb-4"
          />

          <div className="grid md:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <Input
                key={idx}
                label={`Option ${String.fromCharCode(65 + idx)}`}
                required
                value={qForm.options[idx]}
                onChange={(e) => {
                  const opts = [...qForm.options];
                  opts[idx] = e.target.value;
                  setQForm((p) => ({ ...p, options: opts }));
                }}
                error={qErrors.options?.[idx]}
              />
            ))}
          </div>

          <div className="mt-4">
            <div className="block text-sm font-semibold text-dark-800 mb-2">
              Correct Answer <span className="text-error-500">*</span>
            </div>
            <RadioGroup
              variant="default"
              options={correctAnswerOptions}
              value={qForm.correctOption}
              onChange={(v) => setQForm((p) => ({ ...p, correctOption: v as number }))}
            />
            {qErrors.correctOption && (
              <div className="mt-1 text-sm text-error-600 flex items-center gap-1">
                {qErrors.correctOption}
              </div>
            )}
          </div>

          <div className="mt-4">
            <Textarea
              label="Explanation (optional)"
              rows={2}
              placeholder="Explain why the answer is correct. Shown to students after submission if enabled."
              value={qForm.explanation}
              onChange={(e) => setQForm((p) => ({ ...p, explanation: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        open={deleteQOpen}
        onCancel={() => {
          if (!deleteQLoading) {
            setDeleteQOpen(false);
            setDeleteQTarget(null);
          }
        }}
        onConfirm={handleDeleteQuestion}
        title="Delete Question?"
        description="This question will be removed from the quiz."
        confirmVariant="danger"
        confirmText="Delete Question"
        confirmLoading={deleteQLoading}
        icon="danger"
      />

      <ConfirmationDialog
        open={saveDraftOpen}
        onCancel={() => {
          if (!saveDraftLoading) setSaveDraftOpen(false);
        }}
        onConfirm={handleSaveDraftConfirm}
        title="Save Quiz as Draft?"
        description="The quiz will be saved but not published. Students will not see it."
        confirmVariant="primary"
        confirmText="Save Draft"
        confirmLoading={saveDraftLoading}
        icon="info"
      />

      <ConfirmationDialog
        open={publishConfirmOpen}
        onCancel={() => {
          if (!publishLoading) setPublishConfirmOpen(false);
        }}
        onConfirm={handlePublishConfirm}
        title="Publish Quiz?"
        description={
          <div>
            <p className="mb-2">
              {isNew
                ? 'Students will be able to take this quiz once published.'
                : 'This will update the live quiz.'}
            </p>
            {publishErrors && publishErrors.length > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-error-50 border border-error-200 text-error-800 text-sm">
                <p className="font-semibold mb-1">Cannot publish:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {publishErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        }
        confirmVariant="success"
        confirmText="Publish Quiz"
        confirmLoading={publishLoading}
        icon="warning"
      />

      <ConfirmationDialog
        open={discardOpen}
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => navigate(navBackTarget)}
        title="Discard unsaved changes?"
        description="You have unsaved changes that will be lost if you navigate away."
        confirmVariant="danger"
        confirmText="Discard Changes"
        cancelText="Stay on Page"
        icon="warning"
      />
    </div>
  );
};

export default AdminQuizEditor;
