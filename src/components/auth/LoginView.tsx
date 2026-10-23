import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const LoginView: React.FC = () => {
  const { login, isAuthLoading } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const testPersonas = [
    {
      role: 'Godown Manager',
      email: 'manager@bhandarsetu.internal',
      name: 'R. Sharma',
      badge: 'DL-FCS-4491',
      desc: 'Full floor ops, batch register, exception sign-off',
    },
    {
      role: 'District Supply Officer',
      email: 'dso@bhandarsetu.internal',
      name: 'A. K. Mathur',
      badge: 'DL-DSO-0104',
      desc: 'District oversight, high-tier approval authority',
    },
    {
      role: 'Quality Inspector',
      email: 'qc@bhandarsetu.internal',
      name: 'Inspector Verma',
      badge: 'DL-QC-8812',
      desc: 'Moisture laboratory lock & quarantine clearance',
    },
    {
      role: 'Stock Inward Operator',
      email: 'inward@bhandarsetu.internal',
      name: 'P. Rawat',
      badge: 'DL-OPS-3301',
      desc: 'Gate entry, weighbridge gross/tare recordings',
    },
    {
      role: 'Dispatch Operator',
      email: 'dispatch@bhandarsetu.internal',
      name: 'M. Singh',
      badge: 'DL-DISP-2219',
      desc: 'FPS allocation, Rule 14-B FIFO calculation',
    },
    {
      role: 'Authorized Approver',
      email: 'approver@bhandarsetu.internal',
      name: 'K. L. Meena',
      badge: 'DL-APP-5510',
      desc: 'Dual-sign-off & exception authorization',
    },
    {
      role: 'Auditor / Inspector',
      email: 'auditor@bhandarsetu.internal',
      name: 'S. Chawla',
      badge: 'DL-AUD-9901',
      desc: 'Read-only ledger audit & variance examination',
    },
    {
      role: 'Platform Super Admin',
      email: 'admin@bhandarsetu.internal',
      name: 'Director Admin',
      badge: 'HQ-ADM-0001',
      desc: 'Tenant config, user provisioning & system health',
    },
  ];

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Bhandar@2026!');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your official email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20">

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          {/* Logo & System Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-on-primary font-bold text-2xl shadow-md border-2 border-primary/30">
              भ
            </div>
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                BhandarSetu — भंडारसेतु
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Smart Commodity Inventory &amp; Deterministic FIFO Management System
              </p>
            </div>
          </div>

          {/* Authentication Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-6 sm:p-8 space-y-5">
            <div className="border-b border-outline-variant pb-3">
              <h2 className="font-title text-lg font-semibold text-on-surface">Staff Authentication</h2>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Sign in with your verified departmental credentials
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded bg-error-container border border-error text-on-error-container text-xs font-medium flex items-start gap-2 animate-fadeIn"
              >
                <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                  Official Email Address <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@bhandarsetu.internal"
                    className="w-full h-10 pl-9 pr-3 rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                    Password <span className="text-error">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="font-label-sm text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 pl-9 pr-10 rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface p-0.5 rounded"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                className="w-full h-10 bg-primary text-on-primary font-semibold text-sm rounded shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting || isAuthLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Session &amp; Scope...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Sign In to Departmental Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick-Select Evaluation Personas Drawer */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>Evaluation Credentials &amp; Role Testing</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="text-xs text-on-surface-variant hover:text-primary font-medium flex items-center gap-1"
              >
                <span>{showDemoAccounts ? 'Hide' : 'Show Accounts'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {showDemoAccounts ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              BhandarSetu enforces real authentication and role isolation. Select an official staff persona below to populate credentials and test their distinct authorization boundaries.
            </p>

            {showDemoAccounts && (
              <div className="space-y-2 max-h-64 overflow-y-auto pt-1 divide-y divide-outline-variant">
                {testPersonas.map((p) => (
                  <div key={p.email} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <div className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-primary/10 text-primary rounded font-mono font-medium">
                          {p.role}
                        </span>
                      </div>
                      <div className="text-outline text-[11px] font-mono mt-0.5">{p.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickFill(p.email)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant transition-colors whitespace-nowrap"
                    >
                      Fill Credentials
                    </button>
                  </div>
                ))}
                <div className="pt-2 text-[11px] text-outline font-mono text-center">
                  Universal Test Password: <strong>Bhandar@2026!</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-outline border-t border-outline-variant bg-surface-container-lowest">
        Department of Food, Civil Supplies &amp; Consumer Affairs • Government of India / State Warehousing Corporative
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
};
