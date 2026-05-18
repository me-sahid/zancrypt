import React from 'react';
import ShareHistory from '../../components/ShareHistory';
import { Share2 } from 'lucide-react';

const Shares = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Shared Assets</h1>
        <p className="text-text-secondary mt-1">Manage and audit secure, zero-knowledge ephemeral links created from your vault.</p>
      </div>

      {/* Share History Component */}
      <ShareHistory />
    </div>
  );
};

export default Shares;
