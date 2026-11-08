import React from 'react';

interface QuotaBannerProps {
  visible: boolean;
  onDismiss?: () => void;
}

export const QuotaBanner: React.FC<QuotaBannerProps> = ({ visible, onDismiss }) => {
  if (!visible) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-3">
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit{' '}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-amber-950 hover:text-amber-800"
        >
          maps developer site
        </a>{' '}
        for instructions to update your account.
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-amber-700 hover:text-amber-950 text-xs px-2 py-0.5 rounded border border-amber-300 hover:bg-amber-100 transition-colors"
          title="Dismiss warning"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
