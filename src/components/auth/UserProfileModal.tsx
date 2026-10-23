import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, changePassword, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile fields
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98110 44910');

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateProfile({ name, phone });
      showToast('Profile information updated successfully.', 'success');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Official password updated securely.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Password update rejected.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-sm shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-title text-base font-semibold text-on-surface">{currentUser.name}</h3>
              <p className="font-numeric-data text-xs text-outline">{currentUser.badge_no} • {currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant px-6 bg-surface-container-low">
          <button
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg('');
            }}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Profile &amp; Scopes</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('security');
              setErrorMsg('');
            }}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded text-xs bg-error-container border border-error text-on-error-container font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Immutable Role & Jurisdiction Notice */}
              <div className="p-3 bg-surface-container rounded border border-outline-variant space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    <span>Assigned Operational Scope</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">
                    Locked by Policy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-outline">Assigned Role:</span>
                    <p className="font-semibold text-on-surface mt-0.5">{currentUser.role.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-outline">Official Badge:</span>
                    <p className="font-mono font-semibold text-on-surface mt-0.5">{currentUser.badge_no}</p>
                  </div>
                  <div>
                    <span className="text-outline">Depot Scope:</span>
                    <p className="font-semibold text-on-surface mt-0.5">{currentUser.godown_name}</p>
                    <p className="font-mono text-[10px] text-outline">({currentUser.godown_id})</p>
                  </div>
                  <div>
                    <span className="text-outline">Jurisdiction:</span>
                    <p className="font-semibold text-on-surface mt-0.5">{currentUser.district_name}</p>
                    <p className="text-[10px] text-outline">State Code: {currentUser.state_code}</p>
                  </div>
                </div>

                <p className="text-[10px] text-outline italic pt-1 border-t border-outline-variant/50">
                  Role assignments and depot boundaries can only be reallocated by an authorized State or Platform Administrator.
                </p>
              </div>

              {/* Editable User Attributes */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Officer Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Department Contact Mobile
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded hover:bg-primary/90"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-xs text-on-surface-variant">
                Update your departmental account password. Must contain at least 8 characters.
              </p>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Current Password <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  New Password <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Confirm New Password <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-9 px-3 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
