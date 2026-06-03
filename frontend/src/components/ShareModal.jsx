import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Share2, Copy, Check, Clock, Download, 
  Tag, AlertTriangle, QrCode, Lock
} from 'lucide-react';
import QRCode from 'qrcode';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

const ShareModal = ({ file, onClose }) => {
  const [label, setLabel] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);


  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const [shareToken, setShareToken] = useState('');
  const [multiTokens, setMultiTokens] = useState([]);
  const [multiKeys, setMultiKeys] = useState([]);
  
  const isMulti = Array.isArray(file);
  const fileId = isMulti ? null : (file?.file_id || file?.id);
  const fileName = isMulti ? `${file.length} Secure Assets` : (file?.file_name || file?.encrypted_filename || file?.filename || 'decrypted_file');

  const getBaseUrl = () => {
    return "https://zancrypt.in";
  };

  const [encryptionKey] = useState(() => {
    if (isMulti) return '';
    if (file?.encryption_key_b64) return file.encryption_key_b64;
    const keyBytes = new Uint8Array(32);
    window.crypto.getRandomValues(keyBytes);
    return btoa(String.fromCharCode.apply(null, keyBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  });

  const shareUrl = React.useMemo(() => {
    if (isMulti) {
      if (multiTokens.length === 0) return '';
      return `${getBaseUrl()}/share/multi?tokens=${multiTokens.join(',')}#keys=${multiKeys.join(',')}`;
    }
    if (!shareToken) return '';
    return `${getBaseUrl()}/share/${shareToken}#${encryptionKey}`;
  }, [isMulti, shareToken, multiTokens, multiKeys, encryptionKey]);

  const handleCreateShare = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalTtl = 168; // 7 days default
      let finalMaxDownloads = 0; // unlimited default

      if (isMulti) {
        const tokens = []; const keys = [];
        for (const item of file) {
          const keyBytes = new Uint8Array(32);
          window.crypto.getRandomValues(keyBytes);
          const derivedKey = btoa(String.fromCharCode.apply(null, keyBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          const res = await api.post('/api/share/create', {
            file_id: parseInt(item.file_id || item.id, 10),
            ttl_hours: finalTtl,
            max_downloads: finalMaxDownloads,
            label: label.trim() ? `${label.trim()} (${item.encrypted_filename || 'asset'})` : undefined,
            allow_downloads: allowDownloads,
            password: enablePassword ? password : undefined
          });
          tokens.push(res.data.share_token);
          keys.push(derivedKey);
        }
        setMultiTokens(tokens); setMultiKeys(keys);
        toast.success('Multi-Asset share link created!');
      } else {
        const res = await api.post('/api/share/create', {
          file_id: parseInt(fileId, 10),
          ttl_hours: finalTtl,
          max_downloads: finalMaxDownloads,
          label: label.trim() || undefined,
          allow_downloads: allowDownloads,
          password: enablePassword ? password : undefined
        });
        setShareToken(res.data.share_token);
        toast.success('Zero-Knowledge share link created!');
      }
    } catch (error) {
      toast.error('Failed to create share link');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, { width: 140, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrCodeDataUrl(url))
        .catch(console.error);
    }
  }, [shareUrl]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast.success('Link copied');
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-void/90 backdrop-blur-md cursor-pointer" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full ${shareUrl ? 'max-w-2xl' : 'max-w-md'} bg-surface border border-border shadow-2xl relative z-10 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-void">
          <div className="flex items-center space-x-3">
            <Share2 className="w-4 h-4 text-accent" />
            <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest">
              {isMulti ? 'Multi-Asset Share' : 'Cryptographic Share'}
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary font-mono text-xs uppercase tracking-widest">
            [ Close ]
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!shareUrl ? (
              <motion.form key="form" onSubmit={handleCreateShare} className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="font-mono text-xs text-text-muted mb-4 truncate">Target: {fileName}</p>
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-muted uppercase tracking-widest flex items-center">
                    <Tag className="w-3 h-3 mr-2 text-accent" /> Label / Purpose
                  </label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. For marketing team"
                    className="w-full bg-void border border-border focus:border-accent text-text-primary font-mono text-xs py-2 px-3 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div className="text-xs font-mono text-text-muted uppercase tracking-widest">Allow Downloads</div>
                  <input type="checkbox" checked={allowDownloads} onChange={(e) => setAllowDownloads(e.target.checked)} className="accent-accent" />
                </div>

                <div className="flex items-center justify-between py-3 border-y border-border">
                  <div className="text-xs font-mono text-text-muted uppercase tracking-widest flex items-center">
                    <Lock className="w-3 h-3 mr-2 text-accent" /> Password Protection
                  </div>
                  <input type="checkbox" checked={enablePassword} onChange={(e) => setEnablePassword(e.target.checked)} className="accent-accent" />
                </div>

                {enablePassword && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Share Password</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="flex-1 bg-void border border-border focus:border-accent text-text-primary font-mono text-xs py-2 px-3 outline-none"
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="bg-surface-raised border border-border hover:border-accent px-3 py-2 text-xs font-mono text-text-secondary transition-colors"
                      >
                        Generate Random
                      </button>
                    </div>
                  </div>
                )}

                <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
                  Generate Secure Link
                </Button>
              </motion.form>
            ) : (
              <motion.div key="result" className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-warning/10 border border-warning/20 p-4 flex items-start space-x-3 text-warning">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-xs font-mono">
                    <p className="font-bold mb-1 uppercase tracking-widest">Security Warning</p>
                    <p className="opacity-80">This link contains the decryption key. Anyone with it can access the file. Keep it strictly private.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Secure Decryption Link</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-void border border-border p-3 text-xs font-mono text-text-primary overflow-x-auto whitespace-nowrap select-all scrollbar-none">
                      {shareUrl}
                    </div>
                    <button onClick={handleCopyLink} className="p-3 bg-void border border-border text-text-muted hover:text-accent transition-colors">
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-6 border-t border-border pt-6">
                  <div className="bg-white p-2">
                    {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />}
                  </div>
                  <div className="text-xs font-mono text-text-muted space-y-2">
                    <p className="uppercase tracking-widest text-text-primary flex items-center">
                      <QrCode className="w-4 h-4 mr-2 text-accent" /> Scan to Retrieve
                    </p>
                    <p>Use mobile device for secure retrieval.</p>

                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="outline" onClick={onClose}>Done</Button>
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
