import type {
  User,
  Quiz,
  Question,
  QuizAttempt,
  DashboardStats,
  AdminDashboardStats,
  Category,
  Difficulty,
  QuizStatus,
} from '@/types';

// ---------------------------------------------------------------------------
// API BASE URL — read from VITE_API_BASE_URL environment variable.
// Set this in .env.local (see .env.example for instructions).
// ---------------------------------------------------------------------------
const _rawUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;

// Strip any accidental trailing slash so paths like /quizzes never become //quizzes
const API_BASE_URL: string | undefined =
  typeof _rawUrl === 'string' && _rawUrl.trim() !== ''
    ? _rawUrl.replace(/\/+$/, '')
    : undefined;

/**
 * Throws a clear error if the API URL is missing, so the developer knows
 * exactly what to fix instead of seeing a cryptic JSON parse error.
 */
function requireApiUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      'API base URL is not configured. ' +
      'Please copy .env.example to .env.local and set VITE_API_BASE_URL ' +
      'to your API Gateway invoke URL (e.g. https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com). ' +
      'Then restart the dev server.'
    );
  }
  return API_BASE_URL;
}

/**
 * Fetches a URL and returns parsed JSON.
 * - Checks response.ok and Content-Type before calling .json().
 * - If the server returns HTML (e.g. a redirect or error page), shows a
 *   useful message instead of a confusing JSON parse error.
 */
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (networkErr) {
    throw new Error(
      `Network error reaching ${url}. ` +
      'Check that VITE_API_BASE_URL is correct and that CORS is enabled on API Gateway. ' +
      `Detail: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    // Try to read a JSON error body; fall back to status text
    if (isJson) {
      try {
        const errBody = await response.json();
        const msg = errBody?.message ?? errBody?.error ?? JSON.stringify(errBody);
        throw new Error(`API error ${response.status}: ${msg}`);
      } catch {
        // json() itself failed — fall through
      }
    }
    throw new Error(
      `API request failed: HTTP ${response.status} ${response.statusText}. ` +
      `URL: ${url}`
    );
  }

  if (!isJson) {
    // Server returned 2xx but not JSON — almost always means wrong URL
    const preview = (await response.text()).slice(0, 120).replace(/\n/g, ' ');
    throw new Error(
      `Expected JSON from ${url} but received "${contentType || 'unknown content type'}". ` +
      `Response starts with: ${preview}. ` +
      'This usually means VITE_API_BASE_URL is wrong or the route does not exist in API Gateway.'
    );
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// AUTHENTICATION & LOCAL STORAGE HELPERS
// ---------------------------------------------------------------------------

export async function login(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const mockUsers: User[] = [
    { id: 'u1', name: 'Student User', email: 'student@university.edu', role: 'student' },
    { id: 'u2', name: 'Admin User', email: 'admin@university.edu', role: 'admin' },
  ];

  const user = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || password !== 'password123') {
    throw new Error('Invalid email or password');
  }

  const token = 'mock-jwt';

  if (typeof window !== 'undefined') {
    localStorage.setItem('qc_user', JSON.stringify(user));
    localStorage.setItem('qc_token', token);
  }

  return { user, token };
}

export async function getMe(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  try {
    const userJson = localStorage.getItem('qc_user');
    const token = localStorage.getItem('qc_token');
    if (!userJson || !token) return null;
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('qc_user');
    localStorage.removeItem('qc_token');
  }
}

// Helper to normalize backend DynamoDB quiz payload to match frontend Quiz interface
function normalizeQuiz(raw: any): Quiz {
  return {
    id: raw.id || raw.quizId || `q-${Date.now()}`,
    title: raw.title || 'Untitled Quiz',
    description: raw.description || '',
    category: (raw.category || 'General') as Category,
    difficulty: (raw.difficulty || 'Beginner') as Difficulty,
    durationMins: typeof raw.timeLimit === 'number' ? raw.timeLimit : raw.durationMins || 30,
    attemptsAllowed: raw.attemptsAllowed || 1,
    questionCount: Array.isArray(raw.questions) ? raw.questions.length : raw.questionCount || 0,
    status: (raw.status || 'published') as QuizStatus,
    createdAt: raw.createdAt || new Date().toISOString(),
    // Standardize question property names
    questions: Array.isArray(raw.questions)
      ? raw.questions.map((q: any, index: number) => ({
        id: q.id || `q-${index}`,
        quizId: raw.id || raw.quizId,
        text: q.text || q.questionText || '',
        options: q.options || [],
        correctOption: typeof q.correctOption === 'number' ? q.correctOption : q.correctAnswer || 0,
        explanation: q.explanation || '',
      }))
      : [],
  };
}

// ---------------------------------------------------------------------------
// AWS LAMBDA & DYNAMODB API INTEGRATION
// ---------------------------------------------------------------------------

// GET /quizzes -> Fetches list of quizzes from DynamoDB via Lambda
export async function getAvailableQuizzes(_userId: string): Promise<Quiz[]> {
  const base = requireApiUrl();
  const rawData = await fetchJson<unknown>(`${base}/quizzes`);
  const quizzes: Quiz[] = Array.isArray(rawData) ? rawData.map(normalizeQuiz) : [];
  return quizzes
    .filter((q) => q.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const base = requireApiUrl();
  const rawData = await fetchJson<unknown>(`${base}/quizzes`);
  const quizzes: Quiz[] = Array.isArray(rawData) ? rawData.map(normalizeQuiz) : [];
  return quizzes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getQuizById(id: string): Promise<Quiz> {
  const quizzes = await getAllQuizzes();
  const quiz = quizzes.find((q) => q.id === id);
  if (!quiz) {
    throw new Error('Quiz not found.');
  }
  return quiz;
}

export async function getQuizQuestions(quizId: string): Promise<Question[]> {
  const quiz = await getQuizById(quizId);
  return quiz.questions || [];
}

// POST /results -> Saves student quiz result into DynamoDB via Lambda
export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  answers: Record<string, number>,
  timeTakenSecs: number,
): Promise<QuizAttempt> {
  const questions = await getQuizQuestions(quizId);
  let score = 0;
  const total = questions.length;

  for (const question of questions) {
    const selectedOption = answers[question.id];
    if (selectedOption === question.correctOption) {
      score += 1;
    }
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const attempt: QuizAttempt = {
    id: `a${Date.now()}`,
    userId,
    quizId,
    answers,
    score,
    total,
    percentage,
    timeTakenSecs,
    status: 'completed',
    submittedAt: new Date().toISOString(),
  };

  const base = requireApiUrl();

  const response = await fetch(`${base}/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attempt),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const errBody = await response.json();
        throw new Error(`Failed to save quiz results: ${errBody?.message ?? errBody?.error ?? response.statusText}`);
      } catch {
        // fall through
      }
    }
    throw new Error(`Failed to save quiz results: HTTP ${response.status} ${response.statusText}`);
  }

  return attempt;
}

