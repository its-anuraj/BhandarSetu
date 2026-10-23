import React from 'react';
import { useApp } from '../../context/AppContext';

interface UnauthorizedViewProps {
  requiredRole?: string;
  attemptedPath?: string;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  requiredRole,
  attemptedPath,
}) => {
  const { currentUser, setActivePath } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-lg w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container mx-auto flex items-center justify-center border border-error/20">
          <span className="material-symbols-outlined text-3xl text-error">gpp_bad</span>
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full bg-error/10 text-error font-semibold text-xs uppercase tracking-wider font-mono">
            403 • Restricted Statutory Jurisdiction
          </span>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Access Denied: Role &amp; Scope Restriction
          </h2>
          <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
            Your authenticated appointment does not possess statutory authorization to access the module at{' '}
            <code className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-primary font-semibold">
              /{attemptedPath || 'restricted'}
            </code>
            .
          </p>
        </div>

        {currentUser && (
          <div className="p-4 bg-surface-container rounded border border-outline-variant text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-outline">Active Staff Member:</span>
              <span className="font-semibold text-on-surface">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Assigned Role:</span>
              <span className="font-mono font-semibold text-primary">{currentUser.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Assigned Depot:</span>
              <span className="font-semibold text-on-surface">{currentUser.godown_name} ({currentUser.godown_id})</span>
            </div>
            {requiredRole && (
              <div className="flex justify-between border-t border-outline-variant/60 pt-1.5 text-error">
                <span>Required Authority:</span>
                <span className="font-mono font-bold">{requiredRole}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActivePath('dashboard')}
            className="px-5 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Return to Permitted Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
