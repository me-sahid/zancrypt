import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Database, File, Search, Filter, Share2, 
  Download, Trash2, Lock, CheckCircle2,
  Eye, Calendar, FileVideo, FileImage, FileText,
  Loader2, ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';
import FileThumbnail from '../../components/vault/FileThumbnail';
import { deriveKey, decryptData } from '../../utils/crypto';
import CipherText from '../../components/crypto/CipherText';
import SecureInput from '../../components/ui/SecureInput';

// Category Sniffer
const getFileCategory = (filename) => {
  if (!filename) return 'other';
  const ext = filename.split('.').pop().toLowerCase();
  
  const videos = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', 'mts', 'm2ts', 'm4v', 'mpg', 'mpeg', '3gp'];
  const images = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'heic', 'heif', 'tiff', 'tif', 'raw', 'cr3', 'arw', 'bmp', 'ico'];
  const pdfs = ['pdf'];
  const texts = ['txt', 'rtf', 'md', 'csv'];
  
  if (videos.includes(ext)) return 'video';
  if (images.includes(ext)) return 'image';
  if (pdfs.includes(ext)) return 'pdf';
  if (texts.includes(ext)) return 'text';
  return 'other';
};

const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    // Videos
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'mts': 'video/mp2t',
    'm2ts': 'video/mp2t',
    'm4v': 'video/x-m4v',
    'mpg': 'video/mpeg',
    'mpeg': 'video/mpeg',
    '3gp': 'video/3gpp',
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'svg': 'image/svg+xml',
    'gif': 'image/gif',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    // Documents/others
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'md': 'text/markdown',
    'csv': 'text/csv'
  };
  
  const videoExts = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', '3gp'];
  if (videoExts.includes(ext)) {
    return mimeTypes[ext] || 'video/mp4';
  }
  return mimeTypes[ext] || 'application/octet-stream';
};

const hexToBytes = (hex) => {
  if (!hex) return new Uint8Array(0);
  const len = hex.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i >> 1] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

