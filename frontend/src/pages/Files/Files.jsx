import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Database,
  File, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Download, 
  Trash2, 
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  Globe,
  Eye,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';

const getMimeType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const mimes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'md': 'text/plain',
    'json': 'application/json',
    'js': 'text/javascript',
    'py': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime'
  };
  return mimes[ext] || 'application/octet-stream';
};

const Files = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { files, setFiles } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  React.useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const res = await fileService.listFiles();
        if (res?.data) setFiles(res.data);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        toast.error('Could not refresh vault data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [setFiles]);

  const handleDelete = async (id) => {
    try {
      await fileService.deleteFile(id);
      toast.success('File moved to Recycle Bin');
      const res = await fileService.listFiles();
      if (res?.data) setFiles(res.data);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to move file to Bin');
    }
  };

  const handleDownload = async (file) => {
    toast.loading('Decrypting and assembling shards...', { id: 'download-toast' });
    try {
      const res = await fileService.downloadFile(file.id);
      if (res.data && Array.isArray(res.data)) {
        const sortedShards = res.data;
        const fullHex = sortedShards.map(s => s.data).join('');
        const bytes = new Uint8Array(fullHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.encrypted_filename || file.filename || file.name || 'decrypted_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('File decrypted successfully!', { id: 'download-toast' });
      } else {
        toast.error('Failed to parse download payload', { id: 'download-toast' });
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Could not fetch file shards', { id: 'download-toast' });
    }
  };

  const handlePreview = async (file) => {
    setIsPreviewLoading(true);
    toast.loading('Decrypting shards for secure preview...', { id: 'preview-toast' });
    try {
      const res = await fileService.downloadFile(file.id);
      if (res.data && Array.isArray(res.data)) {
        const sortedShards = res.data;
        const fullHex = sortedShards.map(s => s.data).join('');
        const bytes = new Uint8Array(fullHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        
        const filename = file.encrypted_filename || file.filename || file.name || 'unnamed';
        const mimeType = getMimeType(filename);
        
        let textContent = null;
        let objectUrl = null;
        let finalMimeType = mimeType;
        
        const isText = mimeType.startsWith('text/') || 
                       mimeType === 'application/json' || 
                       mimeType === 'text/javascript' || 
                       mimeType === 'text/css';
                       
        const isBytesText = (arr) => {
          const sample = arr.subarray(0, Math.min(arr.length, 500));
          for (let i = 0; i < sample.length; i++) {
            const byte = sample[i];
            if (byte === 0) return false;
            if (byte < 9 || (byte > 13 && byte < 32)) return false;
          }
          return true;
        };

        if (isText || (mimeType === 'application/octet-stream' && isBytesText(bytes))) {
          textContent = new TextDecoder().decode(bytes);
          if (finalMimeType === 'application/octet-stream') {
            finalMimeType = 'text/plain (Autodetected)';
          }
        } else {
          const blob = new Blob([bytes], { type: mimeType });
          objectUrl = window.URL.createObjectURL(blob);
        }
        
        setPreviewData({
          file,
          mimeType: finalMimeType,
          textContent,
          objectUrl,
          filename
        });
        toast.success('Direct preview decrypt complete!', { id: 'preview-toast' });
      } else {
        toast.error('Failed to decrypt file content', { id: 'preview-toast' });
      }
    } catch (error) {
      console.error('Preview decryption failed:', error);
      toast.error('Could not fetch file shards', { id: 'preview-toast' });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewData && previewData.objectUrl) {
      window.URL.revokeObjectURL(previewData.objectUrl);
    }
    setPreviewData(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = (f.encrypted_filename || f.filename || f.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || (f.upload_time && f.upload_time.startsWith(dateFilter));
    return matchesSearch && matchesDate;
  });

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Secure Vault</h1>
          <p className="text-text-secondary mt-1">Access and manage your encrypted data.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/uploads">
            <Button variant="primary" size="sm" leftIcon={<Lock className="w-4 h-4" />}>Add New File</Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-2">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <Input 
              placeholder="Search your vault..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-transparent border-none focus:ring-0"
            />
          </div>
          <div className="flex items-center space-x-2 bg-surface-elevated/30 border border-border rounded-xl px-3 py-1.5 mr-2">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-text-primary focus:outline-none border-none cursor-pointer"
              title="Filter by Upload Date"
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="text-[10px] text-text-secondary hover:text-text-primary font-bold ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* File List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Upload Date</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-surface-elevated text-primary-accent border border-border">
                        <File className="w-5 h-5" />
                      </div>
                      <div 
                        onClick={() => handlePreview(file)}
                        className="cursor-pointer hover:underline"
                      >
                        <p className="text-sm font-semibold text-text-primary">{file.encrypted_filename || file.filename || file.name}</p>
                        <p className="text-[10px] text-text-secondary uppercase">Encrypted Asset</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Protected
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-secondary font-mono">{formatSize(file.file_size || file.size)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-secondary font-mono">{formatDate(file.upload_time)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handlePreview(file)}
                        className="p-2 text-text-secondary hover:text-primary-accent transition-colors"
                        title="Quick Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(file)}
                        className="p-2 text-text-secondary hover:text-primary-accent transition-colors"
                        title="Download Decrypted"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-text-secondary hover:text-status-danger transition-colors"
                        title="Move to Bin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-text-secondary opacity-50">
                    <Database className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold">Your vault is empty</p>
                    <p className="text-xs">Uploaded files will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Premium File Viewer Modal */}
      {previewData && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            onClick={closePreview}
            className="absolute inset-0 bg-primary-bg/85 backdrop-blur-xl animate-fade-in cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface-secondary/95 border border-border/80 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative cursor-default z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-surface-elevated/40">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-primary-accent/15 text-primary-accent border border-primary-accent/25">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">{previewData.filename}</h3>
                  <p className="text-xs text-text-secondary mt-0.5 font-mono uppercase tracking-widest">{previewData.mimeType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    handleDownload(previewData.file);
                    closePreview();
                  }}
                  className="p-2.5 text-text-secondary hover:text-primary-accent hover:bg-white/[0.03] active:bg-white/[0.06] rounded-xl transition-all border border-transparent hover:border-border"
                  title="Download File"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={closePreview}
                  className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.03] active:bg-white/[0.06] rounded-xl transition-all border border-transparent hover:border-border font-bold text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-8 bg-surface-primary/20 custom-scrollbar flex items-center justify-center">
              {previewData.mimeType.startsWith('image/') ? (
                <div className="max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-2xl border border-border/30 bg-surface-elevated/10 p-2 shadow-inner">
                  <img 
                    src={previewData.objectUrl} 
                    alt={previewData.filename} 
                    className="max-w-full max-h-[60vh] object-contain rounded-xl select-none"
                  />
                </div>
              ) : previewData.mimeType.startsWith('video/') ? (
                <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
                  <video 
                    src={previewData.objectUrl} 
                    controls 
                    className="w-full max-h-[60vh] bg-black"
                  />
                </div>
              ) : previewData.mimeType.startsWith('audio/') ? (
                <div className="p-10 bg-surface-elevated/40 border border-border/60 rounded-2xl flex flex-col items-center space-y-6 w-full max-w-md shadow-2xl">
                  <div className="p-4 bg-primary-accent/10 rounded-full border border-primary-accent/20">
                    <Database className="w-8 h-8 text-primary-accent animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-text-primary text-sm">{previewData.filename}</h4>
                    <p className="text-[10px] text-text-secondary font-mono mt-1">Ready for decryption stream</p>
                  </div>
                  <audio 
                    src={previewData.objectUrl} 
                    controls 
                    className="w-full"
                  />
                </div>
              ) : previewData.mimeType === 'application/pdf' ? (
                <iframe 
                  src={previewData.objectUrl} 
                  title={previewData.filename}
                  className="w-full h-full rounded-2xl border border-border/30"
                />
              ) : previewData.textContent !== null ? (
                <div className="w-full h-full bg-surface-elevated/30 border border-border/60 rounded-2xl p-6 overflow-auto custom-scrollbar font-mono text-xs text-text-primary/90 leading-relaxed shadow-inner">
                  <pre className="whitespace-pre-wrap break-all">{previewData.textContent}</pre>
                </div>
              ) : (
                <div className="text-center p-12 bg-surface-elevated/20 border border-border/40 rounded-3xl max-w-md flex flex-col items-center space-y-6 shadow-2xl">
                  <div className="p-4 bg-status-warning/10 rounded-full border border-status-warning/20 text-status-warning">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-base">Direct Preview Not Available</h4>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">Direct in-app decryption previews are not supported for this file type to preserve security constraints. You can safely download and decrypt the file.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      handleDownload(previewData.file);
                      closePreview();
                    }}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download Decrypted File
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
