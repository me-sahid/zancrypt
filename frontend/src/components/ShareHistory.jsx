import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  Download, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

// Live Countdown Timer Cell Component for zero-knowledge shares
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
    if (!expiresAt) {
      return;
    }

    const updateTimer = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        onExpire();
        return;
      }

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Alert thresholds
      setIsNearExpiry(diff < 5 * 60 * 1000); // < 5 minutes (pulsing red)
      setIsMediumExpiry(diff >= 5 * 60 * 1000 && diff < 60 * 60 * 1000); // < 1 hour (amber warning)

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

  // Format absolute expiration date for subtext
  const formatAbsoluteDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!isActive || isExpired) {
    return (
      <span className="text-slate-500 font-sans italic">Expired</span>
    );
  }

  if (!expiresAt) {
    return (
      <span className="text-emerald-400/80 font-sans italic font-medium flex items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
        Infinite Access
      </span>
    );
  }

  return (
    <div className="flex flex-col space-y-0.5 select-none">
      <span className={`font-mono text-xs ${
        isNearExpiry ? 'text-rose-500 font-black animate-pulse' :
        isMediumExpiry ? 'text-amber-500 font-bold' : 'text-blue-400 font-medium'
      }`}>
        {timeLeft}
      </span>
      <span className="text-[10px] text-slate-500 leading-tight">
        Expires {formatAbsoluteDate(expiresAt)}
      </span>
    </div>
  );
};

