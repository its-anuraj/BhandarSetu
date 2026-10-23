import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(email);
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit password reset request.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">lock_reset</span>
            <h3 className="font-title text-base font-semibold">Official Credential Recovery</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-on-primary/80 hover:text-on-primary hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Enter your registered email address. A secure password recovery link will be sent to your email to help you reset your account.
          </p>

          {statusMessage && (
            <div
              className={`p-3 rounded text-xs border ${
                statusMessage.type === 'success'
                  ? 'bg-primary/10 border-primary text-primary font-medium'
                  : 'bg-error-container border-error text-on-error-container font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{statusMessage.text}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
              Official Email Address <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@bhandarsetu.internal"
                className="w-full h-10 pl-9 pr-3 rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-body-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Send Recovery Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
