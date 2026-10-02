export type Role = "student" | "admin";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type QuizStatus = "published" | "draft";

export type Category =
  | "Cloud Computing"
  | "AWS Fundamentals"
  | "Networking"
  | "Database"
  | "Computer Science"
  | "Serverless";

export type AttemptStatus = "completed" | "in-progress";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  avatar?: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  durationMins: number;
  attemptsAllowed: number;
  questionCount: number;
  status: QuizStatus;
  createdAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, number>;
  score: number;
  total: number;
  percentage: number;
  timeTakenSecs: number;
  status: AttemptStatus;
  submittedAt: string;
}

export interface DashboardStats {
  available: number;
  completed: number;
  avgScore: number;
  upcoming: number;
}

export interface AdminDashboardStats {
  totalQuizzes: number;
  publishedQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  recentActivity: {
    quizId: string;
    quizTitle: string;
    attempts: number;
    avgScore: number;
  }[];
  weeklyAttempts: number[];
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface RadioOption {
  value: string | number;
  label: string;
}

export function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
