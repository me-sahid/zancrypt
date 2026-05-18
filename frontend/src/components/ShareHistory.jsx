import React, { useEffect, useState } from 'react';
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

const ShareHistory = () => {
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState('');

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

  // 2. Revoke a share (DELETE /share/:token)
  const handleRevokeShare = async (token) => {
    const confirmRevoke = window.confirm('Are you absolutely sure you want to revoke this share link? Anyone with this link will instantly lose access.');
    if (!confirmRevoke) return;

    try {
      await api.delete(`/api/share/${token}`);
      toast.success('Share link successfully revoked');
      // Refresh list
      fetchShares();
    } catch (error) {
      console.error('Failed to revoke share link:', error);
      toast.error('Could not revoke share link');
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

  // 4. Quick copy of full URL if active
  const handleCopyLinkOnly = (token) => {
    const fullUrl = `${window.location.origin}/share/${token}`;
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Label / Purpose</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Associated File</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Downloads</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Expiration Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
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
                      <td className="px-6 py-4 font-semibold text-sm max-w-[200px] truncate" title={share.label || 'No Label'}>
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
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-white">{share.download_count}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">
                            {share.max_downloads ? share.max_downloads : '∞'}
                          </span>
                        </div>
                      </td>

                      {/* Expiry Timestamp */}
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {share.expires_at ? (
                          <span className={new Date(share.expires_at) < new Date() ? 'text-rose-500' : 'text-slate-300'}>
                            {formatDate(share.expires_at)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-sans italic">Never expires</span>
                        )}
                      </td>

                      {/* Active Status Badge */}
                      <td className="px-6 py-4">
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
                            onClick={() => handleRevokeShare(share.share_token)}
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
    </Card>
  );
};

export default ShareHistory;
