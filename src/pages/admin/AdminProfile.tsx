import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Lock,
  LogOut,
  KeyRound,
} from "lucide-react";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import type { User } from "@/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PasswordInput from "@/components/PasswordInput";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/Card";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Spinner from "@/components/Spinner";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setLocalUser] = useState<User | null>(authUser);
  const [loading, setLoading] = useState(true);

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState<{
    currentPw?: string;
    newPw?: string;
    confirmPw?: string;
  }>({});

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await api.getMe();
        if (me) {
          setLocalUser(me);
        } else {
          setLocalUser(authUser || null);
        }
      } catch {
        setLocalUser(authUser || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser]);

  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  const displayUser: User = user ?? {
    id: "u2",
    name: "Admin User",
    email: "admin@university.edu",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  const handleChangePassword = async () => {
    const errs: typeof pwErrors = {};
    if (!currentPw) errs.currentPw = "Current password is required.";
    if (!newPw) errs.newPw = "New password is required.";
    else if (newPw.length < 6)
      errs.newPw = "Password must be at least 6 characters.";
    if (!confirmPw) errs.confirmPw = "Please confirm your new password.";
    else if (confirmPw !== newPw) errs.confirmPw = "Passwords do not match.";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwSaving(true);
    setError(null);
    try {
      if (currentPw !== "password123") {
        throw new Error("Current password is incorrect.");
      }
      await new Promise((r) => setTimeout(r, 700));
      setSuccessToast("Password changed successfully.");
      setPwModalOpen(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwErrors({});
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change password.";
      setPwErrors((p) => ({ ...p, currentPw: message }));
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      /* ignore */
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-900">
        Profile &amp; Settings
      </h1>
      <p className="mt-1 text-slate-500">Manage your administrator account.</p>

      {successToast && (
        <div className="mt-6">
          <Alert variant="success" onClose={() => setSuccessToast(null)}>
            {successToast}
          </Alert>
        </div>
      )}

      {error && (
        <div className="mt-6">
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardBody>
            <div className="flex flex-col items-center text-center">
              <Avatar
                name={displayUser.name}
                src={displayUser.avatar}
                size="xl"
              />
              <h3 className="mt-4 text-xl font-semibold text-dark-900">
                {displayUser.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{displayUser.email}</p>
              <div className="mt-3">
                <Badge variant="primary" size="md">
                  <Shield className="h-3 w-3 mr-1 inline" /> Administrator
                </Badge>
              </div>
              <div className="w-full mt-6 pt-6 border-t border-slate-200 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </p>
                    <p className="text-sm text-dark-800 break-words">
                      {displayUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Joined
                    </p>
                    <p className="text-sm text-dark-800">
                      {displayUser.createdAt ? formatDate(displayUser.createdAt) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Account Role
                    </p>
                    <p className="text-sm text-dark-800">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Account Information"
              subtitle="Your administrator account details."
            />
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <label className="text-sm font-medium text-dark-800">
                      Full Name
                    </label>
                  </div>
                  <Input value={displayUser.name} disabled />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <label className="text-sm font-medium text-dark-800">
                      Email Address
                    </label>
                  </div>
                  <Input value={displayUser.email} disabled />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <label className="text-sm font-medium text-dark-800">
                      Account Role
                    </label>
                  </div>
                  <Input value="Administrator" disabled />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <label className="text-sm font-medium text-dark-800">
                      Joined Date
                    </label>
                  </div>
                  <Input
                    value={
                      displayUser.createdAt
                        ? formatDate(displayUser.createdAt)
                        : "—"
                    }
                    disabled
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Security"
              subtitle="Update your password and account security settings."
            />
            <CardBody>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-lg p-2.5 flex-shrink-0",
                      "bg-primary-50 text-primary-600",
                    )}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">
                      Change Password
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Update your account password. It is recommended to use a
                      strong, unique password.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  size="md"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  onClick={() => {
                    setPwModalOpen(true);
                    setCurrentPw("");
                    setNewPw("");
                    setConfirmPw("");
                    setPwErrors({});
                  }}
                >
                  Change Password
                </Button>
              </div>
            </CardBody>
            <CardFooter className="!pt-0">
              <div className="w-full pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg p-2.5 flex-shrink-0 bg-error-50 text-error-600">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">Sign Out</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      End your current session and return to the login page.
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="md"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={() => setLogoutOpen(true)}
                >
                  Log Out
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Modal
        open={pwModalOpen}
        onClose={() => !pwSaving && setPwModalOpen(false)}
        size="md"
        title="Change Password"
        description="Enter your current password and choose a new password."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPwModalOpen(false)}
              disabled={pwSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              loading={pwSaving}
            >
              Update Password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <PasswordInput
            label="Current Password"
            required
            placeholder="Enter your current password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            error={pwErrors.currentPw}
          />
          <PasswordInput
            label="New Password"
            required
            placeholder="Enter your new password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            error={pwErrors.newPw}
            helpText="Minimum 6 characters. Use a mix of letters, numbers, and symbols for security."
          />
          <PasswordInput
            label="Confirm New Password"
            required
            placeholder="Re-enter your new password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            error={pwErrors.confirmPw}
          />
        </div>
      </Modal>

      <ConfirmationDialog
        open={logoutOpen}
        onCancel={() => !logoutLoading && setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Log Out?"
        description="You will be signed out of your account and redirected to the login page."
        confirmVariant="danger"
        confirmText="Log Out"
        confirmLoading={logoutLoading}
        icon="warning"
      />
    </div>
  );
};

export default AdminProfile;
