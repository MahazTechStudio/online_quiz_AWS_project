import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import PasswordInput from '@/components/PasswordInput';
import Checkbox from '@/components/Checkbox';
import Card from '@/components/Card';
import Alert from '@/components/Alert';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('student@university.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotAlert, setShowForgotAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const userStr = localStorage.getItem('qc_user');
      const role: Role = userStr ? (JSON.parse(userStr) as { role: Role }).role : 'student';
      const redirectTo = location.state?.from ?? (role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 h-screen bg-white">
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white p-8 lg:p-12 md:flex flex-col justify-between hidden md:flex">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-10 w-10 text-secondary-400" />
          <span className="text-2xl font-bold tracking-tight">QuizCloud</span>
        </div>

        <div className="py-12">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Cloud-based assessments made simple.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed mb-4">
            QuizCloud enables universities to publish, administer, and automatically grade
            quizzes entirely in the cloud — no servers, no grading, no hassle.
          </p>
          <p className="text-white/70 max-w-md">
            Sign in with your university account to access scheduled assessments, track your
            progress, and review instant results.
          </p>
        </div>

        <div className="text-sm text-white/60">
          QuizCloud · University Cloud Computing Platform · v1.0
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="rounded-xl border border-slate-200 shadow-lg p-6 sm:p-8 w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-dark-900 mb-1">Welcome back</h2>
            <p className="text-slate-500">Sign in with your university account.</p>
          </div>

          {errorMsg && (
            <Alert variant="error" onClose={() => setErrorMsg(null)} className="mb-5">
              {errorMsg}
            </Alert>
          )}

          {showForgotAlert && (
            <Alert variant="info" onClose={() => setShowForgotAlert(false)} className="mb-5">
              Contact your university IT department for password reset assistance.
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              defaultValue="student@university.edu"
              helpText="Use your university email address."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              defaultValue="password123"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between items-center gap-3">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={setRememberMe}
              />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotAlert(true);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <Button fullWidth variant="primary" size="lg" type="submit" loading={submitting}>
              Sign In
            </Button>

            <div className="text-center text-sm text-slate-500 pt-1">
              Demo: student@university.edu / admin@university.edu · password123
            </div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-400">OR</span>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm text-dark-800 font-medium">
                Student or administrator? Sign in with your university account.
              </p>
              <p className="text-sm text-slate-500">
                University accounts are provisioned by your institution.{' '}
                <Link to="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Learn more
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
