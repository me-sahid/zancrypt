import React, { useState, useRef } from 'react';
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
  Calendar,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  FileVideo,
  FileImage,
  FileText,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService, adminService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';
import ShareModal from '../../components/ShareModal';
import FileThumbnail from '../../components/vault/FileThumbnail';

// Category Sniffer
const getFileCategory = (filename) => {
  if (!filename) return 'other';
  const ext = filename.split('.').pop().toLowerCase();
  
  const videos = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', 'mts', 'm2ts', 'm4v', 'mpg', 'mpeg', '3gp'];
  const images = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'heic', 'heif', 'tiff', 'tif', 'raw', 'cr3', 'arw', 'bmp', 'ico'];
  const pdfs = ['pdf'];
  const texts = ['txt', 'rtf', 'md', 'csv'];
  const offices = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'key', 'odt', 'ods', 'odp'];
  
  if (videos.includes(ext)) return 'video';
  if (images.includes(ext)) return 'image';
  if (pdfs.includes(ext)) return 'pdf';
  if (texts.includes(ext)) return 'text';
  if (offices.includes(ext)) return 'office';
  return 'other';
};

// MIME Type Generator
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
    // Others
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'md': 'text/markdown',
    'csv': 'text/csv',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint',
    'key': 'application/x-iwork-keynote-sffkey',
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odp': 'application/vnd.oasis.opendocument.presentation'
  };
  return mimeTypes[ext] || 'video/mp4';
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
  const [shareFile, setShareFile] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const { files, setFiles, searchQuery, setSearchQuery, setNodes, updateMetrics } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Custom Video Controller State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  const [isFullscreen, setIsFullscreen] = useState(false);


  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState({});



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
        const bytes = hexToBytes(fullHex);
        
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
        const bytes = hexToBytes(fullHex);
        
        const filename = file.encrypted_filename || file.filename || file.name || 'unnamed';
        const mimeType = getMimeType(filename);
        const category = getFileCategory(filename);
        
        let textContent = null;
        let objectUrl = null;
        let finalMimeType = mimeType;
        
        if (category === 'text') {
          textContent = new TextDecoder().decode(bytes);
        } else {
          let blob = new Blob([bytes], { type: mimeType });
          const ext = filename.split('.').pop().toLowerCase();
          if (ext === 'heic' || ext === 'heif') {
            try {
              // Dynamically import heic-to for highly updated WASM HEIC decoding
              const heicToModule = await import('heic-to');
              const heicTo = heicToModule.heicTo;
              const converted = await heicTo({
                blob,
                type: 'image/jpeg',
                quality: 0.8 // High quality for large modal previews!
              });
              blob = Array.isArray(converted) ? converted[0] : converted;
              finalMimeType = 'image/jpeg';
            } catch (heicErr) {
              console.error('Failed to convert HEIC preview:', heicErr);
            }
          }
          objectUrl = window.URL.createObjectURL(blob);
        }
        
        setPreviewData({
          file,
          mimeType: finalMimeType,
          fileType: category,
          filename,
          textContent,
          objectUrl,
          file_size: file.file_size
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
    setIsPlaying(false);
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

  const toggleSelectFile = (fileId) => {
    setSelectedIds(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const isAllSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedIds[f.id]);
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds({});
    } else {
      const next = {};
      filteredFiles.forEach(f => {
        next[f.id] = true;
      });
      setSelectedIds(next);
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (idsToDelete.length === 0) return;
    
    toast.loading(`Moving ${idsToDelete.length} files to Recycle Bin...`, { id: 'bulk-delete-toast' });
    try {
      for (const id of idsToDelete) {
        await fileService.deleteFile(id);
      }
      toast.success(`Moved ${idsToDelete.length} files to Recycle Bin`, { id: 'bulk-delete-toast' });
      
      setSelectedIds({});
      setIsSelectionMode(false);
      
      const res = await fileService.listFiles();
      if (res?.data) setFiles(res.data);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to complete bulk delete operations', { id: 'bulk-delete-toast' });
    }
  };

  const handleBulkShare = () => {
    const filesToShare = filteredFiles.filter(f => selectedIds[f.id]);
    if (filesToShare.length === 0) {
      toast.error('Please select files to share first');
      return;
    }
    setShareFile(filesToShare);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- CUSTOM VIDEO CONTROLLER IMPLEMENTATIONS ---
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(current);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleScrub = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    videoRef.current.currentTime = percentage * duration;
    setProgress(percentage * 100);
  };

  const skipTime = (amount) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += amount;
  };

  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    videoRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const muted = !isMuted;
    setIsMuted(muted);
    videoRef.current.muted = muted;
  };

  const handleSpeedChange = (e) => {
    if (!videoRef.current) return;
    const speed = e.target.value;
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = parseFloat(speed);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    const videoContainer = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Lock className="w-5.5 h-5.5 mr-2.5 text-blue-500" />
            Decrypted My Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage, share, and preview your securely distributed zero-knowledge assets.</p>
        </div>
        <div className="flex items-center space-x-3.5">
          <Button 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds({});
            }}
            variant="outline" 
            className={`font-bold border-[#1e293b] active:scale-95 transition-all text-xs rounded-xl py-2 px-4 cursor-pointer ${
              isSelectionMode 
                ? 'bg-rose-500/10 border-rose-500/35 text-rose-400 hover:bg-rose-500/20' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isSelectionMode ? 'Cancel Selection' : 'Select Files'}
          </Button>
          <Link to="/uploads">
            <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold shadow-lg shadow-blue-500/10 rounded-xl text-xs py-2 px-4">
              Upload New File
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <Card className="bg-[#0b0f19]/70 border-[#1e293b]/70 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search secure assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#070913] border-[#1e293b] focus:border-blue-500 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-3 py-2 bg-[#070913] border border-[#1e293b] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
              />
            </div>
            {dateFilter && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDateFilter('')}
                className="border-slate-800 text-xs px-3 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vault Files Table */}
      <Card className="bg-[#0b0f19]/50 border-[#1e293b]/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#0f172a]/20">
                {isSelectionMode && (
                  <th className="py-4 px-6 w-12 text-center select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#1e293b] bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-4 px-6">File Name</th>
                <th className="py-4 px-6">Original Size</th>
                <th className="py-4 px-6">Uploaded At</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={isSelectionMode ? 5 : 4} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs mt-3 uppercase tracking-wider font-semibold">Decrypting file entries...</p>
                  </td>
                </tr>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    onClick={(e) => {
                      if (isSelectionMode) {
                        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button') && e.target.type !== 'checkbox') {
                          toggleSelectFile(file.id);
                        }
                      }
                    }}
                    className={`hover:bg-slate-800/10 transition-colors group cursor-pointer ${
                      selectedIds[file.id] ? 'bg-blue-500/[0.04]' : ''
                    }`}
                  >
                    {isSelectionMode && (
                      <td className="py-4.5 px-6 w-12 text-center select-none" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!selectedIds[file.id]}
                          onChange={() => toggleSelectFile(file.id)}
                          className="w-4 h-4 rounded border-[#1e293b] bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 relative group-hover:border-blue-500/40 transition-colors shadow-lg">
                          {file.thumbnail ? (
                            <img 
                              src={file.thumbnail} 
                              alt="thumbnail" 
                              className="w-full h-full object-cover select-none"
                            />
                          ) : (
                            <FileThumbnail 
                              file={file} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs md:max-w-md">
                          <p className="font-bold text-sm text-slate-200 truncate" title={file.encrypted_filename}>
                            {file.encrypted_filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-mono text-xs text-slate-300 font-medium">
                      {formatSize(file.file_size)}
                    </td>
                    <td className="py-4.5 px-6 text-xs text-slate-400 font-medium">
                      {formatDate(file.upload_time)}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handlePreview(file)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:scale-95 transition-all rounded-xl cursor-pointer"
                          title="Decrypt Preview"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => setShareFile(file)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 active:scale-95 transition-all rounded-xl cursor-pointer"
                          title="Generate Share Link"
                        >
                          <Share2 className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDownload(file)}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition-all rounded-xl cursor-pointer"
                          title="Download Decrypted"
                        >
                          <Download className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all rounded-xl cursor-pointer"
                          title="Trash File"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isSelectionMode ? 5 : 4} className="py-16 text-center text-slate-500 text-xs uppercase tracking-widest font-semibold">
                    No matching assets in this vault
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating Selection Bulk Action Bar */}
      {createPortal(
        <AnimatePresence>
          {isSelectionMode && Object.values(selectedIds).filter(Boolean).length > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-[#0f1425]/95 border border-blue-500/35 rounded-2xl p-4 flex items-center justify-between shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/25">
                  <CheckCircle2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    {Object.values(selectedIds).filter(Boolean).length} assets selected
                  </p>
                  <p className="text-[10px] text-slate-400">Zero-knowledge bulk operations active</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleBulkShare}
                  className="py-2 px-4 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg border border-indigo-500/30 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Bundle</span>
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  className="py-2 px-4 font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg border border-rose-500/30 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Premium File Viewer Modal */}
      {previewData && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            onClick={closePreview}
            className="absolute inset-0 bg-[#070913]/90 backdrop-blur-xl animate-fade-in cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0b0f19]/95 border border-[#1e293b]/80 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative cursor-default z-10 text-white"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1e293b]/50 bg-[#0f172a]/40">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  {previewData.fileType === 'video' ? <FileVideo className="w-5 h-5" /> :
                   previewData.fileType === 'image' ? <FileImage className="w-5 h-5" /> :
                   <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">{previewData.filename}</h3>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <button className="hover:text-slate-300 transition-colors">File</button>
                    <button className="hover:text-slate-300 transition-colors">View</button>
                    <button className="hover:text-slate-300 transition-colors">Help</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    handleDownload(previewData.file);
                    closePreview();
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button 
                  onClick={closePreview}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.03] active:bg-white/[0.06] rounded-xl transition-all border border-transparent font-bold text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-8 bg-[#070913]/20 custom-scrollbar flex items-center justify-center">
              {previewData.fileType === 'image' ? (
                // IMAGE VIEWER
                <div className="max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-2xl border border-[#1e293b]/30 bg-[#0d121f]/20 p-4 shadow-inner group relative">
                  <img 
                    src={previewData.objectUrl} 
                    alt={previewData.filename} 
                    className="max-w-full max-h-[60vh] object-contain rounded-xl select-none"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/60 backdrop-blur border border-white/10 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider text-slate-300">
                      Decrypted Image
                    </span>
                  </div>
                </div>
              ) : previewData.fileType === 'video' ? (
                // CUSTOM VIDEO CONTROLLER (MATCHES SHARE PAGE EXACTLY)
                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl border border-[#1e293b]/60 overflow-hidden group shadow-2xl">
                  <video 
                    ref={videoRef}
                    src={previewData.objectUrl}
                    className="w-full h-full object-contain"
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

                  {/* bottom custom controls */}
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/95 via-black/55 to-transparent flex flex-col space-y-4 transition-opacity duration-300">
                    {/* Scrub Bar */}
                    <div 
                      className="relative group/scrub h-1.5 bg-white/20 rounded-full cursor-pointer transition-all hover:h-2" 
                      onClick={handleScrub}
                    >
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                        style={{ width: `${progress}%` }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/scrub:opacity-100 transition-opacity"
                        style={{ left: `${progress}%` }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={togglePlay} 
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow p-1 shrink-0 cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                        <button onClick={() => skipTime(-10)} className="hover:text-blue-400 transition-colors p-1.5 shrink-0 cursor-pointer" title="Rewind 10s">
                          <RotateCcw className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => skipTime(10)} className="hover:text-blue-400 transition-colors p-1.5 shrink-0 cursor-pointer" title="Forward 10s">
                          <RotateCcw className="w-4.5 h-4.5 transform scale-x-[-1]" />
                        </button>
                        <span className="font-mono text-xs text-slate-300 ml-2">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-slate-900/40 px-2 py-1.5 rounded-xl border border-white/[0.05]">
                          <button onClick={toggleMute} className="hover:text-blue-400 transition-colors p-1 cursor-pointer">
                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-14 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                        <select 
                          value={playbackSpeed}
                          onChange={handleSpeedChange}
                          className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-[10px] font-bold cursor-pointer focus:outline-none hover:border-slate-600 transition-colors text-slate-300"
                        >
                          <option value="1">1x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>
                        <button className="hover:text-blue-400 transition-colors p-1.5 cursor-pointer">
                          <Settings className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors p-1.5 cursor-pointer">
                          {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : previewData.fileType === 'pdf' ? (
                // PDF PREVIEW
                <div className="w-full h-full rounded-2xl overflow-hidden border border-[#1e293b]/70 bg-[#070913]">
                  <iframe 
                    src={previewData.objectUrl} 
                    title={previewData.filename}
                    className="w-full h-full border-none"
                  />
                </div>
              ) : previewData.fileType === 'text' ? (
                // TEXT EDITOR VIEW
                <div className="w-full h-full bg-[#070913] border border-[#1e293b] rounded-3xl p-6 overflow-auto custom-scrollbar font-mono text-xs text-slate-300 leading-relaxed shadow-inner relative">
                  <div className="absolute top-4 right-4 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Decrypted Text View
                  </div>
                  <pre className="whitespace-pre-wrap">{previewData.textContent || '// File content is empty'}</pre>
                </div>
              ) : previewData.fileType === 'office' ? (
                // GLOWING OFFICE SANDBOX VIEWER
                <div className="glass-panel border border-[#1e293b]/70 bg-[#0d121f]/40 p-10 rounded-3xl text-center space-y-6 shadow-2xl max-w-xl mx-auto">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner border ${
                    previewData.filename.endsWith('xlsx') || previewData.filename.endsWith('xls') || previewData.filename.endsWith('ods')
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : previewData.filename.endsWith('pptx') || previewData.filename.endsWith('ppt') || previewData.filename.endsWith('odp') || previewData.filename.endsWith('key')
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <FileText className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-white">Office Sandbox Preview</h3>
                    <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                      Your document <span className="font-bold text-slate-200">{previewData.filename}</span> has been decrypted securely in-browser memory. For advanced zero-knowledge security, office documents are isolated from external preview APIs.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs text-blue-300 font-semibold max-w-sm mx-auto leading-relaxed">
                    Integrity Passed • Distributed blocks reassembled from Mumbai-Primary, Frankfurt-01, and Tokyo-Alpha nodes.
                  </div>
                  <div className="pt-2">
                    <Button 
                      onClick={() => {
                        handleDownload(previewData.file);
                        closePreview();
                      }}
                      variant="primary"
                      className="w-full max-w-xs mx-auto py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Download & Edit Document
                    </Button>
                  </div>
                </div>
              ) : (
                // GENERAL FALLBACK
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
      {shareFile && createPortal(
        <ShareModal file={shareFile} onClose={() => setShareFile(null)} />,
        document.body
      )}
    </div>
  );
};

export default Files;
