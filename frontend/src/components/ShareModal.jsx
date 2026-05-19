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
  // Expiry states (TTL)
  const [isTtlDropdownOpen, setIsTtlDropdownOpen] = useState(false);
  const ttlOptions = [
    { label: '1 Hour', value: 1 },
    { label: '24 Hours (1 Day)', value: 24 },
    { label: '7 Days (1 Week)', value: 168 },
    { label: '30 Days (1 Month)', value: 720 },
    { label: 'Custom Expiry...', value: 'custom' }
  ];
  const [selectedTtlOption, setSelectedTtlOption] = useState(ttlOptions[1]); // Default 24 Hours
  const [customTtlHours, setCustomTtlHours] = useState('0');
  const [customTtlMins, setCustomTtlMins] = useState('30');

  // Max Downloads states
  const [isDlDropdownOpen, setIsDlDropdownOpen] = useState(false);
  const dlOptions = [
    { label: 'Unlimited Downloads', value: 0 },
    { label: '1 Download only', value: 1 },
    { label: '5 Downloads max', value: 5 },
    { label: '10 Downloads max', value: 10 },
    { label: 'Custom Limit...', value: 'custom' }
  ];
  const [selectedDlOption, setSelectedDlOption] = useState(dlOptions[0]); // Default Unlimited
  const [customDownloads, setCustomDownloads] = useState('3'); // Default 3
  const [label, setLabel] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  
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
      let finalTtl = 0;
      if (selectedTtlOption.value === 'custom') {
        const hrs = parseFloat(customTtlHours) || 0;
        const mins = parseFloat(customTtlMins) || 0;
        finalTtl = hrs + (mins / 60);
        if (finalTtl <= 0) {
          toast.error('Expiration duration must be greater than 0 minutes');
          setIsSubmitting(false);
          return;
        }
      } else {
        finalTtl = parseFloat(selectedTtlOption.value);
      }


      let finalMaxDownloads = 0;
      if (selectedDlOption.value === 'custom') {
        finalMaxDownloads = parseInt(customDownloads, 10) || 0;
        if (finalMaxDownloads <= 0) {
          toast.error('Download limit must be 1 or more (or select Unlimited)');
          setIsSubmitting(false);
          return;
        }
      } else {
        finalMaxDownloads = parseInt(selectedDlOption.value, 10);
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
            allow_downloads: allowDownloads
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
          label: label.trim() || undefined,
          allow_downloads: allowDownloads
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
        className={`w-full ${shareUrl ? 'max-w-4xl' : 'max-w-lg'} bg-[#0d121f] border border-[#1e293b]/70 rounded-2xl shadow-2xl relative overflow-visible text-white z-10 transition-all duration-300`}
      >
        {/* Glowing Top Border Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-t-2xl" />

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
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Expiration Timer (TTL)
                  </label>
                  
                  {/* Custom Dropdown Trigger Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTtlDropdownOpen(!isTtlDropdownOpen);
                        setIsDlDropdownOpen(false);
                      }}
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all flex items-center justify-between cursor-pointer font-medium text-left"
                    >
                      <span>{selectedTtlOption.label}</span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isTtlDropdownOpen ? 'transform rotate-180 text-blue-400' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Transparent Click-Outside Overlay */}
                    {isTtlDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsTtlDropdownOpen(false)}
                      />
                    )}

                    {/* Custom Absolute Dropdown Menu (Guaranteed to open right below) */}
                    <AnimatePresence>
                      {isTtlDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.99 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 z-50 bg-[#0d121f] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {ttlOptions.map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                setSelectedTtlOption(opt);
                                setIsTtlDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-sm text-left transition-colors font-medium flex items-center justify-between ${
                                selectedTtlOption.value === opt.value
                                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
                                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {selectedTtlOption.value === opt.value && (
                                <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Custom Hours & Minutes Expire Input Panel */}
                {selectedTtlOption.value === 'custom' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, y: -5 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    className="p-4 bg-[#0a0d16] border border-[#1e293b]/60 rounded-xl grid grid-cols-2 gap-3"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="8760"
                        value={customTtlHours}
                        onChange={(e) => setCustomTtlHours(e.target.value)}
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
                        value={customTtlMins}
                        onChange={(e) => setCustomTtlMins(e.target.value)}
                        className="w-full bg-[#070913] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Max Downloads Selector */}
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Download className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Download Limit
                  </label>

                  {/* Custom Dropdown Trigger Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDlDropdownOpen(!isDlDropdownOpen);
                        setIsTtlDropdownOpen(false);
                      }}
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all flex items-center justify-between cursor-pointer font-medium text-left"
                    >
                      <span>{selectedDlOption.label}</span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDlDropdownOpen ? 'transform rotate-180 text-blue-400' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Transparent Click-Outside Overlay */}
                    {isDlDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsDlDropdownOpen(false)}
                      />
                    )}

                    {/* Custom Absolute Dropdown Menu (Guaranteed to open right below) */}
                    <AnimatePresence>
                      {isDlDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.99 }}
                          animate={{ opacity: 1, y: -4, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-[#0d121f] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {dlOptions.map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                setSelectedDlOption(opt);
                                setIsDlDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-sm text-left transition-colors font-medium flex items-center justify-between ${
                                selectedDlOption.value === opt.value
                                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
                                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {selectedDlOption.value === opt.value && (
                                <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Custom Downloads Input Panel */}
                {selectedDlOption.value === 'custom' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, y: -5 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    className="p-4 bg-[#0a0d16] border border-[#1e293b]/60 rounded-xl overflow-hidden space-y-1.5"
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

                {/* Allow Downloads Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-[#0f172a]/60 border border-[#1e293b]/40 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Download className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">Allow Downloads</p>
                      <p className="text-[10px] text-slate-500">Recipients can download/save a decrypted copy of the file</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={allowDownloads} 
                      onChange={(e) => setAllowDownloads(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                  </label>
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
              // STEP 2: Link Generated Successfully (Clean Centered Layout)
              <motion.div 
                key="link-step"
                className="space-y-6 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="space-y-5">
                  {/* Zero Knowledge Warning Alert */}
                  <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-200">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                    <div className="text-xs leading-relaxed text-left">
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
                      <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-nowrap select-all scrollbar-none text-left">
                        {shareUrl}
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className={`p-3 rounded-xl border transition-all shrink-0 cursor-pointer ${
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
                      <div className="pt-1.5 flex justify-start">
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
                          <div className="flex items-center space-x-2 bg-[#0a0a0c]/80 border border-blue-500/20 p-2 rounded-xl w-full">
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

                  {/* QR Code Section */}
                  <div className="flex flex-col items-center justify-center p-5 bg-[#0f172a]/60 border border-[#1e293b]/40 rounded-2xl space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <QrCode className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                      Scan QR Code to Retrieve
                    </div>
                    <div className="p-2.5 bg-white rounded-2xl shadow-xl">
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="Secure Share QR Code" className="w-36 h-36 select-none" />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center bg-slate-800 animate-pulse rounded-lg" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Safe mobile client decryption bypass.</p>
                  </div>
                </div>

                {/* Finish & Close Button */}
                <div className="pt-4 border-t border-[#1e293b]/30">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full border-[#1e293b] text-slate-300 hover:bg-slate-800/40 hover:text-white py-2.5 font-bold text-sm cursor-pointer"
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