const ShareHistory = () => {
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState('');
  
  // Custom Revocation Confirmation Modal State
  const [shareToRevoke, setShareToRevoke] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // 2c. Proactively auto-revoke the link when countdown ends
  const handleAutoRevoke = async (share) => {
    try {
      await api.delete(`/api/share/${share.share_token}`);
      toast.error(`Share for "${share.encrypted_filename || 'this file'}" has expired and was auto-revoked`, {
        id: `expire-${share.share_token}`
      });
      fetchShares();
    } catch (err) {
      // Quiet reload if already handled by the server task scheduler
      fetchShares();
    }
  };

  // 1. Fetch all shares created by the user
  const fetchShares = async () => {
    try {
      const res = await api.get('/api/share/list');
      setShares(res.data);
    } catch (error) {
      console.error('Failed to load share history:', error);
      toast.error('Could not load share history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  // 2. Open confirmation modal for revoking share
  const handleRevokeShare = (share) => {
    setShareToRevoke(share);
  };

  // 2b. Confirm and execute share revocation via API
  const confirmRevoke = async () => {
    if (!shareToRevoke) return;
    setIsRevoking(true);
    try {
      await api.delete(`/api/share/${shareToRevoke.share_token}`);
      toast.success('Share link successfully revoked');
      setShareToRevoke(null);
      fetchShares();
    } catch (error) {
      console.error('Failed to revoke share link:', error);
      toast.error('Could not revoke share link');
    } finally {
      setIsRevoking(false);
    }
  };

  // 3. Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to ensure the share link uses the dynamic device IP instead of localhost for development
  const getBaseUrl = () => {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin;
    }
    const customSharingIp = localStorage.getItem('zancrypt_sharing_ip') || '192.168.30.73';
    return origin.replace('localhost', customSharingIp);
  };

  // 4. Quick copy of full URL if active
  const handleCopyLinkOnly = (token) => {
    const fullUrl = `${getBaseUrl()}/share/${token}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopiedToken(token);
        toast.success('Share URL base copied (without key fragment)');
        setTimeout(() => setCopiedToken(''), 2000);
      });
  };

  return (
    <Card className="w-full bg-[#0d121f]/60 border border-[#1e293b]/40 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1e293b]/40 pb-5 gap-4">
        <div>
          <CardTitle className="text-xl flex items-center space-x-2 text-white">
            <Share2 className="w-5 h-5 text-blue-500" />
            <span>Active Cryptographic Shares</span>
          </CardTitle>
          <CardDescription>
            Monitor and manage access tokens generated for external ZK sharing.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading" 
              className="py-20 flex flex-col items-center justify-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Retrieving Share Matrix...</p>
            </motion.div>
          ) : shares.length > 0 ? (
            <motion.div 
              key="table-container"
              className="overflow-x-auto w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#0f172a]/40 border-b border-[#1e293b]/40">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Label / Purpose</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Associated File</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono hidden md:table-cell">Downloads</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Expiration Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Revoke Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/20 text-slate-200">
                  {shares.map((share) => (
                    <tr 
                      key={share.share_id} 
                      className={`group transition-all hover:bg-white/[0.01] ${!share.is_active ? 'opacity-50' : ''}`}
                    >
                      {/* Label */}
                      <td className="px-6 py-4 font-semibold text-sm max-w-[200px] truncate hidden sm:table-cell" title={share.label || 'No Label'}>
                        {share.label || <span className="text-slate-500 font-normal italic">Unnamed share</span>}
                      </td>

                      {/* Associated File Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-blue-400 max-w-[180px] truncate" title={share.encrypted_filename}>
                            {share.encrypted_filename}
                          </p>
                          {share.is_active && (
                            <button
                              onClick={() => handleCopyLinkOnly(share.share_token)}
                              className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                              title="Copy URL Base (excludes local decryption fragment)"
                            >
                              {copiedToken === share.share_token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Download Limits / Counts */}
                      <td className="px-6 py-4 font-mono text-xs hidden md:table-cell">
                        <div className="flex items-center space-x-1.5">
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-white">{share.download_count}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">
                            {share.max_downloads ? share.max_downloads : '∞'}
                          </span>
                        </div>
                      </td>

                      {/* Expiration Date / Ticking Countdown */}
                      <td className="px-6 py-4">
                        <CountdownCell 
                          share={share} 
                          onExpire={() => handleAutoRevoke(share)} 
                        />
                      </td>

                      {/* Active Status Badge */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {share.is_active ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Revoked
                          </span>
                        )}
                      </td>

                      {/* Revoke Action */}
                      <td className="px-6 py-4 text-right">
                        {share.is_active ? (
                          <button
                            onClick={() => handleRevokeShare(share)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-all active:scale-95 cursor-pointer inline-flex items-center"
                            title="Revoke Share Link"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            <span className="text-xs font-bold">Revoke</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold select-none flex items-center justify-end">
                            <ShieldAlert className="w-4 h-4 mr-1 text-slate-600" />
                            Revoked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            // EMPTY STATE
            <motion.div 
              key="empty"
              className="py-24 text-center max-w-md mx-auto px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mx-auto mb-5 text-slate-500 shadow-inner">
                <Share2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No Shared Links Found</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                You have not generated any secure cryptographic sharing links yet. 
                Go to <span className="font-bold text-slate-200">My Vault</span> and select the share action on any protected file to create one!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Custom Revocation Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {shareToRevoke && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isRevoking && setShareToRevoke(null)}
                className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm cursor-pointer"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-[#0d121f] border border-[#1e293b] rounded-2xl shadow-2xl relative overflow-hidden text-white z-[10000] font-sans antialiased"
              >
                {/* Top Warning Accent Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 to-rose-700 animate-pulse" />
                
                <div className="p-6 space-y-4">
                  {/* Header Icon & Title */}
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg leading-tight text-white">
                        Revoke Share Link?
                      </h3>
                      <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mt-0.5">
                        Irreversible Operation
                      </p>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="space-y-3.5 bg-[#0f172a]/60 border border-[#1e293b]/40 rounded-xl p-4 text-slate-300 text-xs leading-relaxed">
                    <p>
                      Are you absolutely sure you want to revoke the share link for:
                    </p>
                    <p className="font-mono text-blue-400 font-bold bg-[#070913] px-3 py-2 rounded-lg border border-[#1e293b]/50 select-all truncate">
                      {shareToRevoke.encrypted_filename || 'Unnamed Asset'}
                    </p>
                    <p className="text-slate-400">
                      Any recipient or client with this link will instantly and permanently lose decryption and retrieval capability.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      disabled={isRevoking}
                      onClick={() => setShareToRevoke(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#1e293b] text-slate-300 font-bold text-xs hover:bg-slate-800/40 hover:text-white transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isRevoking}
                      onClick={confirmRevoke}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/10 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isRevoking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Revoking...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </Card>
  );
};

export default ShareHistory;