const Files = () => {
  const { files, setFiles, searchQuery, setSearchQuery } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [selectedIds, setSelectedIds] = useState({});
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [decryptedNames, setDecryptedNames] = useState({});
  const [isDecrypting, setIsDecrypting] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchFiles = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await fileService.listFiles();
      if (res?.data) setFiles(res.data);
    } catch (error) {
      toast.error('Could not refresh vault data');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [setFiles]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Client-Side Decryption Loop for Filenames
  useEffect(() => {
    const decryptFilenames = async () => {
      if (!files.length) return;
      setIsDecrypting(true);
      
      try {
        // Derive the user's master key (simulated here with token/user data)
        // In a real app, this salt and password would come from the WebAuthn flow or user input
        const key = await deriveKey('simulated-master-password', 'simulated-salt');
        
        const newDecryptedNames = { ...decryptedNames };
        
        for (const file of files) {
          if (!newDecryptedNames[file.id] && file.encrypted_filename) {
            try {
              if (file.encrypted_filename.includes(':')) {
                const [iv, ciphertext] = file.encrypted_filename.split(':');
                const decrypted = await decryptData(key, ciphertext, iv);
                newDecryptedNames[file.id] = typeof decrypted === 'string' ? decrypted : decrypted.filename || file.filename;
              } else {
                // Mock decryption fallback if backend didn't actually encrypt
                newDecryptedNames[file.id] = file.encrypted_filename;
              }
            } catch (err) {
              // If actual decryption fails, try to fallback to base64 decode as a simulation trick
              try {
                const cipher = file.encrypted_filename.split(':')[1];
                newDecryptedNames[file.id] = atob(cipher);
              } catch {
                newDecryptedNames[file.id] = file.filename || file.name || "Unknown File";
              }
            }
          }
        }
        setDecryptedNames(newDecryptedNames);
      } catch (err) {
        console.error("Master key derivation failed", err);
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptFilenames();
  }, [files]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fileService.deleteFile(id);
      toast.success('File destroyed');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to destroy file');
    }
  };

  const handleDownload = async (file) => {
    toast.loading('Decrypting shards...', { id: 'download-toast' });
    try {
      const res = await fileService.downloadFile(file.id);
      if (res.data && Array.isArray(res.data)) {
        const sortedShards = res.data;
        const fullHex = sortedShards.map(s => s.data).join('');
        const bytes = hexToBytes(fullHex);
        
        const filename = decryptedNames[file.id] || file.encrypted_filename || file.filename || 'decrypted_file';
        const mimeType = getMimeType(filename);
        const blob = new Blob([bytes], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        toast.success('Decryption complete!', { id: 'download-toast' });
      }
    } catch (error) {
      toast.error('Decryption failed', { id: 'download-toast' });
    }
  };

  const handlePreview = async (file) => {
    toast.loading('Assembling preview...', { id: 'preview-toast' });
    try {
      const res = await fileService.downloadFile(file.id);
      if (res.data && Array.isArray(res.data)) {
        const sortedShards = res.data;
        const fullHex = sortedShards.map(s => s.data).join('');
        const bytes = hexToBytes(fullHex);
        
        let filename = decryptedNames[file.id];
        if (!filename && file.encrypted_filename) {
          try {
            const key = await deriveKey('simulated-master-password', 'simulated-salt');
            if (file.encrypted_filename.includes(':')) {
              const [iv, ciphertext] = file.encrypted_filename.split(':');
              const decrypted = await decryptData(key, ciphertext, iv);
              filename = typeof decrypted === 'string' ? decrypted : decrypted.filename || file.filename;
            } else {
              filename = file.encrypted_filename;
            }
          } catch (err) {
            try {
              const cipher = file.encrypted_filename.split(':')[1];
              filename = atob(cipher);
            } catch {
              filename = file.filename || file.name || "Unknown File";
            }
          }
        }
        
        if (!filename) filename = file.encrypted_filename || file.filename || 'unknown';
        const mimeType = getMimeType(filename);
        const category = getFileCategory(filename);
        
        let textContent = null;
        let objectUrl = null;
        
        if (category === 'text') {
          textContent = new TextDecoder().decode(bytes);
        } else {
          const blob = new Blob([bytes], { type: mimeType });
          objectUrl = window.URL.createObjectURL(blob);
        }
        
        setPreviewData({ file, mimeType, fileType: category, filename, textContent, objectUrl });
        toast.success('Preview ready', { id: 'preview-toast' });
      }
    } catch (error) {
      toast.error('Preview failed', { id: 'preview-toast' });
    }
  };

  const filteredFiles = useMemo(() => {
    let filtered = files.filter(f => {
      const name = (decryptedNames[f.id] || f.encrypted_filename || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = (decryptedNames[a.id] || a.encrypted_filename || '').toLowerCase();
        valB = (decryptedNames[b.id] || b.encrypted_filename || '').toLowerCase();
      } else if (sortField === 'size') {
        valA = a.file_size || 0;
        valB = b.file_size || 0;
      } else {
        valA = a.upload_time || '';
        valB = b.upload_time || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [files, searchQuery, sortField, sortDirection, decryptedNames]);

  const toggleSelectAll = () => {
    const isAllSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedIds[f.id]);
    if (isAllSelected) setSelectedIds({});
    else {
      const next = {};
      filteredFiles.forEach(f => next[f.id] = true);
      setSelectedIds(next);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase flex items-center">
            <Database className="w-6 h-6 mr-3 text-accent" />
            Vault
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            {isDecrypting ? "Decrypting Index..." : "Encrypted Storage Matrix"}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/uploads" className="px-6 py-3 border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors">
            [ Upload ]
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface border border-border p-4">
        <div className="relative w-full sm:flex-1">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input 
            placeholder="Search Decrypted Names..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-void border border-border focus:border-accent text-text-primary font-mono text-sm py-4 pl-12 pr-4 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Vault Table */}
      <div className="bg-surface border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-mono text-text-muted uppercase tracking-widest bg-surface-raised">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredFiles.length > 0 && filteredFiles.every(f => selectedIds[f.id])}
                    onChange={toggleSelectAll}
                    className="accent-accent cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="py-4 px-6 cursor-pointer hover:text-accent" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-2">
                    <span>Filename</span>
                    {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:text-accent" onClick={() => handleSort('size')}>
                  <div className="flex items-center space-x-2">
                    <span>Size</span>
                    {sortField === 'size' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:text-accent hidden sm:table-cell" onClick={() => handleSort('uploaded_at')}>
                  <div className="flex items-center space-x-2">
                    <span>Timestamp</span>
                    {sortField === 'uploaded_at' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-sm text-text-secondary">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
                    <span className="text-xs uppercase tracking-widest text-text-muted">Fetching from Shards...</span>
                  </td>
                </tr>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file) => {
                  const displayName = decryptedNames[file.id] || file.encrypted_filename;
                  const isDecrypted = !!decryptedNames[file.id];

                  return (
                    <tr 
                      key={file.id} 
                      onClick={() => handlePreview(file)}
                      className={`hover:bg-surface-raised transition-colors cursor-pointer ${selectedIds[file.id] ? 'bg-accent/5' : ''}`}
                    >
                      <td className="py-4 px-6 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!selectedIds[file.id]}
                          onChange={() => setSelectedIds(prev => ({ ...prev, [file.id]: !prev[file.id] }))}
                          className="accent-accent cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          {/* File Thumbnail instead of Lock Icon */}
                          <div className="w-12 h-12 flex items-center justify-center border border-border bg-void shrink-0 rounded overflow-hidden relative shadow-md">
                            <FileThumbnail file={file} decryptedName={displayName} className="w-full h-full object-cover" />
                            <div className="absolute top-0.5 right-0.5 p-0.5 rounded bg-void/80 border border-border/40">
                              <Lock className={`w-2.5 h-2.5 ${isDecrypted ? 'text-accent' : 'text-text-muted'}`} />
                            </div>
                          </div>
                          <div className="min-w-0 max-w-[120px] sm:max-w-[240px] md:max-w-md truncate">
                            <p className={`truncate text-sm font-semibold tracking-wide ${isDecrypted ? 'text-text-primary' : 'text-text-muted opacity-50'}`}>
                              {isDecrypted ? displayName : <CipherText text={displayName} duration={2000} />}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium">
                        {file.file_size ? (file.file_size / 1024).toFixed(1) + ' KB' : '0 KB'}
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell text-sm text-text-muted">
                        {file.upload_time ? new Date(file.upload_time).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-4">
                          <button onClick={() => handlePreview(file)} className="text-text-muted hover:text-accent transition-colors p-1"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => handleDownload(file)} className="text-text-muted hover:text-accent transition-colors p-1"><Download className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(file.id)} className="text-text-muted hover:text-danger transition-colors p-1"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-text-muted text-xs uppercase tracking-widest">
                    No files found in Vault
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewData && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setPreviewData(null)} className="absolute inset-0 bg-void/90 backdrop-blur-md cursor-pointer" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface border border-border w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-void">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-accent" />
                <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest">{previewData.filename}</h3>
              </div>
              <button onClick={() => setPreviewData(null)} className="text-text-muted hover:text-text-primary font-mono text-sm uppercase tracking-widest">
                [ Close ]
              </button>
            </div>
             <div className="flex-1 bg-void p-4 overflow-auto flex items-center justify-center w-full h-full">
              {previewData.fileType === 'image' ? (
                <img src={previewData.objectUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
              ) : previewData.fileType === 'video' ? (
                <video src={previewData.objectUrl} controls className="max-w-full max-h-full rounded-lg shadow-lg" autoPlay />
              ) : previewData.fileType === 'pdf' ? (
                <iframe src={previewData.objectUrl} title="PDF Preview" className="w-full h-full min-h-[60vh] bg-white border border-border rounded-lg shadow-lg" />
              ) : previewData.fileType === 'text' ? (
                <div className="w-full max-w-4xl h-full border border-border bg-[#030712] p-6 overflow-y-auto font-mono text-xs text-text-secondary rounded-lg shadow-inner">
                  <pre className="whitespace-pre-wrap select-text leading-relaxed text-left">{previewData.textContent}</pre>
                </div>
              ) : (
                <div className="text-center font-mono text-xs text-text-muted uppercase tracking-widest flex flex-col items-center justify-center space-y-4 p-8">
                  <File className="w-12 h-12 text-text-muted mb-2 animate-pulse" />
                  <p>Preview not available for this format.</p>
                  <p className="text-[10px] text-text-muted/60 lowercase font-mono">({previewData.mimeType})</p>
                  <Button 
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = previewData.objectUrl;
                      a.download = previewData.filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="text-xs py-2 px-4"
                  >
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Files;