export async function getStudentResults(userId: string): Promise<QuizAttempt[]> {
  const base = requireApiUrl();
  const attempts = await fetchJson<unknown>(`${base}/results`);
  return (Array.isArray(attempts) ? attempts as QuizAttempt[] : [])
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function getAttemptById(id: string): Promise<QuizAttempt> {
  const base = requireApiUrl();
  const attempts = await fetchJson<unknown>(`${base}/results`);
  const attempt = (Array.isArray(attempts) ? attempts as QuizAttempt[] : []).find((a) => a.id === id);
  if (!attempt) {
    throw new Error('Attempt not found.');
  }
  return attempt;
}

export async function getAllResults(): Promise<QuizAttempt[]> {
  const base = requireApiUrl();
  const attempts = await fetchJson<unknown>(`${base}/results`);
  return (Array.isArray(attempts) ? attempts as QuizAttempt[] : []).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const attempts = await getStudentResults(userId);
  const quizzes = await getAvailableQuizzes(userId);

  const completedSet = new Set(
    attempts.filter((a) => a.status === 'completed').map((a) => a.quizId),
  );

  const available = quizzes.filter((q) => !completedSet.has(q.id)).length;
  const completed = completedSet.size;

  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const avgScore =
    completedAttempts.length > 0
      ? Math.round(
        (completedAttempts.reduce((sum, a) => sum + a.percentage, 0) /
          completedAttempts.length) *
        10,
      ) / 10
      : 0;

  return { available, completed, avgScore, upcoming: 0 };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const quizzes = await getAllQuizzes();
  const attempts = await getAllResults();

  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published').length;
  const totalAttempts = attempts.length;

  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const avgScore =
    completedAttempts.length > 0
      ? Math.round(
        (completedAttempts.reduce((sum, a) => sum + a.percentage, 0) /
          completedAttempts.length) *
        10,
      ) / 10
      : 0;

  return {
    totalQuizzes,
    publishedQuizzes,
    totalAttempts,
    avgScore,
    recentActivity: [],
    weeklyAttempts: [0, 0, 0, 0, 0, 0, totalAttempts],
  };
}

// ---------------------------------------------------------------------------
// ADMIN WRITE OPERATIONS
// ---------------------------------------------------------------------------

export async function createQuiz(
  data: Partial<Quiz> & { title: string; category: Category; questions?: Question[] },
): Promise<Quiz> {
  const base = requireApiUrl();

  const payload = {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    category: data.category,
    difficulty: data.difficulty ?? 'Beginner',
    timeLimit: data.durationMins ?? 30,
    durationMins: data.durationMins ?? 30,
    attemptsAllowed: data.attemptsAllowed ?? 1,
    status: data.status ?? 'published',
    questions: Array.isArray(data.questions)
      ? data.questions.map((q, idx) => ({
          id: q.id || `q-${idx + 1}`,
          questionText: q.text || (q as any).questionText || '',
          options: q.options || [],
          correctAnswer:
            typeof (q as any).correctAnswer === 'number'
              ? (q as any).correctAnswer
              : q.correctOption ?? 0,
          points: (q as any).points ?? 10,
        }))
      : [],
  };

  const response = await fetch(`${base}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const errBody = await response.json();
        throw new Error(errBody?.error ?? errBody?.message ?? `Failed to save quiz: ${response.statusText}`);
      } catch (err: any) {
        if (err.message && !err.message.includes('Failed to save quiz')) throw err;
      }
    }
    throw new Error(`Failed to save quiz: HTTP ${response.status} ${response.statusText}`);
  }

  const resJson = await response.json();
  const saved = resJson.quiz || resJson;
  return normalizeQuiz(saved);
}

export async function updateQuiz(id: string, patch: Partial<Quiz>): Promise<Quiz> {
  const existing = await getQuizById(id);
  const updated = { ...existing, ...patch, id };
  return createQuiz(updated as any);
}

export async function deleteQuiz(id: string): Promise<void> {
  const base = requireApiUrl();
  const response = await fetch(`${base}/quizzes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const errBody = await response.json();
        throw new Error(errBody?.error ?? errBody?.message ?? `Failed to delete quiz: ${response.statusText}`);
      } catch (err: any) {
        if (err.message && !err.message.includes('Failed to delete quiz')) throw err;
      }
    }
    throw new Error(`Failed to delete quiz: HTTP ${response.status} ${response.statusText}`);
  }
}

export async function publishQuiz(id: string, published: boolean): Promise<Quiz> {
  return updateQuiz(id, { status: published ? 'published' : 'draft' });
}

export async function addQuestionToQuiz(_quizId: string, _question: any): Promise<Question> {
  return {
    id: `q-${Date.now()}`,
    quizId: _quizId,
    text: _question.text,
    options: _question.options,
    correctOption: _question.correctOption,
    explanation: _question.explanation,
  };
}

export async function updateQuestion(_quizId: string, _qId: string, _patch: any): Promise<Question> {
  return {
    id: _qId,
    quizId: _quizId,
    text: _patch.text,
    options: _patch.options,
    correctOption: _patch.correctOption,
    explanation: _patch.explanation,
  };
}

export async function deleteQuestion(_quizId: string, _qId: string): Promise<void> { }