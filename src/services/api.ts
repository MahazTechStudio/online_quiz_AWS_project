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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const response = await fetch(`${API_BASE_URL}/quizzes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
  }
  const rawData = await response.json();
  const quizzes: Quiz[] = Array.isArray(rawData) ? rawData.map(normalizeQuiz) : [];
  return quizzes
    .filter((q) => q.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const response = await fetch(`${API_BASE_URL}/quizzes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
  }
  const rawData = await response.json();
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

  const response = await fetch(`${API_BASE_URL}/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attempt),
  });

  if (!response.ok) {
    throw new Error(`Failed to save quiz results: ${response.statusText}`);
  }

  return attempt;
}

export async function getStudentResults(userId: string): Promise<QuizAttempt[]> {
  const response = await fetch(`${API_BASE_URL}/results`);
  if (!response.ok) {
    return [];
  }
  const attempts: QuizAttempt[] = await response.json();
  return (Array.isArray(attempts) ? attempts : [])
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function getAttemptById(id: string): Promise<QuizAttempt> {
  const response = await fetch(`${API_BASE_URL}/results`);
  if (!response.ok) {
    throw new Error('Failed to fetch results.');
  }
  const attempts: QuizAttempt[] = await response.json();
  const attempt = (Array.isArray(attempts) ? attempts : []).find((a) => a.id === id);
  if (!attempt) {
    throw new Error('Attempt not found.');
  }
  return attempt;
}

export async function getAllResults(): Promise<QuizAttempt[]> {
  const response = await fetch(`${API_BASE_URL}/results`);
  if (!response.ok) {
    return [];
  }
  const attempts: QuizAttempt[] = await response.json();
  return (Array.isArray(attempts) ? attempts : []).sort(
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
  data: Partial<Quiz> & { title: string; category: Category },
): Promise<Quiz> {
  const quiz: Quiz = {
    id: `q${Date.now()}`,
    title: data.title,
    description: data.description ?? '',
    category: data.category,
    difficulty: (data.difficulty ?? 'Beginner') as Difficulty,
    durationMins: data.durationMins ?? 30,
    attemptsAllowed: data.attemptsAllowed ?? 1,
    questionCount: data.questionCount ?? 0,
    status: (data.status ?? 'draft') as QuizStatus,
    createdAt: new Date().toISOString(),
    questions: [],
  };
  return quiz;
}

export async function updateQuiz(id: string, patch: Partial<Quiz>): Promise<Quiz> {
  const existing = await getQuizById(id);
  return { ...existing, ...patch };
}

export async function deleteQuiz(_id: string): Promise<void> { }

export async function publishQuiz(id: string, published: boolean): Promise<Quiz> {
  return updateQuiz(id, { status: published ? 'published' : 'draft' });
}

export async function addQuestionToQuiz(_quizId: string, _question: any): Promise<Question> {
  throw new Error('Not implemented');
}

export async function updateQuestion(_quizId: string, _qId: string, _patch: any): Promise<Question> {
  throw new Error('Not implemented');
}

export async function deleteQuestion(_quizId: string, _qId: string): Promise<void> { }