import React from 'react';
import ShareHistory from '../../components/ShareHistory';
import { Share2 } from 'lucide-react';

const Shares = () => {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase flex items-center">
            <Share2 className="w-5 h-5 mr-3 text-accent" />
            Shared Assets
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            Manage Ephemeral Zero-Knowledge Links
          </p>
        </div>
      </div>

      {/* Share History Component */}
      <ShareHistory />
    </div>
  );
};

export default Shares;
