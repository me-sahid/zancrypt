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
import SelfDestructToggle from './SelfDestructToggle';

/**
 * ShareModal component for creating secure Zero-Knowledge shares.
 * Supports both single file and multi-file arrays.
 */
const ShareModal = ({ file, onClose }) => {
  const [ttl, setTtl] = useState(24); // Default 24 Hours

  const [maxDownloads, setMaxDownloads] = useState(0); // Default Unlimited
  const [customDownloads, setCustomDownloads] = useState('3'); // Default 3
  const [label, setLabel] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Dynamic Sharing IP for localhost / development testing
  const [customSharingIp, setCustomSharingIp] = useState(() => {
    return localStorage.getItem('zancrypt_sharing_ip') || '192.168.30.73';
  });
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [ipInput, setIpInput] = useState(customSharingIp);

  // States to keep track of generated tokens and keys for computed dynamic URL
  const [shareToken, setShareToken] = useState('');
  const [multiTokens, setMultiTokens] = useState([]);
  const [multiKeys, setMultiKeys] = useState([]);
  
  const isMulti = Array.isArray(file);
  const fileId = isMulti ? null : (file?.file_id || file?.id);
  const fileName = isMulti 
    ? `${file.length} Secure Assets`
    : (file?.file_name || file?.encrypted_filename || file?.filename || 'decrypted_file');

  // Helper to ensure the share link uses the dynamic device IP instead of localhost for development
  const getBaseUrl = () => {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin;
    }
    return origin.replace('localhost', customSharingIp);
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

  // Dynamic assembled share URL computed in real-time
  const shareUrl = React.useMemo(() => {
    if (isMulti) {
      if (multiTokens.length === 0) return '';
      return `${getBaseUrl()}/share/multi?tokens=${multiTokens.join(',') || ''}#keys=${multiKeys.join(',') || ''}`;
    } else {
      if (!shareToken) return '';
      return `${getBaseUrl()}/share/${shareToken}#${encryptionKey}`;
    }
  }, [isMulti, shareToken, multiTokens, multiKeys, encryptionKey, customSharingIp]);

  // Form submission handler
  const handleCreateShare = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalTtl = parseFloat(ttl);


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
            label: label.trim() ? `${label.trim()} (${item.encrypted_filename || item.filename || 'asset'})` : undefined
          });
          
          tokens.push(res.data.share_token);
          keys.push(derivedKey);
        }
        
        setMultiTokens(tokens);
        setMultiKeys(keys);
        toast.success('Secure Multi-Asset share link created!');
      } else {
        // Single File Share
        const res = await api.post('/api/share/create', {
          file_id: parseInt(fileId, 10),
          ttl_hours: finalTtl,
          max_downloads: finalMaxDownloads,
          label: label.trim() || undefined
        });
        
        const token = res.data.share_token;
        setShareToken(token);
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
        className={`w-full ${shareUrl ? 'max-w-4xl' : 'max-w-lg'} bg-[#0d121f] border border-[#1e293b]/70 rounded-2xl shadow-2xl relative overflow-hidden text-white z-10 transition-all duration-300`}
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
                  </select>
                </div>

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
              // STEP 2: Link Generated Successfully (Widescreen Split Grid Layout)
              <motion.div 
                key="link-step"
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Left Column: Traditional Decryption Link Retrieval */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
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
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Secure Decryption Link
                          </label>
                          
                          {/* Premium Local LAN IP Config Pill */}
                          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                            <div className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/25 flex items-center space-x-1 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <span>LAN Share Mode</span>
                            </div>
                          )}
                        </div>

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

                        {/* Inline Sharing IP Editor for Localhost Development / LAN share */}
                        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                          <div className="pt-1.5">
                            {!isEditingIp ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setIpInput(customSharingIp);
                                  setIsEditingIp(true);
                                }}
                                className="text-[10px] text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1.5 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/25 px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                <span>Sharing via Host IP: <strong className="text-white">{customSharingIp}</strong></span>
                                <span className="text-slate-500 text-[9px]">(Click to edit)</span>
                              </button>
                            ) : (
                              <div className="flex items-center space-x-2 bg-[#0a0a0c]/80 border border-blue-500/20 p-2 rounded-xl">
                                <span className="text-[9px] text-slate-400 font-bold px-1 shrink-0 uppercase tracking-wider">Set Device IP:</span>
                                <input
                                  type="text"
                                  value={ipInput}
                                  onChange={(e) => setIpInput(e.target.value)}
                                  placeholder="e.g. 192.168.1.15"
                                  className="flex-1 bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cleaned = ipInput.trim();
                                    if (cleaned) {
                                      localStorage.setItem('zancrypt_sharing_ip', cleaned);
                                      setCustomSharingIp(cleaned);
                                      setIsEditingIp(false);
                                      toast.success(`LAN IP updated to ${cleaned}`);
                                    } else {
                                      toast.error('Sharing IP cannot be empty');
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg active:scale-95 transition-all cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingIp(false)}
                                  className="text-slate-400 hover:text-white font-bold text-[10px] px-2 py-1 rounded-lg active:scale-95 transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center justify-center p-4 bg-[#0f172a]/60 border border-[#1e293b]/40 rounded-xl space-y-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <QrCode className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        Scan QR Code to Retrieve
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-xl">
                        {qrCodeDataUrl ? (
                          <img src={qrCodeDataUrl} alt="Secure Share QR Code" className="w-32 h-32 select-none" />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center bg-slate-800 animate-pulse rounded-lg" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Safe mobile client decryption bypass.</p>
                    </div>
                  </div>

                  {/* Right Column: Self-Destruct Sandbox Environment */}
                  <div className="bg-[#0f172a]/50 border border-[#1e293b]/40 rounded-xl p-5 min-h-[380px] flex flex-col justify-between">
                    {!isMulti ? (
                      <SelfDestructToggle
                        fileId={fileId}
                        shareToken={shareToken}
                        fileName={fileName}
                        mimeType={file?.mime_type}
                        baseUrl={getBaseUrl()}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-12 space-y-3 h-full">
                        <AlertTriangle className="w-10 h-10 text-slate-600 animate-pulse" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Wrapper Disabled</h4>
                        <p className="text-[10px] text-slate-500 max-w-[220px] leading-relaxed">
                          Self-destructing containers are reserved strictly for single files, not bulk folder assets.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Finish & Close Button */}
                <div className="pt-2 border-t border-[#1e293b]/30">
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
