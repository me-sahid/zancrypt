import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  Loader2, 
  FileText, 
  FileImage, 
  FileVideo,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Database,
  Lock,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { fileService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// Category Sniffer
const getFileCategory = (filename) => {
  if (!filename) return 'other';
  const ext = filename.split('.').pop().toLowerCase();
  
  const videos = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', 'mts', 'm2ts', 'm4v', 'mpg', 'mpeg', '3gp'];
  const images = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'heic', 'heif', 'tiff', 'tif', 'raw', 'cr3', 'arw', 'bmp', 'ico'];
  
  if (videos.includes(ext)) return 'video';
  if (images.includes(ext)) return 'image';
  return 'other';
};

export default function RecycleBin() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedIds, setSelectedIds] = useState({});
  const [sortField, setSortField] = useState('deleted_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const fetchBinFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fileService.listBinFiles();
      if (res?.data) setFiles(res.data);
    } catch (error) {
      console.error('Failed to fetch deleted files:', error);
      toast.error('Could not refresh Recycle Bin');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBinFiles();
  }, []);

  const handleRestore = async (id, filename) => {
    try {
      await fileService.restoreFile(id);
      toast.success(`Restored "${filename || 'file'}" to My Vault`);
      fetchBinFiles();
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Failed to restore file');
    }
  };

  const handlePurge = async (id, filename) => {
    const confirm = window.confirm(`Are you absolutely sure you want to permanently delete "${filename || 'this file'}"? This action cannot be undone and all encrypted shards will be destroyed.`);
    if (!confirm) return;

    try {
      await fileService.purgeFile(id);
      toast.success(`Permanently destroyed file shards`);
      fetchBinFiles();
    } catch (error) {
      console.error('Purge failed:', error);
      toast.error('Failed to permanently delete file');
    }
  };

  const handleEmptyBin = async () => {
    if (files.length === 0) return;
    const confirm = window.confirm(`Are you absolutely sure you want to permanently purge all ${files.length} assets in the Recycle Bin? All encrypted node shards will be wiped permanently!`);
    if (!confirm) return;

    toast.loading('Purging all trash files...', { id: 'empty-bin-toast' });
    try {
      for (const file of files) {
        await fileService.purgeFile(file.id);
      }
      toast.success('Successfully emptied the Recycle Bin', { id: 'empty-bin-toast' });
      fetchBinFiles();
      setSelectedIds({});
    } catch (error) {
      console.error('Empty bin failed:', error);
      toast.error('Failed to empty all trash files completely', { id: 'empty-bin-toast' });
    }
  };

  // Bulk Operations
  const toggleSelectFile = (fileId) => {
    setSelectedIds(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const filteredFiles = React.useMemo(() => {
    const filtered = files.filter(f => 
      (f.encrypted_filename || f.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!sortField) return filtered;

    return [...filtered].sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = (a.encrypted_filename || a.filename || '').toLowerCase();
        valB = (b.encrypted_filename || b.filename || '').toLowerCase();
      } else if (sortField === 'size') {
        valA = a.file_size || 0;
        valB = b.file_size || 0;
      } else if (sortField === 'deleted_at') {
        valA = a.deleted_at || a.upload_time || '';
        valB = b.deleted_at || b.upload_time || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [files, searchQuery, sortField, sortDirection]);

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

  const handleBulkRestore = async () => {
    const idsToRestore = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (idsToRestore.length === 0) return;

    toast.loading(`Restoring ${idsToRestore.length} files...`, { id: 'bulk-restore-toast' });
    try {
      for (const id of idsToRestore) {
        await fileService.restoreFile(id);
      }
      toast.success(`Successfully restored ${idsToRestore.length} files to My Vault`, { id: 'bulk-restore-toast' });
      setSelectedIds({});
      fetchBinFiles();
    } catch (error) {
      console.error('Bulk restore failed:', error);
      toast.error('Failed to complete bulk restore operations', { id: 'bulk-restore-toast' });
    }
  };

  const handleBulkPurge = async () => {
    const idsToPurge = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (idsToPurge.length === 0) return;

    const confirm = window.confirm(`Are you absolutely sure you want to permanently delete these ${idsToPurge.length} selected files? All encrypted VM shards will be completely destroyed!`);
    if (!confirm) return;

    toast.loading(`Permanently purging ${idsToPurge.length} files...`, { id: 'bulk-purge-toast' });
    try {
      for (const id of idsToPurge) {
        await fileService.purgeFile(id);
      }
      toast.success(`Permanently destroyed ${idsToPurge.length} files`, { id: 'bulk-purge-toast' });
      setSelectedIds({});
      fetchBinFiles();
    } catch (error) {
      console.error('Bulk purge failed:', error);
      toast.error('Failed to complete bulk purge operations', { id: 'bulk-purge-toast' });
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Trash2 className="w-5.5 h-5.5 mr-2.5 text-rose-500" />
            Recycle Bin
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review soft-deleted files. You can restore them to your vault or permanently destroy them from distributed nodes.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {Object.values(selectedIds).filter(Boolean).length > 0 && (
            <Button
              onClick={() => {
                setSelectedIds({});
              }}
              variant="outline"
              className="font-bold border-rose-500/35 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all text-xs rounded-xl py-2 px-4 cursor-pointer"
            >
              Clear Selection
            </Button>
          )}
          
          {files.length > 0 && (
            <Button 
              onClick={handleEmptyBin}
              variant="outline" 
              className="bg-rose-600/10 border-rose-500/30 text-rose-400 hover:bg-rose-600/20 active:scale-95 transition-all text-xs font-bold rounded-xl py-2 px-4 cursor-pointer"
            >
              Empty Bin
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <Card className="bg-[#0b0f19]/70 border-[#1e293b]/70 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:flex-1">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <Input 
              type="text" 
              placeholder="Filter bin by filename..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#070913]/40 border-[#1e293b]/60 text-slate-200 placeholder-slate-500 rounded-xl focus:border-rose-500/40 text-xs w-full py-2.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bin Files Table */}
      <Card className="bg-[#0b0f19]/50 border-[#1e293b]/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#0f172a]/20">
                <th className="py-4 px-6 w-12 text-center select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#1e293b] bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6 select-none cursor-pointer group/hdr" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors">
                    <span>File Name</span>
                    <span className={`transition-all duration-200 ${sortField === 'name' ? 'text-blue-400 opacity-100' : 'text-slate-500 opacity-0 group-hover/hdr:opacity-100'}`}>
                      {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    </span>
                  </div>
                </th>
                <th className="py-4 px-6 hidden sm:table-cell select-none cursor-pointer group/hdr" onClick={() => handleSort('size')}>
                  <div className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors">
                    <span>Original Size</span>
                    <span className={`transition-all duration-200 ${sortField === 'size' ? 'text-blue-400 opacity-100' : 'text-slate-500 opacity-0 group-hover/hdr:opacity-100'}`}>
                      {sortField === 'size' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    </span>
                  </div>
                </th>
                <th className="py-4 px-6 hidden sm:table-cell select-none cursor-pointer group/hdr" onClick={() => handleSort('deleted_at')}>
                  <div className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors">
                    <span>Deleted At</span>
                    <span className={`transition-all duration-200 ${sortField === 'deleted_at' ? 'text-blue-400 opacity-100' : 'text-slate-500 opacity-0 group-hover/hdr:opacity-100'}`}>
                      {sortField === 'deleted_at' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    </span>
                  </div>
                </th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs mt-3 uppercase tracking-wider font-semibold">Loading trash bin...</p>
                  </td>
                </tr>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    onClick={(e) => {
                      if (e.target.tagName !== 'BUTTON' && !e.target.closest('button') && e.target.type !== 'checkbox' && !e.target.closest('input[type="checkbox"]')) {
                        toggleSelectFile(file.id);
                      }
                    }}
                    className={`hover:bg-slate-800/10 transition-colors group cursor-pointer ${
                      selectedIds[file.id] ? 'bg-rose-500/[0.03]' : ''
                    }`}
                  >
                    <td className="py-4.5 px-6 w-12 text-center select-none" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!selectedIds[file.id]}
                        onChange={() => toggleSelectFile(file.id)}
                        className="w-4 h-4 rounded border-[#1e293b] bg-slate-900 text-rose-500 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    
                    <td className="py-4.5 px-6">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-xl border border-white/10 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 transition-colors shadow-lg">
                          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center">
                            {getFileCategory(file.encrypted_filename) === 'video' ? <FileVideo className="w-4.5 h-4.5" /> :
                             getFileCategory(file.encrypted_filename) === 'image' ? <FileImage className="w-4.5 h-4.5" /> :
                             <FileText className="w-4.5 h-4.5" />}
                          </div>
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs md:max-w-md flex items-center space-x-2">
                          <p className="font-bold text-sm text-slate-200 truncate" title={file.encrypted_filename}>
                            {file.encrypted_filename}
                          </p>
                          <Lock className="w-3.5 h-3.5 text-blue-500/80 shrink-0" title="End-to-End Encrypted Shard" />
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4.5 px-6 font-mono text-xs text-slate-300 font-medium hidden sm:table-cell">
                      {formatSize(file.file_size)}
                    </td>
                    
                    <td className="py-4.5 px-6 text-xs text-slate-400 font-medium hidden sm:table-cell">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {formatDate(file.upload_time)}
                      </span>
                    </td>
                    
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleRestore(file.id, file.encrypted_filename)}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition-all rounded-xl cursor-pointer"
                          title="Restore to Vault"
                        >
                          <RotateCcw className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handlePurge(file.id, file.encrypted_filename)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all rounded-xl cursor-pointer"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Recycle Bin is empty</p>
                      <p className="text-slate-500 text-[10px] mt-1">Soft-deleted items will appear here for recovery or destruction.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating Selection Bulk Action Bar — portalled to body so it always anchors to viewport bottom */}
      {createPortal(
        <AnimatePresence>
          {Object.values(selectedIds).filter(Boolean).length > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-2xl bg-[#0f1425]/95 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">
                    {Object.values(selectedIds).filter(Boolean).length} items selected
                  </p>
                  <p className="text-[10px] text-slate-400">Recycle Bin bulk operations active</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleBulkRestore}
                  className="py-2 px-4 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg border border-emerald-500/30 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore All</span>
                </Button>
                <Button
                  onClick={handleBulkPurge}
                  className="py-2 px-4 font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg border border-rose-500/30 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Destroy Permanently</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
