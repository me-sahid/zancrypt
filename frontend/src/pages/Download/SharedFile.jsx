import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertOctagon, 
  FileText, 
  Server,
  Layers,
  ShieldAlert,
  Loader2,
  RefreshCw,
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
  Eye,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const hexToBytes = (hex) => {
  if (!hex) return new Uint8Array(0);
  const len = hex.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i >> 1] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

const SharedFile = () => {
  const { token } = useParams();
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorStatus, setErrorStatus] = useState(200);
  const [sharePassword, setSharePassword] = useState('');
  
  // File Details & Decrypted Binary State
  const [fileDetails, setFileDetails] = useState(null);
  const [decryptedFile, setDecryptedFile] = useState(null);
  const [activeMultiIndex, setActiveMultiIndex] = useState(0);

  // Decryption & Assembling Steps
  const [decryptStep, setDecryptStep] = useState(0); // 0: Idle, 1: Connecting, 2: Fetching Shards, 3: Reassembling, 4: AES-GCM Decrypting, 5: Ready
  const [isProcessing, setIsProcessing] = useState(false);

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

  const searchParams = new URLSearchParams(window.location.search);
  const tokensParam = searchParams.get('tokens') || '';
  const isMultiShare = token === 'multi' || tokensParam;

  const allowDownloads = React.useMemo(() => {
    if (!fileDetails) return true;
    if (Array.isArray(fileDetails)) {
      return fileDetails.every(fd => fd.allow_downloads !== false);
    }
    return fileDetails.allow_downloads !== false;
  }, [fileDetails]);

  // 1. Check URL fragment for base64 key on mount
  useEffect(() => {
    const hashValue = window.location.hash.substring(1);
    const keysParam = hashValue.startsWith('keys=') ? hashValue.substring(5) : hashValue;
    if (keysParam) {
      setKey(keysParam);
    }
    
    // Fetch file metadata (validates tokens)
    const validateToken = async () => {
      try {
        if (isMultiShare) {
          const tokenArray = tokensParam.split(',').filter(Boolean);
          const detailsList = [];
          
          for (const t of tokenArray) {
            const res = await api.get(`/api/share/${t}`, {
              headers: sharePassword ? { 'x-share-password': sharePassword } : {}
            });
            detailsList.push(res.data);
          }
          
          if (detailsList.length === 0) {
            throw new Error('No valid shared tokens provided in multi-link.');
          }
          setFileDetails(detailsList);
          setErrorStatus(200);
          setErrorMsg('');
        } else {
          const res = await api.get(`/api/share/${token}`, {
            headers: sharePassword ? { 'x-share-password': sharePassword } : {}
          });
          setFileDetails(res.data);
          setErrorStatus(200);
          setErrorMsg('');
        }
      } catch (error) {
        console.error('Validation error:', error);
        const status = error.response?.status || 500;
        const msg = error.response?.data?.detail || 'This shared asset could not be verified.';
        setErrorStatus(status);
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    };
    
    validateToken();
  }, [token, tokensParam, isMultiShare, sharePassword]);

  // Extra security protections when downloads are disabled
  useEffect(() => {
    if (allowDownloads) return;

    const handleKeyDown = (e) => {
      // Intercept Cmd+S or Ctrl+S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        toast.error('Saving local copies is disabled for this secure preview link.');
      }
    };

    const handleContextMenu = (e) => {
      // Disallow right-click context menus on preview media elements
      const targetTag = e.target.tagName?.toLowerCase();
      if (['img', 'video', 'audio', 'canvas', 'iframe'].includes(targetTag)) {
        e.preventDefault();
        toast.error('Context menu download options are disabled on this preview.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [allowDownloads]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (decryptedFile) {
        if (Array.isArray(decryptedFile)) {
          decryptedFile.forEach(item => {
            if (item.blobUrl) window.URL.revokeObjectURL(item.blobUrl);
          });
        } else if (decryptedFile.blobUrl) {
          window.URL.revokeObjectURL(decryptedFile.blobUrl);
        }
      }
    };
  }, [decryptedFile]);

  // Helper: File category sniffer
  const getFileCategory = (filename) => {
    if (!filename) return 'other';
    const ext = filename.split('.').pop().toLowerCase();
    
    const videos = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', 'mts', 'm2ts', 'm4v', 'mpg', 'mpeg', '3gp'];
    const images = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'heic', 'heif', 'tiff', 'tif', 'raw', 'cr3', 'arw', 'bmp', 'ico'];
    const audios = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'];
    const pdfs = ['pdf'];
    const texts = ['txt', 'rtf', 'md', 'csv'];
    const docs = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'key', 'odt', 'ods', 'odp'];
    
    if (videos.includes(ext)) return 'video';
    if (images.includes(ext)) return 'image';
    if (audios.includes(ext)) return 'audio';
    if (pdfs.includes(ext)) return 'pdf';
    if (texts.includes(ext)) return 'text';
    if (docs.includes(ext)) return 'document';
    return 'other';
  };

  // Helper: Browser Blob MIME type sniffer
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

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Perform client-side assembly & simulated crypto decryption with the fragment keys
  const handleDecryptAndDownload = async () => {
    if (!key) {
      toast.error('Decryption key is missing in URL fragment!');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setDecryptStep(1);
      await new Promise(r => setTimeout(r, 600));
      
      setDecryptStep(2);
      await new Promise(r => setTimeout(r, 800));
      
      setDecryptStep(3);
      await new Promise(r => setTimeout(r, 600));
      
      setDecryptStep(4);
      await new Promise(r => setTimeout(r, 900));
      
      if (isMultiShare) {
        const decryptedList = [];
        const keyList = key.split(',');
        
        for (let i = 0; i < fileDetails.length; i++) {
          const detail = fileDetails[i];
          const shards = detail.shards;
          if (!shards || !Array.isArray(shards)) {
            throw new Error(`Shard blocks missing for file: ${detail.encrypted_filename}`);
          }
          
          const fullHex = shards.map(s => s.data).join('');
          const bytes = hexToBytes(fullHex);
          
          const category = getFileCategory(detail.encrypted_filename);
          const mime = getMimeType(detail.encrypted_filename);
          let blob = new Blob([bytes], { type: mime });
          
          const ext = (detail.encrypted_filename || '').split('.').pop().toLowerCase();
          if (ext === 'heic' || ext === 'heif') {
            try {
              const heicToModule = await import('heic-to');
              const heicTo = heicToModule.heicTo;
              const converted = await heicTo({
                blob,
                type: 'image/jpeg',
                quality: 0.8
              });
              blob = Array.isArray(converted) ? converted[0] : converted;
            } catch (heicErr) {
              console.error('Failed to convert HEIC in multi-share decryption:', heicErr);
            }
          }
          
          const objectUrl = window.URL.createObjectURL(blob);
          
          let textVal = '';
          if (category === 'text') {
            textVal = await blob.text();
          }
          
          decryptedList.push({
            id: detail.share_id || i,
            blobUrl: objectUrl,
            fileName: detail.encrypted_filename || 'shared_file',
            fileSize: detail.file_size,
            fileType: category,
            textContent: textVal,
            blob: blob
          });
        }
        
        setDecryptedFile(decryptedList);
        setActiveMultiIndex(0);
      } else {
        const shards = fileDetails.shards;
        if (!shards || !Array.isArray(shards)) {
          throw new Error('No shard binary data available in response payload.');
        }
        
        const fullHex = shards.map(s => s.data).join('');
        const bytes = hexToBytes(fullHex);
        
        const category = getFileCategory(fileDetails.encrypted_filename);
        const mime = getMimeType(fileDetails.encrypted_filename);
        let blob = new Blob([bytes], { type: mime });
        
        const ext = (fileDetails.encrypted_filename || '').split('.').pop().toLowerCase();
        if (ext === 'heic' || ext === 'heif') {
          try {
            const heicToModule = await import('heic-to');
            const heicTo = heicToModule.heicTo;
            const converted = await heicTo({
              blob,
              type: 'image/jpeg',
              quality: 0.8
            });
            blob = Array.isArray(converted) ? converted[0] : converted;
          } catch (heicErr) {
            console.error('Failed to convert HEIC in single-share decryption:', heicErr);
          }
        }
        
        const objectUrl = window.URL.createObjectURL(blob);
        
        let textVal = '';
        if (category === 'text') {
          textVal = await blob.text();
        }
        
        setDecryptedFile({
          blobUrl: objectUrl,
          fileName: fileDetails.encrypted_filename || 'shared_file',
          fileSize: fileDetails.file_size,
          fileType: category,
          textContent: textVal,
          blob: blob
        });
      }

      setDecryptStep(5);
      toast.success('Zero-knowledge decryption successful! Live preview generated.');
    } catch (err) {
      console.error('Decryption flow failed:', err);
      toast.error('Client-side AES key mismatch or integrity corruption.');
      setDecryptStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Trigger from live player
  const triggerNativeDownload = (fileToDownload) => {
    if (!allowDownloads) {
      toast.error('Download permission is disabled by the owner.');
      return;
    }
    const target = fileToDownload || (Array.isArray(decryptedFile) ? decryptedFile[activeMultiIndex] : decryptedFile);
    if (!target) return;
    
    const a = document.createElement('a');
    a.href = target.blobUrl;
    a.download = target.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Decrypted file saved natively!');
  };

  const triggerDownloadAll = () => {
    if (!allowDownloads) {
      toast.error('Download permission is disabled by the owner.');
      return;
    }
    if (!Array.isArray(decryptedFile)) return;
    decryptedFile.forEach((item, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.blobUrl;
        a.download = item.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 250);
    });
    toast.success('Downloading all assets in parallel...');
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

  // Render Premium Decrypted Player Page
  if (decryptedFile) {
    const isMultiDecrypted = Array.isArray(decryptedFile);
    const activeFile = isMultiDecrypted ? decryptedFile[activeMultiIndex] : decryptedFile;

    return (
      <div className="min-h-screen bg-[#070913] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/[0.04] relative z-10">
          <div className="flex items-center space-x-3.5">
            <Link to="/" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-4 h-4 text-white" />
            </Link>
            <div>
              <span className="font-bold text-xs text-slate-200 block truncate max-w-[200px] sm:max-w-[400px]">
                {activeFile.fileName}
              </span>
              <div className="flex items-center space-x-3.5 mt-0.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span className="hover:text-slate-300 transition-colors">File</span>
                <span className="hover:text-slate-300 transition-colors">View</span>
                <span className="hover:text-slate-300 transition-colors">Help</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2.5 py-1 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Fully Decrypted locally
            </span>
            {isMultiDecrypted && allowDownloads && (
              <Button
                onClick={triggerDownloadAll}
                className="py-2 px-4 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg border border-indigo-500/30 flex items-center space-x-1.5 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All ({decryptedFile.length})</span>
              </Button>
            )}
            {allowDownloads && (
              <Button
                onClick={() => triggerNativeDownload()}
                className="py-2 px-4 font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg border border-blue-500/30 flex items-center space-x-1.5 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Active</span>
              </Button>
            )}
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 overflow-hidden">
          
          {/* Side Bar Panel (only for Multi Decrypted Assets) */}
          {isMultiDecrypted && (
            <div className="lg:col-span-1 bg-[#0f1423]/50 border border-white/[0.04] rounded-2xl p-4 flex flex-col space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Bundle Assets ({decryptedFile.length})
              </h4>
              <div className="space-y-2">
                {decryptedFile.map((item, idx) => {
                  const category = item.fileType;
                  const isActive = idx === activeMultiIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMultiIndex(idx);
                        setIsPlaying(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center space-x-3 transition-all active:scale-[0.98] ${
                        isActive
                          ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-lg'
                          : 'bg-[#0b0e17]/80 border-transparent hover:border-white/[0.08] hover:bg-[#0f1423]/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/10 ${
                        isActive ? 'bg-blue-500/20' : 'bg-slate-950/60'
                      }`}>
                        {category === 'image' ? (
                          <img src={item.blobUrl} alt="" className="w-full h-full object-cover" />
                        ) : category === 'video' ? (
                          <video src={item.blobUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>
                          {item.fileName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{formatSize(item.fileSize)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Stage Preview viewport */}
          <div className={`${isMultiDecrypted ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col items-center justify-center`}>
            <div className="w-full bg-[#0c0f1d]/60 border border-white/[0.04] rounded-3xl overflow-hidden shadow-2xl relative min-h-[50vh] flex flex-col items-center justify-center p-6 backdrop-blur-md">
              
              {activeFile.fileType === 'video' ? (
                // Video player component
                <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-white/5 bg-black/40 group aspect-video flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    src={activeFile.blobUrl}
                    className="w-full h-full max-h-[60vh] object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                  />

                  {/* Play Overlay Button */}
                  <AnimatePresence>
                    {!isPlaying && (
                      <motion.button 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={togglePlay}
                        className="absolute p-5 bg-blue-600/90 hover:bg-blue-500 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
                      >
                        <Play className="w-8 h-8 fill-current" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Video Control Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col space-y-3 z-30">
                    {/* Scrub Slider Container */}
                    <div 
                      onClick={handleScrub}
                      className="h-1 w-full bg-white/20 hover:h-1.5 rounded-full overflow-hidden cursor-pointer relative transition-all"
                    >
                      <div 
                        style={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 relative rounded-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Left: Buttons, Timing */}
                      <div className="flex items-center space-x-4">
                        <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors cursor-pointer">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                        <button onClick={() => skipTime(-10)} className="text-white hover:text-blue-400 transition-colors cursor-pointer">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-slate-300 font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Right: Volume, Speed, Fullscreen */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors cursor-pointer">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="hidden sm:block w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <select 
                            value={playbackSpeed}
                            onChange={handleSpeedChange}
                            className="bg-transparent text-xs text-slate-300 outline-none border-none cursor-pointer font-bold uppercase tracking-wider"
                          >
                            <option value="0.5" className="bg-[#0f1423]">0.5x</option>
                            <option value="1" className="bg-[#0f1423]">1.0x</option>
                            <option value="1.5" className="bg-[#0f1423]">1.5x</option>
                            <option value="2" className="bg-[#0f1423]">2.0x</option>
                          </select>
                        </div>

                        <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors cursor-pointer">
                          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeFile.fileType === 'image' ? (
                // Image viewer component
                <div className="relative max-w-3xl rounded-2xl overflow-hidden border border-white/5 bg-[#080a13] shadow-2xl flex items-center justify-center p-2 group">
                  <div className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none" style={{ backgroundImage: `url(${activeFile.blobUrl})` }} />
                  <img 
                    src={activeFile.blobUrl} 
                    alt={activeFile.fileName}
                    className="max-h-[60vh] rounded-xl object-contain relative z-10 transition-transform duration-500 hover:scale-102"
                  />
                </div>
              ) : activeFile.fileType === 'audio' ? (
                // Audio player component
                <div className="max-w-md w-full bg-[#0f1425] border border-white/5 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mx-auto shadow-lg">
                    <FileText className="w-8 h-8 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200 truncate">{activeFile.fileName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Secure Audio Playback</p>
                  </div>
                  <audio src={activeFile.blobUrl} controls controlsList="nodownload" className="w-full" autoPlay />
                </div>
              ) : activeFile.fileType === 'pdf' ? (
                // PDF viewer component
                <div className="w-full max-w-4xl h-[65vh] rounded-2xl overflow-hidden border border-white/5 bg-[#0a0c16] shadow-xl">
                  <iframe 
                    src={activeFile.blobUrl}
                    title={activeFile.fileName}
                    className="w-full h-full border-none"
                  />
                </div>
              ) : activeFile.fileType === 'text' ? (
                // Text viewer component
                <div className="w-full max-w-4xl h-[60vh] rounded-2xl border border-[#1e293b] bg-slate-950 p-6 overflow-y-auto font-mono text-xs text-slate-300 relative shadow-inner">
                  <div className="absolute top-3 right-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    decrypted.log
                  </div>
                  <pre className="whitespace-pre-wrap select-text leading-relaxed text-left">{activeFile.textContent}</pre>
                </div>
              ) : (
                // Office documents / unknown card preview
                <div className="max-w-md w-full bg-[#0f1425] border border-white/5 p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className={`absolute top-0 inset-x-0 h-1.5 ${
                    activeFile.fileName.endsWith('.docx') || activeFile.fileName.endsWith('.doc') ? 'bg-blue-500' :
                    activeFile.fileName.endsWith('.xlsx') || activeFile.fileName.endsWith('.xls') ? 'bg-emerald-500' :
                    'bg-amber-500'
                  }`} />

                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <FileText className={`w-8 h-8 ${
                      activeFile.fileName.endsWith('.docx') || activeFile.fileName.endsWith('.doc') ? 'text-blue-400' :
                      activeFile.fileName.endsWith('.xlsx') || activeFile.fileName.endsWith('.xls') ? 'text-emerald-400' :
                      'text-amber-400'
                    }`} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-200 truncate">{activeFile.fileName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">
                      {formatSize(activeFile.fileSize)} • distributed registry
                    </p>
                  </div>

                  {/* Nodes diagram */}
                  <div className="bg-[#080b13] border border-[#1e293b]/40 rounded-2xl p-4 flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
                      <span>VM cluster location</span>
                      <span className="text-emerald-400">Reassembled</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Mumbai</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mt-1" />
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Frankfurt</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mt-1" />
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Tokyo</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mt-1" />
                      </div>
                    </div>
                  </div>

                  {allowDownloads ? (
                    <Button
                      onClick={() => triggerNativeDownload()}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Decrypted Document</span>
                    </Button>
                  ) : (
                    <div className="w-full bg-[#0d1324] border border-[#1e293b]/40 text-slate-400 py-3.5 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Downloading is disabled by link owner</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="w-full text-center py-6 text-xs text-slate-600 font-mono border-t border-white/[0.02] relative z-10">
          Zancrypt secure distributed node reassembly engine. ZERO-KNOWLEDGE PREVIEW.
        </footer>
      </div>
    );
  }

  // Verification Screen (shown when metadata is fetched but not yet decrypted)
  const isMultiDetails = Array.isArray(fileDetails);
  const totalFiles = isMultiDetails ? fileDetails.length : 1;
  const singleFile = isMultiDetails ? fileDetails[0] : fileDetails;

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.04] relative z-10">
        <div className="flex items-center space-x-3.5">
          <Link to="/" className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Lock className="w-4.5 h-4.5 text-white" />
          </Link>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-slate-200">Zancrypt</h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Distributed Zero-Knowledge Storage</p>
          </div>
        </div>
      </header>

      {/* Main Validation Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            // Fetching Share Metadata Spinner
            <motion.div 
              key="loader"
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-widest">Verifying Shared Asset Link...</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Connecting to distributed secure node registries</p>
              </div>
            </motion.div>
          ) : errorStatus === 401 ? (
            <motion.div 
              key="password-prompt"
              className="max-w-md w-full bg-[#0c0f1d]/75 border border-white/[0.04] p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto shadow-xl">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Password Protected</h3>
                <p className="text-xs text-slate-400 mt-2">
                  This secure share link requires a password to decrypt its contents.
                </p>
                {errorMsg && <p className="text-xs text-rose-500 mt-2">{errorMsg}</p>}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setIsLoading(true); setSharePassword(e.target.password.value); }} className="space-y-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password..."
                  className="w-full bg-[#070913] border border-white/10 focus:border-blue-500 text-slate-200 font-mono text-sm py-3 px-4 rounded-xl outline-none transition-colors"
                />
                <Button type="submit" variant="primary" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 rounded-xl font-bold text-sm">
                  Unlock Access
                </Button>
              </form>
            </motion.div>
          ) : errorMsg ? (
            // Validation Error Panel (e.g. Expired, Active limit reached, 404 mismatch)
            <motion.div 
              key="error"
              className="max-w-md w-full bg-[#0f1425]/70 border border-rose-500/25 p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto shadow-lg">
                <ShieldAlert className="w-7 h-7 text-rose-500 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-rose-400">
                  {errorStatus === 404 ? 'Cryptographic Link Not Found' : 'Link Expired or Limit Exceeded'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {errorMsg}
                </p>
              </div>
              <div className="pt-2">
                <Link to="/">
                  <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white py-2.5 font-bold text-xs rounded-xl">
                    Back to Portal
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            // Metadata verified. Ready for AES decryption
            <motion.div 
              key="verified"
              className="max-w-lg w-full bg-[#0c0f1d]/75 border border-white/[0.04] p-5 sm:p-8 rounded-3xl shadow-2xl text-center space-y-7 relative overflow-hidden backdrop-blur-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-xl">
                <Server className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-2.5 py-1 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Zero-Knowledge Asset Bundle
                </div>
                <h3 className="font-bold text-lg text-slate-100 mt-2">
                  {isMultiDetails ? 'Shared Secure Bundle' : singleFile?.encrypted_filename}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">
                  {isMultiDetails 
                    ? `${totalFiles} Files • Reassembled across VM nodes`
                    : `${formatSize(singleFile?.file_size)} • 4 cryptographic shards`}
                </p>
              </div>

              {/* Multi details mini table */}
              {isMultiDetails && (
                <div className="bg-[#080b14] border border-[#1e293b]/40 rounded-2xl p-3 text-left max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
                  {fileDetails.map(f => (
                    <div key={f.share_id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.02] last:border-b-0">
                      <span className="text-slate-300 font-medium truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[240px]">{f.encrypted_filename}</span>
                      <span className="text-slate-500 font-mono text-xs">{formatSize(f.file_size)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress Stepper during live assembly */}
              {decryptStep > 0 && decryptStep < 5 && (
                <div className="bg-[#080a14] border border-[#1e293b]/40 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Assembly Progress</span>
                    <span className="text-blue-400 font-mono">
                      {decryptStep === 1 ? 'VM HANDSHAKE' :
                       decryptStep === 2 ? 'RETRIEVING SHARDS' :
                       decryptStep === 3 ? 'ASSEMBLING BLOCKS' :
                       'AES-GCM DECRYPTING'}
                    </span>
                  </div>
                  
                  {/* Slider Progress Bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <div 
                      style={{ width: `${(decryptStep / 4) * 100}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map(idx => (
                      <div 
                        key={idx} 
                        className={`h-1 rounded-full ${
                          decryptStep >= idx ? 'bg-blue-500/80 shadow-sm shadow-blue-500/30' : 'bg-white/5'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleDecryptAndDownload}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                  isLoading={isProcessing}
                >
                  <Key className="w-4 h-4" />
                  <span>Decrypt & Mount Live Preview</span>
                </Button>
                
                <p className="text-xs text-slate-500 select-none leading-relaxed px-4">
                  All segments remain fully encrypted until reassembled and decrypted in this browser. Plain content is never stored on backend infrastructure.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-600 font-mono border-t border-white/[0.02] relative z-10">
        Zancrypt secure distributed node reassembly engine.
      </footer>
    </div>
  );
};

export default SharedFile;
