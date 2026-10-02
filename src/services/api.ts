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
import {
  mockUsers,
  mockQuizzes,
  mockQuestions,
  mockQuizAttempts,
} from '@/data/mockData';

let users: User[] = [...mockUsers];
let quizzes: Quiz[] = [...mockQuizzes];
let questions: Question[] = [...mockQuestions];
let quizAttempts: QuizAttempt[] = loadAttemptsFromStorage();

function loadAttemptsFromStorage(): QuizAttempt[] {
  if (typeof window === 'undefined') return [...mockQuizAttempts];
  try {
    const stored = localStorage.getItem('qc_attempts');
    if (stored) {
      return JSON.parse(stored) as QuizAttempt[];
    }
  } catch {
    // ignore parse errors
  }
  return [...mockQuizAttempts];
}

function persistAttemptsToStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('qc_attempts', JSON.stringify(quizAttempts));
  } catch {
    // ignore storage errors
  }
}

async function delay(): Promise<void> {
  const ms = 500 + Math.random() * 400;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(prefix: string): string {
  return `${prefix}${Date.now()}`;
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  await delay();

  const validEmails = ['student@university.edu', 'admin@university.edu'];
  const normalizedEmail = email.trim().toLowerCase();

  if (!validEmails.includes(normalizedEmail) || password !== 'password123') {
    throw new Error('Invalid email or password');
  }

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
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
  await delay();

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
  await delay();

  if (typeof window !== 'undefined') {
    localStorage.removeItem('qc_user');
    localStorage.removeItem('qc_token');
  }
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  await delay();

  const completedSet = new Set(
    quizAttempts
      .filter((a) => a.userId === userId && a.status === 'completed')
      .map((a) => a.quizId),
  );

  const published = quizzes.filter((q) => q.status === 'published');
  const available = published.filter((q) => !completedSet.has(q.id)).length;
  const completed = completedSet.size;

  const userAttempts = quizAttempts.filter(
    (a) => a.userId === userId && a.status === 'completed',
  );
  const avgScore =
    userAttempts.length > 0
      ? Math.round(
          (userAttempts.reduce((sum, a) => sum + a.percentage, 0) /
            userAttempts.length) *
            10,
        ) / 10
      : 0;

  return {
    available,
    completed,
    avgScore,
    upcoming: 0,
  };
}

export async function getAvailableQuizzes(_userId: string): Promise<Quiz[]> {
  await delay();
  return quizzes
    .filter((q) => q.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getQuizById(id: string): Promise<Quiz> {
  await delay();
  const quiz = quizzes.find((q) => q.id === id);
  if (!quiz) {
    throw new Error('Quiz not found.');
  }
  return quiz;
}

export async function getQuizQuestions(quizId: string): Promise<Question[]> {
  await delay();
  return questions
    .filter((q) => q.quizId === quizId)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  answers: Record<string, number>,
  timeTakenSecs: number,
): Promise<QuizAttempt> {
  await delay();

  const quizQuestions = questions.filter((q) => q.quizId === quizId);
  let score = 0;
  const total = quizQuestions.length;

  for (const question of quizQuestions) {
    const selectedOption = answers[question.id];
    if (selectedOption === question.correctOption) {
      score += 1;
    }
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const attempt: QuizAttempt = {
    id: newId('a'),
    userId,
    quizId,
    answers: { ...answers },
    score,
    total,
    percentage,
    timeTakenSecs,
    status: 'completed',
    submittedAt: new Date().toISOString(),
  };

  quizAttempts.push(attempt);
  persistAttemptsToStorage();

  return attempt;
}

export async function getStudentResults(userId: string): Promise<QuizAttempt[]> {
  await delay();
  return quizAttempts
    .filter((a) => a.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
}

export async function getAttemptById(id: string): Promise<QuizAttempt> {
  await delay();
  const attempt = quizAttempts.find((a) => a.id === id);
  if (!attempt) {
    throw new Error('Attempt not found.');
  }
  return attempt;
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  await delay();
  return [...quizzes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createQuiz(
  data: Partial<Quiz> & { title: string; category: Category },
): Promise<Quiz> {
  await delay();

  const quiz: Quiz = {
    id: newId('q'),
    title: data.title,
    description: data.description ?? '',
    category: data.category,
    difficulty: (data.difficulty ?? 'Beginner') as Difficulty,
    durationMins: data.durationMins ?? 30,
    attemptsAllowed: data.attemptsAllowed ?? 1,
    questionCount: data.questionCount ?? 0,
    status: (data.status ?? 'draft') as QuizStatus,
    createdAt: new Date().toISOString(),
  };

  quizzes.push(quiz);
  return quiz;
}

export async function updateQuiz(
  id: string,
  patch: Partial<Quiz>,
): Promise<Quiz> {
  await delay();

  const index = quizzes.findIndex((q) => q.id === id);
  if (index === -1) {
    throw new Error('Quiz not found.');
  }

  quizzes[index] = { ...quizzes[index], ...patch, id: quizzes[index].id };
  return quizzes[index];
}

export async function deleteQuiz(id: string): Promise<void> {
  await delay();

  const quizIndex = quizzes.findIndex((q) => q.id === id);
  if (quizIndex === -1) {
    throw new Error('Quiz not found.');
  }

  quizzes.splice(quizIndex, 1);
  questions = questions.filter((q) => q.quizId !== id);
}

export async function publishQuiz(
  id: string,
  published: boolean,
): Promise<Quiz> {
  await delay();
  return updateQuiz(id, { status: published ? 'published' : 'draft' });
}

export async function addQuestionToQuiz(
  quizId: string,
  question: Omit<Question, 'id' | 'quizId'>,
): Promise<Question> {
  await delay();

  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    throw new Error('Quiz not found.');
  }

  const newQuestion: Question = {
    id: newId(`${quizId}-q`),
    quizId,
    text: question.text,
    options: question.options,
    correctOption: question.correctOption,
    explanation: question.explanation,
  };

  questions.push(newQuestion);

  const updatedQuestionCount = questions.filter((q) => q.quizId === quizId).length;
  quiz.questionCount = updatedQuestionCount;

  return newQuestion;
}

export async function updateQuestion(
  _quizId: string,
  qId: string,
  patch: Partial<Question>,
): Promise<Question> {
  await delay();

  const index = questions.findIndex((q) => q.id === qId);
  if (index === -1) {
    throw new Error('Question not found.');
  }

  questions[index] = {
    ...questions[index],
    ...patch,
    id: questions[index].id,
    quizId: questions[index].quizId,
  };

  return questions[index];
}

export async function deleteQuestion(
  quizId: string,
  qId: string,
): Promise<void> {
  await delay();

  const index = questions.findIndex((q) => q.id === qId);
  if (index === -1) {
    throw new Error('Question not found.');
  }

  questions.splice(index, 1);

  const quiz = quizzes.find((q) => q.id === quizId);
  if (quiz) {
    quiz.questionCount = questions.filter((q) => q.quizId === quizId).length;
  }
}

export async function getAllResults(): Promise<QuizAttempt[]> {
  await delay();
  return [...quizAttempts].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await delay();

  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published').length;
  const totalAttempts = quizAttempts.length;

  const completedAttempts = quizAttempts.filter(
    (a) => a.status === 'completed',
  );
  const avgScore =
    completedAttempts.length > 0
      ? Math.round(
          (completedAttempts.reduce((sum, a) => sum + a.percentage, 0) /
            completedAttempts.length) *
            10,
        ) / 10
      : 0;

  const activityMap = new Map<
    string,
    { quizId: string; quizTitle: string; attempts: number; totalScore: number }
  >();

  for (const attempt of quizAttempts) {
    const quiz = quizzes.find((q) => q.id === attempt.quizId);
    if (!quiz) continue;
    const entry = activityMap.get(quiz.id) ?? {
      quizId: quiz.id,
      quizTitle: quiz.title,
      attempts: 0,
      totalScore: 0,
    };
    entry.attempts += 1;
    entry.totalScore += attempt.percentage;
    activityMap.set(quiz.id, entry);
  }

  const recentActivity = Array.from(activityMap.values())
    .map((entry) => ({
      quizId: entry.quizId,
      quizTitle: entry.quizTitle,
      attempts: entry.attempts,
      avgScore:
        entry.attempts > 0
          ? Math.round((entry.totalScore / entry.attempts) * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 5);

  const now = new Date();
  const weeklyAttempts: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = quizAttempts.filter((a) => {
      const submitted = new Date(a.submittedAt);
      return submitted >= dayStart && submitted < dayEnd;
    }).length;
    weeklyAttempts.push(count);
  }

  return {
    totalQuizzes,
    publishedQuizzes,
    totalAttempts,
    avgScore,
    recentActivity,
    weeklyAttempts,
  };
}
