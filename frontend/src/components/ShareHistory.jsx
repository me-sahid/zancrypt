import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Trash2, Download, ShieldAlert,
  Loader2, Copy, Check
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CountdownCell = ({ share, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isNearExpiry, setIsNearExpiry] = useState(false);
  const [isMediumExpiry, setIsMediumExpiry] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const expiresAt = share.expires_at;
  const isActive = share.is_active;

  useEffect(() => {
    if (!isActive) {
      setIsExpired(true);
      return;
    }
    if (!expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsNearExpiry(diff < 5 * 60 * 1000);
      setIsMediumExpiry(diff >= 5 * 60 * 1000 && diff < 60 * 60 * 1000);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m ${seconds}s`;

      setTimeLeft(timeString);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, isActive]);

  if (!isActive || isExpired) {
    return <span className="font-mono text-xs uppercase text-text-muted">Expired</span>;
  }

  if (!expiresAt) {
    return (
      <span className="font-mono text-xs text-accent uppercase tracking-widest flex items-center">
        <span className="w-1.5 h-1.5 bg-accent mr-2 animate-pulse" />
        Infinite
      </span>
    );
  }

  return (
    <div className="flex flex-col select-none">
      <span className={`font-mono text-xs ${
        isNearExpiry ? 'text-danger animate-pulse' :
        isMediumExpiry ? 'text-warning' : 'text-accent'
      }`}>
        {timeLeft}
      </span>
    </div>
  );
};

const ShareHistory = () => {
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState('');
  const [shareToRevoke, setShareToRevoke] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleAutoRevoke = async (share) => {
    try {
      await api.delete(`/api/share/${share.share_token}`);
      toast.error(`Share for "${share.encrypted_filename || 'asset'}" auto-revoked`);
      fetchShares();
    } catch (err) {
      fetchShares();
    }
  };

  const fetchShares = async () => {
    try {
      const res = await api.get('/api/share/list');
      setShares(res.data);
    } catch (error) {
      toast.error('Could not load share history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const confirmRevoke = async () => {
    if (!shareToRevoke) return;
    setIsRevoking(true);
    try {
      await api.delete(`/api/share/${shareToRevoke.share_token}`);
      toast.success('Share link revoked');
      setShareToRevoke(null);
      fetchShares();
    } catch (error) {
      toast.error('Could not revoke link');
    } finally {
      setIsRevoking(false);
    }
  };

  const getBaseUrl = () => {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') return origin;
    const customSharingIp = localStorage.getItem('zancrypt_sharing_ip') || '192.168.30.73';
    return origin.replace('localhost', customSharingIp);
  };

  const handleCopyLinkOnly = (token) => {
    const fullUrl = `${getBaseUrl()}/share/${token}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedToken(token);
      toast.success('URL Base Copied');
      setTimeout(() => setCopiedToken(''), 2000);
    });
  };

  return (
    <div className="bg-surface border border-border">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading" 
            className="py-20 flex flex-col items-center justify-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Retrieving Share Matrix...</p>
          </motion.div>
        ) : shares.length > 0 ? (
          <motion.div 
            key="table-container"
            className="overflow-x-auto w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-[11px] font-mono text-text-muted uppercase tracking-widest">
                  <th className="px-6 py-4 hidden sm:table-cell">Label</th>
                  <th className="px-6 py-4">Target Asset</th>
                  <th className="px-6 py-4 hidden md:table-cell">Downloads</th>
                  <th className="px-6 py-4">TTL (Time to Live)</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs text-text-secondary">
                {shares.map((share) => (
                  <tr 
                    key={share.share_id} 
                    className={`transition-colors hover:bg-surface-raised ${!share.is_active ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {share.label || <span className="text-text-muted italic">UNNAMED</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <p className="text-text-primary truncate max-w-[150px]">{share.encrypted_filename}</p>
                        {share.is_active && (
                          <button
                            onClick={() => handleCopyLinkOnly(share.share_token)}
                            className="text-text-muted hover:text-accent transition-colors"
                          >
                            {copiedToken === share.share_token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center space-x-1.5">
                        <Download className="w-3 h-3 text-text-muted" />
                        <span className="text-text-primary">{share.download_count}</span>
                        <span className="text-text-muted">/</span>
                        <span>{share.max_downloads || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CountdownCell share={share} onExpire={() => handleAutoRevoke(share)} />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {share.is_active ? (
                        <span className="text-accent text-[11px] uppercase tracking-widest">Active</span>
                      ) : (
                        <span className="text-danger text-[11px] uppercase tracking-widest">Revoked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {share.is_active ? (
                        <button
                          onClick={() => setShareToRevoke(share)}
                          className="text-text-muted hover:text-danger transition-colors uppercase text-[11px] tracking-widest inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Revoke
                        </button>
                      ) : (
                        <span className="text-text-muted text-[11px] uppercase tracking-widest">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            className="py-16 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Share2 className="w-8 h-8 text-text-muted mx-auto mb-4" />
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">No Shared Links Found</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revocation Modal */}
      {createPortal(
        <AnimatePresence>
          {shareToRevoke && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !isRevoking && setShareToRevoke(null)}
                className="fixed inset-0 bg-void/90 backdrop-blur-sm cursor-pointer"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-surface border border-border flex flex-col relative z-10 shadow-2xl"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ShieldAlert className="w-6 h-6 text-danger" />
                    <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest">Revoke Link</h3>
                  </div>
                  
                  <p className="font-mono text-xs text-text-secondary mb-4">
                    Are you sure you want to revoke access to: <br/>
                    <span className="text-text-primary block mt-2 border border-border p-2 bg-void truncate">{shareToRevoke.encrypted_filename}</span>
                  </p>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setShareToRevoke(null)}
                      disabled={isRevoking}
                      className="flex-1 py-2 border border-border font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
                    >
                      [ Cancel ]
                    </button>
                    <button
                      onClick={confirmRevoke}
                      disabled={isRevoking}
                      className="flex-1 py-2 bg-transparent border border-danger text-danger hover:bg-danger/10 font-mono text-xs uppercase tracking-widest transition-colors"
                    >
                      {isRevoking ? '[ Revoking... ]' : '[ Revoke ]'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ShareHistory;
