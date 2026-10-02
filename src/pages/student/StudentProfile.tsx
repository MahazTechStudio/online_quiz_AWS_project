import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/format';
import Button from '@/components/Button';
import Card, { CardHeader, CardBody } from '@/components/Card';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import PasswordInput from '@/components/PasswordInput';
import Alert from '@/components/Alert';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (!newPwd || newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }
    setPwdSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setPwdSuccess(true);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => {
        setChangePwdOpen(false);
        setPwdSuccess(false);
      }, 1500);
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <Avatar
              size="2xl"
              name={user?.name}
              src={user?.avatar}
              className="mx-auto mb-4"
            />
            <h2 className="text-xl font-bold text-dark-900">{user?.name}</h2>
            <p className="text-slate-500 mt-1 text-sm break-all">{user?.email}</p>
            <Badge variant="primary" size="md" className="mt-3">
              Student
            </Badge>
            <Button
              variant="secondary"
              fullWidth
              className="mt-6"
              onClick={handleLogout}
              loading={logoutLoading}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Sign Out
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Account Information"
              subtitle="Read-only details for your university account."
            />
            <CardBody>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Full Name
                  </div>
                  <div className="text-dark-900 font-medium">{user?.name}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    University Email
                  </div>
                  <div className="text-dark-900 font-medium break-all">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Student ID
                  </div>
                  <div className="text-dark-900 font-medium">
                    {user?.studentId ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Account Role
                  </div>
                  <div className="text-dark-900 font-medium capitalize">
                    {user?.role}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Created
                  </div>
                  <div className="text-dark-900 font-medium">
                    {user?.createdAt ? formatDate(user.createdAt) : '—'}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Settings"
              subtitle="Manage your password and account preferences."
            />
            <CardBody>
              <Button
                variant="outline-primary"
                leftIcon={<KeyRound className="h-4 w-4" />}
                onClick={() => setChangePwdOpen(true)}
              >
                Change Password
              </Button>

              <hr className="my-6 border-slate-200" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-dark-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" /> Sign out of QuizCloud
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    You will need to sign in again with your university credentials.
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={handleLogout}
                  loading={logoutLoading}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={changePwdOpen}
        onClose={() => {
          if (!pwdSubmitting) {
            setChangePwdOpen(false);
            setPwdError(null);
            setPwdSuccess(false);
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
          }
        }}
        title="Change Password"
        description="Update your university account password."
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setChangePwdOpen(false);
                setPwdError(null);
                setPwdSuccess(false);
                setCurrentPwd('');
                setNewPwd('');
                setConfirmPwd('');
              }}
              disabled={pwdSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="change-password-form"
              loading={pwdSubmitting}
            >
              Update Password
            </Button>
          </>
        }
      >
        {pwdSuccess ? (
          <Alert variant="success" title="Password updated">
            Password changed successfully.
          </Alert>
        ) : (
          <form
            id="change-password-form"
            onSubmit={handleSubmitPassword}
            className="space-y-4"
          >
            {pwdError && (
              <Alert variant="error" onClose={() => setPwdError(null)}>
                {pwdError}
              </Alert>
            )}
            <PasswordInput
              label="Current Password"
              autoComplete="current-password"
              required
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              disabled={pwdSubmitting}
              helpText="Enter your current university password."
            />
            <PasswordInput
              label="New Password"
              autoComplete="new-password"
              required
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              disabled={pwdSubmitting}
              helpText="Minimum 6 characters. Avoid reusing old passwords."
            />
            <PasswordInput
              label="Confirm New Password"
              autoComplete="new-password"
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              disabled={pwdSubmitting}
              helpText="Repeat your new password to confirm."
            />
          </form>
        )}
      </Modal>
    </div>
  );
}
