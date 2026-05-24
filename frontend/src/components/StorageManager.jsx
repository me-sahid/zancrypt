import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, HardDrive, Trash2, File, FileText, Image, 
  Video, Music, Archive, AlertTriangle, ChevronDown, ChevronRight
} from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { fileService } from '../services/vaultServices';
import { toast } from 'react-hot-toast';
import FileThumbnail from './vault/FileThumbnail';

// Reusing the comprehensive file category logic
export const getFileCategory = (filename) => {
  if (!filename) return 'unknown';
  const ext = filename.split('.').pop().toLowerCase();
  
  const videoExts = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', 'mts', 'm2ts', 'm4v', 'mpg', 'mpeg', '3gp'];
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'heic', 'heif', 'tiff', 'tif', 'raw', 'cr3', 'arw', 'bmp', 'ico'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'alac', 'aiff'];
  const documentExts = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'key', 'odt', 'ods', 'odp'];
  const textExts = ['txt', 'md', 'csv', 'rtf', 'log', 'json', 'xml'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (videoExts.includes(ext)) return 'video';
  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'audio';
  if (documentExts.includes(ext)) return 'document';
  if (textExts.includes(ext)) return 'text';
  if (archiveExts.includes(ext)) return 'archive';
  
  return 'unknown';
};

const CATEGORY_COLORS = {
  video: 'bg-purple-500',
  image: 'bg-blue-500',
  audio: 'bg-fuchsia-500',
  document: 'bg-emerald-500',
  text: 'bg-amber-500',
  archive: 'bg-orange-500',
  unknown: 'bg-slate-500'
};

const CATEGORY_ICONS = {
  video: Video,
  image: Image,
  audio: Music,
  document: FileText,
  text: FileText,
  archive: Archive,
  unknown: File
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StorageManager = () => {
  const { files: currentViewFiles, isStorageManagerOpen, setStorageManagerOpen, setFiles: setCurrentViewFiles } = useDashboardStore();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [allFiles, setAllFiles] = useState([]);

  React.useEffect(() => {
    if (isStorageManagerOpen) {
      setIsFetching(true);
      fileService.listFiles(null, true)
        .then(res => {
          if (res?.data) setAllFiles(res.data);
        })
        .finally(() => setIsFetching(false));
    }
  }, [isStorageManagerOpen]);

  const TOTAL_QUOTA = 5 * 1024 * 1024 * 1024; // 5 GB

  const { totalUsed, categories } = useMemo(() => {
    let used = 0;
    const catMap = {
      video: { id: 'video', label: 'Videos', size: 0, files: [] },
      image: { id: 'image', label: 'Images', size: 0, files: [] },
      audio: { id: 'audio', label: 'Audio', size: 0, files: [] },
      document: { id: 'document', label: 'Documents', size: 0, files: [] },
      text: { id: 'text', label: 'Text & Data', size: 0, files: [] },
      archive: { id: 'archive', label: 'Archives', size: 0, files: [] },
      unknown: { id: 'unknown', label: 'Other', size: 0, files: [] },
    };

    (allFiles || []).forEach(f => {
      const size = f.file_size || 0;
      used += size;
      const cat = getFileCategory(f.encrypted_filename || f.filename);
      if (catMap[cat]) {
        catMap[cat].size += size;
        catMap[cat].files.push(f);
      }
    });

    const sortedCats = Object.values(catMap)
      .filter(c => c.size > 0)
      .sort((a, b) => b.size - a.size);

    return { totalUsed: used, categories: sortedCats };
  }, [allFiles]);

  if (!isStorageManagerOpen) return null;

  const handleDelete = async (e, fileId) => {
    e.stopPropagation();
    setIsDeleting(fileId);
    try {
      await fileService.deleteFile(fileId);
      // Optimistically update the store and allFiles so UI feels instant
      setAllFiles((prev) => prev.filter(f => f.id !== fileId));
      setCurrentViewFiles((currentViewFiles || []).filter(f => f.id !== fileId));
      toast.success('File moved to Recycle Bin');
    } catch (err) {
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-void/90 backdrop-blur-md cursor-pointer"
        onClick={() => setStorageManagerOpen(false)}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-surface border border-border shadow-2xl relative z-10 flex flex-col max-h-[85vh] rounded-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-void">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-accent" />
            <h3 className="font-mono text-base text-text-primary uppercase tracking-widest">
              Storage Manager
            </h3>
            {isFetching && (
              <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin ml-2" />
            )}
          </div>
          <button 
            onClick={() => setStorageManagerOpen(false)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-surface overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Progress Bar Section */}
          <div className="space-y-4">
            <div className="flex items-end justify-between font-mono text-xs">
              <div>
                <span className="text-2xl text-text-primary block mb-1">{formatSize(totalUsed)}</span>
                <span className="text-text-muted uppercase tracking-widest">Used of {formatSize(TOTAL_QUOTA)}</span>
              </div>
              <div className="text-right">
                <span className="text-accent">{((totalUsed / TOTAL_QUOTA) * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="w-full h-4 bg-void border border-border rounded-full overflow-hidden flex">
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  className={`h-full ${CATEGORY_COLORS[cat.id]} transition-all duration-500 hover:opacity-80`}
                  style={{ width: `${(cat.size / totalUsed) * 100}%` }}
                  title={`${cat.label}: ${formatSize(cat.size)}`}
                />
              ))}
            </div>
          </div>

          {/* Categories Accordion */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-text-muted border-b border-border pb-2">
              Distribution Breakdown
            </h4>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-text-muted font-mono text-xs uppercase tracking-widest">
                No storage consumed
              </div>
            ) : (
              categories.map(cat => {
                const Icon = CATEGORY_ICONS[cat.id];
                const isExpanded = expandedCategory === cat.id;
                
                return (
                  <div key={cat.id} className="border border-border bg-void rounded-lg overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface transition-colors focus:outline-none"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.id]}`} />
                        <Icon className="w-5 h-5 text-text-secondary" />
                        <span className="font-mono text-sm text-text-primary">{cat.label}</span>
                        <span className="font-mono text-xs text-text-muted px-2 py-0.5 bg-surface rounded">
                          {cat.files.length} items
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-sm text-text-primary">{formatSize(cat.size)}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border bg-surface-raised max-h-64 overflow-y-auto custom-scrollbar"
                        >
                          {cat.files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                              <div className="flex items-center space-x-3 overflow-hidden flex-1">
                                <div className="w-8 h-8 shrink-0 rounded overflow-hidden border border-border bg-void">
                                  <FileThumbnail 
                                    file={file} 
                                    decryptedName={file.encrypted_filename || file.filename || 'Unknown File'} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <span className="font-mono text-xs text-text-secondary truncate">
                                  {file.encrypted_filename || file.filename || 'Unknown File'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 shrink-0 pl-4">
                                <span className="font-mono text-xs text-text-muted">{formatSize(file.file_size)}</span>
                                <button
                                  onClick={(e) => handleDelete(e, file.id)}
                                  disabled={isDeleting === file.id}
                                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                  title="Delete File"
                                >
                                  {isDeleting === file.id ? (
                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StorageManager;
