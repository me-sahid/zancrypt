import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  Download, 
  Tag, 
  AlertTriangle,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';
import Input from './ui/Input';

/**
 * ShareModal component for creating secure Zero-Knowledge shares.
 * Supports both single file and multi-file arrays.
 */
const ShareModal = ({ file, onClose }) => {
  const [ttl, setTtl] = useState(24); // Default 24 Hours
  const [customHours, setCustomHours] = useState('0');
  const [customMins, setCustomMins] = useState('30'); // Default 30 Minutes
  const [maxDownloads, setMaxDownloads] = useState(0); // Default Unlimited
  const [customDownloads, setCustomDownloads] = useState('3'); // Default 3
  const [label, setLabel] = useState('');
  
  // Ephemeral Auto-Deletion settings
  const [deleteOriginal, setDeleteOriginal] = useState(false);
  const [notifyOnExpire, setNotifyOnExpire] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const isMulti = Array.isArray(file);
  const fileId = isMulti ? null : (file?.file_id || file?.id);
  const fileName = isMulti 
    ? `${file.length} Secure Assets`
    : (file?.file_name || file?.encrypted_filename || file?.filename || 'decrypted_file');

  // Helper to ensure the share link uses the device IP instead of localhost for development
  const getBaseUrl = () => {
    return window.location.origin.replace('localhost', '192.168.30.73');
  };

  // Generate or derive a cryptographically secure key for the URL fragment if not provided (single file fallback)
  const [encryptionKey] = useState(() => {
    if (isMulti) return '';
    if (file?.encryption_key_b64) return file.encryption_key_b64;
    
    const keyBytes = new Uint8Array(32);
    window.crypto.getRandomValues(keyBytes);
    return btoa(String.fromCharCode.apply(null, keyBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  });

  // Form submission handler
  const handleCreateShare = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalTtl = 0;
      if (ttl === 'custom') {
        const hrs = parseFloat(customHours) || 0;
        const mins = parseFloat(customMins) || 0;
        finalTtl = hrs + mins / 60;
        
        if (finalTtl <= 0) {
          toast.error('Expiration must be greater than 0 minutes');
          setIsSubmitting(false);
          return;
        }
      } else {
        finalTtl = parseFloat(ttl);
      }

      let finalMaxDownloads = 0;
      if (maxDownloads === 'custom') {
        finalMaxDownloads = parseInt(customDownloads, 10) || 0;
        if (finalMaxDownloads <= 0) {
          toast.error('Download limit must be 1 or more (or select Unlimited)');
          setIsSubmitting(false);
          return;
        }
      } else {
        finalMaxDownloads = parseInt(maxDownloads, 10);
      }

      if (isMulti) {
        // Multi-File Share Link Generation
        const tokens = [];
        const keys = [];
        
        for (const item of file) {
          const itemFileId = item.file_id || item.id;
          
          // Generate a cryptographically secure key for each file
          const keyBytes = new Uint8Array(32);
          window.crypto.getRandomValues(keyBytes);
          const derivedKey = btoa(String.fromCharCode.apply(null, keyBytes))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
            
          const res = await api.post('/api/share/create', {
            file_id: parseInt(itemFileId, 10),
            ttl_hours: finalTtl,
            max_downloads: finalMaxDownloads,
            label: label.trim() ? `${label.trim()} (${item.encrypted_filename || item.filename || 'asset'})` : undefined,
            delete_original: deleteOriginal,
            notify_on_expire: notifyOnExpire
          });
          
          tokens.push(res.data.share_token);
          keys.push(derivedKey);
        }
        
        // Construct the multi-asset sharing URL
        const assembledUrl = `${getBaseUrl()}/share/multi?tokens=${tokens.join(',') || ''}#keys=${keys.join(',') || ''}`;
        setShareUrl(assembledUrl);
        toast.success('Secure Multi-Asset share link created!');
      } else {
        // Single File Share
        const res = await api.post('/api/share/create', {
          file_id: parseInt(fileId, 10),
          ttl_hours: finalTtl,
          max_downloads: finalMaxDownloads,
          label: label.trim() || undefined,
          delete_original: deleteOriginal,
          notify_on_expire: notifyOnExpire
        });
        
        const token = res.data.share_token;
        const assembledUrl = `${getBaseUrl()}/share/${token}#${encryptionKey}`;
        setShareUrl(assembledUrl);
        toast.success('Zero-Knowledge share link created!');
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
      const msg = error.response?.data?.detail || 'Failed to initialize secure share link';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate QR code on shareUrl change
  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: '#0f172a',  // Deep dark blue
          light: '#ffffff'  // Pure white for optimal scans
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
    }
  }, [shareUrl]);

  // Copy URL to clipboard
  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setIsCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Could not copy automatically');
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0a0a0c]/85 backdrop-blur-md transition-all cursor-pointer animate-fade-in"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0d121f] border border-[#1e293b]/70 rounded-2xl shadow-2xl relative overflow-hidden text-white z-10"
      >
        {/* Glowing Top Border Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e293b]/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">
                {isMulti ? 'Share Multiple Secure Assets' : 'Share Cryptographic Link'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 select-all font-mono truncate max-w-[280px]" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!shareUrl ? (
              // STEP 1: Configure Share Link Options
              <motion.form 
                key="form-step"
                onSubmit={handleCreateShare} 
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Optional Label */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Share Label / Purpose
                  </label>
                  <Input
                    placeholder="e.g. Shared with marketing team"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-[#0f172a] border-[#1e293b] text-sm focus:border-blue-500"
                    maxLength={50}
                  />
                </div>

                {/* Expiry Selector (TTL) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Expiration Timer (TTL)
                  </label>
                  <select 
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-medium"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={24}>24 Hours (1 Day)</option>
                    <option value={168}>7 Days (1 Week)</option>
                    <option value={720}>30 Days (1 Month)</option>
                    <option value="custom">Custom Duration...</option>
                    <option value={0}>Never Expires</option>
                  </select>
                </div>

                {/* Custom Time Selector Panel */}
                {ttl === 'custom' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-2 gap-4 p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="8760"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        className="w-full bg-[#070913] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Minutes
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customMins}
                        onChange={(e) => setCustomMins(e.target.value)}
                        className="w-full bg-[#070913] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Max Downloads Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Download className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Download Limit
                  </label>
                  <select 
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-medium"
                  >
                    <option value={0}>Unlimited Downloads</option>
                    <option value={1}>1 Download only</option>
                    <option value={5}>5 Downloads max</option>
                    <option value={10}>10 Downloads max</option>
                    <option value="custom">Custom Limit...</option>
                  </select>
                </div>

                {/* Custom Downloads Input Panel */}
                {maxDownloads === 'custom' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden space-y-1.5"
                  >
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Custom Download Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={customDownloads}
                      onChange={(e) => setCustomDownloads(e.target.value)}
                      className="w-full bg-[#070913] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </motion.div>
                )}

                {/* Ephemeral Auto-Deletion Controls */}
                <div className="space-y-4 pt-2 border-t border-[#1e293b]/50">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={deleteOriginal}
                        onChange={(e) => {
                          setDeleteOriginal(e.target.checked);
                          if (!e.target.checked) setNotifyOnExpire(true);
                        }}
                        className="w-4 h-4 rounded border-[#1e293b] bg-slate-900 text-rose-500 focus:ring-rose-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                        Delete original file when link expires
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Permanently destroy the source file and all distributed shards when the TTL or download limit is reached.
                      </p>
                    </div>
                  </label>

                  <AnimatePresence>
                    {deleteOriginal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start space-x-3 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-200 mb-3">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                          <div className="text-xs leading-relaxed">
                            <p className="font-bold text-rose-400">Warning:</p>
                            <p className="mt-1">
                              Enabling this permanently deletes the file from your vault when the link expires or the download limit is reached. This cannot be undone.
                            </p>
                          </div>
                        </div>

                        <label className="flex items-center space-x-3 cursor-pointer group pl-7">
                          <input
                            type="checkbox"
                            checked={notifyOnExpire}
                            onChange={(e) => setNotifyOnExpire(e.target.checked)}
                            className="w-4 h-4 rounded border-[#1e293b] bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                          />
                          <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                            Notify me when auto-deleted
                          </p>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    isLoading={isSubmitting}
                  >
                    {isMulti ? 'Generate Secure Multi-Asset Share Link' : 'Generate Zero-Knowledge Share Link'}
                  </Button>
                </div>
              </motion.form>
            ) : (
              // STEP 2: Link Generated Successfully (Displays URL, Copy Button, QR Code, and ZK Warning)
              <motion.div 
                key="link-step"
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Zero Knowledge Warning Alert */}
                <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-200">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-amber-400">Security Warning:</p>
                    <p className="mt-1">
                      {isMulti 
                        ? 'This link contains cryptographic keys to decrypt all selected files. Keep it strictly private.'
                        : 'This link contains your decryption key. Anyone with it can access the file.'}
                    </p>
                  </div>
                </div>

                {/* Link URL Clipboard Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Secure Multi-Decryption Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-nowrap select-all scrollbar-none">
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`p-3 rounded-xl border transition-all shrink-0 ${
                        isCopied 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Copy Link"
                    >
                      {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center p-4 bg-[#0f172a]/60 border border-[#1e293b]/40 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <QrCode className="w-4 h-4 mr-1.5 text-blue-500" />
                    Scan QR Code to Retrieve
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-xl">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="Secure Share QR Code" className="w-40 h-40 select-none" />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center bg-slate-800 animate-pulse rounded-lg" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Safe mobile client decryption bypass.</p>
                </div>

                {/* Finish & Close Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full border-[#1e293b] text-slate-300 hover:bg-slate-800/40 hover:text-white py-2.5 font-bold text-sm"
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal;
