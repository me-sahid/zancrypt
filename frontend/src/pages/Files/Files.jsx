import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Database, File, Search, Filter, Share2, 
  Download, Trash2, Lock, CheckCircle2,
  Eye, Calendar, FileVideo, FileImage, FileText,
  Loader2, ArrowUp, ArrowDown, ArrowUpDown, Info,
  Copy, FolderOpen, ClipboardPaste, Folder, Scissors, FolderPlus, CornerLeftUp,
  LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import ShareModal from '../../components/ShareModal';
import FileInfoModal from '../../components/vault/FileInfoModal';
import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService, folderService } from '../../services/vaultServices';
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
  const { 
    files, setFiles, searchQuery, setSearchQuery, 
    currentFolderId, setCurrentFolderId, folders, setFolders,
    clipboard, setClipboard, clearClipboard
  } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [selectedIds, setSelectedIds] = useState({});
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [decryptedNames, setDecryptedNames] = useState({});
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, file: null });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareFilesTarget, setShareFilesTarget] = useState(null);
  
  // Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetFile, setRenameTargetFile] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  
  // New Folder Modal
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoTargetFile, setInfoTargetFile] = useState(null);

  const isFetchingRef = useRef(false);
  const menuRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [resFiles, resFolders] = await Promise.all([
        fileService.listFiles(currentFolderId),
        folderService.listFolders(currentFolderId)
      ]);
      if (resFiles?.data) setFiles(resFiles.data);
      if (resFolders?.data) setFolders(resFolders.data);
    } catch (error) {
      toast.error('Could not refresh vault data');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [setFiles, currentFolderId]);

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
      fetchFiles();
    } catch (error) {
      toast.error('Failed to destroy file');
    }
  };

  const getSelectedItemsArray = () => {
    const selectedFiles = filteredFiles.filter(f => selectedIds[f.id]).map(f => ({ ...f, type: 'file' }));
    const selectedFolders = folders.filter(f => selectedIds[`folder_${f.id}`]).map(f => ({ ...f, type: 'folder', isFolder: true }));
    return [...selectedFolders, ...selectedFiles];
  };

  const getTargetItems = () => {
    const target = contextMenu.file; // This can be file or folder
    if (!target) return [];
    
    const targetId = target.isFolder ? `folder_${target.id}` : target.id;
    
    if (selectedIds[targetId]) {
      return getSelectedItemsArray();
    }
    return [target.isFolder ? { ...target, type: 'folder' } : { ...target, type: 'file' }];
  };

  const handleMultiDownload = async () => {
    const items = getTargetItems();
    if (items.length === 0) return;
    for (const item of items) {
      if (!item.isFolder) {
        await handleDownload(item);
      } else {
        toast.error(`Downloading folders is not supported yet: ${item.encrypted_name}`);
      }
    }
  };

  const handleMultiDelete = async () => {
    const itemsToDelete = getTargetItems();
    if (itemsToDelete.length === 0) return;
    
    toast.loading(`Destroying ${itemsToDelete.length} item(s)...`, { id: 'multi-delete' });
    try {
      for (const item of itemsToDelete) {
        if (item.isFolder) {
          await folderService.deleteFolder(item.id);
        } else {
          await fileService.deleteFile(item.id);
        }
      }
      toast.success('Items destroyed', { id: 'multi-delete' });
      setSelectedIds({});
      fetchFiles();
      if (currentFolderId) fetchFolders(currentFolderId);
    } catch (error) {
      toast.error('Failed to destroy some items', { id: 'multi-delete' });
    }
  };

  const openShareTarget = () => {
    const items = getTargetItems();
    if (items.length === 0) return;
    const fileItems = items.filter(i => !i.isFolder);
    if (fileItems.length === 0) {
      toast.error("Sharing folders is not supported yet.");
      return;
    }
    setShareFilesTarget(fileItems.length === 1 ? fileItems[0] : fileItems);
    setIsShareModalOpen(true);
  };

  const handleCopy = () => {
    const targets = getTargetItems();
    if (targets.length === 0) return;
    setClipboard('copy', targets);
    toast.success(`Copied ${targets.length} item(s)`);
    closeContextMenu();
  };

  const handleMove = () => {
    const targets = getTargetItems();
    if (targets.length === 0) return;
    setClipboard('move', targets);
    toast.success(`Cut ${targets.length} item(s)`);
    closeContextMenu();
  };

  const handlePaste = async () => {
    if (!clipboard.files.length) return;
    toast.loading(`Pasting ${clipboard.files.length} item(s)...`, { id: 'paste' });
    try {
      for (const item of clipboard.files) {
        if (item.isFolder) {
          if (clipboard.action === 'move') {
            await folderService.updateFolder(item.id, { parent_id: currentFolderId });
          } else {
            toast.error(`Cannot copy folder ${item.encrypted_name}. Copying folders is not supported.`);
          }
        } else {
          if (clipboard.action === 'copy') {
            await fileService.copyFile(item.id, currentFolderId);
          } else {
            await fileService.moveFile(item.id, currentFolderId);
          }
        }
      }
      toast.success('Pasted successfully!', { id: 'paste' });
      if (clipboard.action === 'move') {
        clearClipboard();
      }
      fetchFiles();
      if (currentFolderId) fetchFolders(currentFolderId);
      else fetchFolders(null);
    } catch (e) {
      toast.error('Failed to paste items', { id: 'paste' });
    }
    closeContextMenu();
  };

  const openRenameModal = () => {
    const targets = getTargetItems();
    if (targets.length === 0) return;
    const target = targets[0];
    
    setRenameTargetFile(target);
    setRenameInput(target.isFolder ? target.encrypted_name : (decryptedNames[target.id] || target.encrypted_filename || target.filename || 'unnamed'));
    setIsRenameModalOpen(true);
  };

  const openInfoModal = () => {
    const targets = getTargetItems();
    if (targets.length === 0) return;
    setInfoTargetFile(targets[0]);
    setIsInfoModalOpen(true);
  };

  const submitRename = async (e) => {
    e.preventDefault();
    if (!renameInput.trim() || !renameTargetFile) return;
    
    toast.loading('Renaming...', { id: 'rename' });
    try {
      if (renameTargetFile.isFolder) {
        await folderService.updateFolder(renameTargetFile.id, { encrypted_name: renameInput });
      } else {
        await fileService.updateFile(renameTargetFile.id, renameInput);
      }
      toast.success('Renamed successfully', { id: 'rename' });
      setIsRenameModalOpen(false);
      fetchFiles();
      if (currentFolderId) fetchFolders(currentFolderId);
      else fetchFolders(null);
    } catch (e) {
      toast.error('Failed to rename', { id: 'rename' });
    }
  };

  const submitNewFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    toast.loading('Creating folder...', { id: 'new-folder' });
    try {
      await folderService.createFolder({
        encrypted_name: newFolderName,
        parent_id: currentFolderId
      });
      toast.success('Folder created', { id: 'new-folder' });
      setIsNewFolderModalOpen(false);
      setNewFolderName('');
      fetchFiles();
    } catch (e) {
      toast.error('Failed to create folder', { id: 'new-folder' });
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent it from bubbling up to the window listener
    
    const MENU_WIDTH = 240;
    const MENU_HEIGHT = 450; // Approximated max height to prevent bottom cutoff

    const x = Math.min(e.clientX, window.innerWidth - MENU_WIDTH);
    const y = Math.min(e.clientY, window.innerHeight - MENU_HEIGHT);

    setContextMenu({
      visible: true,
      x: Math.max(0, x),
      y: Math.max(0, y),
      file
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };
    
    if (contextMenu.visible) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('contextmenu', handleClickOutside);
      window.addEventListener('resize', closeContextMenu);
    }
    
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
      window.removeEventListener('resize', closeContextMenu);
    };
  }, [contextMenu.visible, closeContextMenu]);

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
          let blob = new Blob([bytes], { type: mimeType });
          
          const ext = filename.split('.').pop().toLowerCase();
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
              console.error('Failed to convert HEIC in preview:', heicErr);
            }
          }
          
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
    const allFolderIds = folders.map(f => `folder_${f.id}`);
    const allFileIds = filteredFiles.map(f => f.id);
    const isAllSelected = (filteredFiles.length > 0 || folders.length > 0) &&
      allFolderIds.every(id => selectedIds[id]) && allFileIds.every(id => selectedIds[id]);

    if (isAllSelected) setSelectedIds({});
    else {
      const next = {};
      folders.forEach(f => next[`folder_${f.id}`] = true);
      filteredFiles.forEach(f => next[f.id] = true);
      setSelectedIds(next);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase flex items-center">
            <Database className="w-6 h-6 mr-3 text-accent" />
            Vault
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            {isDecrypting ? "Decrypting Index..." : "Encrypted Storage Matrix"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="flex-1 md:flex-none p-3 border border-border text-text-primary hover:bg-surface-raised transition-colors flex items-center justify-center min-w-[3rem]">
            {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
          {clipboard.files.length > 0 && (
            <button onClick={handlePaste} className="flex-1 md:flex-none px-4 md:px-6 py-3 border border-border text-text-primary font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-surface-raised transition-colors flex items-center justify-center whitespace-nowrap">
              <ClipboardPaste className="w-4 h-4 md:mr-2" /> <span className="hidden sm:inline">Paste</span> ({clipboard.files.length})
            </button>
          )}
          <button onClick={() => setIsNewFolderModalOpen(true)} className="flex-1 md:flex-none px-4 md:px-6 py-3 border border-border text-text-primary font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-surface-raised transition-colors flex items-center justify-center whitespace-nowrap">
            <FolderPlus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">New Folder</span>
          </button>
          <Link to="/uploads" className="flex-1 md:flex-none px-4 md:px-6 py-3 border border-accent text-accent text-center font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors whitespace-nowrap">
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
        {viewMode === 'list' ? (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-sm text-text-secondary">
                {currentFolderId && (
                  <tr 
                    onClick={() => setCurrentFolderId(null)}
                    className="hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 w-12 text-center"></td>
                    <td className="py-4 px-6 flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center border border-border bg-void shrink-0 rounded overflow-hidden shadow-md">
                        <CornerLeftUp className="w-5 h-5 text-text-muted" />
                      </div>
                      <span className="font-semibold text-text-muted">..</span>
                    </td>
                    <td className="py-4 px-6"></td>
                    <td className="py-4 px-6 hidden sm:table-cell"></td>
                  </tr>
                )}

                {folders && folders.map((folder) => (
                  <tr 
                    key={`folder-${folder.id}`} 
                    onDoubleClick={() => setCurrentFolderId(folder.id)}
                    onContextMenu={(e) => handleContextMenu(e, { ...folder, isFolder: true })}
                    className={`hover:bg-surface-raised transition-colors cursor-pointer ${selectedIds[`folder_${folder.id}`] ? 'bg-accent/5' : ''}`}
                  >
                    <td className="py-4 px-6 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!selectedIds[`folder_${folder.id}`]}
                        onChange={() => setSelectedIds(prev => ({ ...prev, [`folder_${folder.id}`]: !prev[`folder_${folder.id}`] }))}
                        className="accent-accent cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center border border-border bg-void shrink-0 rounded overflow-hidden relative shadow-md">
                          <Folder className="w-6 h-6 text-accent" />
                        </div>
                        <div className="min-w-0 max-w-[120px] sm:max-w-[240px] md:max-w-md truncate">
                          <p className="truncate text-sm font-semibold tracking-wide text-text-primary">
                            {folder.encrypted_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium">-</td>
                    <td className="py-4 px-6 hidden sm:table-cell text-sm text-text-muted">
                      {new Date(folder.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

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
                        onClick={(e) => {
                          if (e.button === 0 && !e.ctrlKey) handlePreview(file);
                        }}
                        onContextMenu={(e) => handleContextMenu(e, file)}
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 font-mono">
            {currentFolderId && (
              <div 
                onClick={() => setCurrentFolderId(null)}
                className="border border-border bg-void rounded-xl p-4 flex flex-col items-center justify-center hover:border-accent/50 hover:bg-surface-raised transition-all cursor-pointer aspect-square shadow-lg"
              >
                <CornerLeftUp className="w-10 h-10 text-text-muted mb-3" />
                <span className="font-bold tracking-widest text-text-muted text-sm uppercase">Up</span>
              </div>
            )}

            {folders && folders.map((folder) => (
              <div 
                key={`folder-${folder.id}`}
                onDoubleClick={() => setCurrentFolderId(folder.id)}
                onContextMenu={(e) => handleContextMenu(e, { ...folder, isFolder: true })}
                className={`border border-border bg-void rounded-xl p-4 flex flex-col items-center justify-center hover:border-accent/50 hover:bg-surface-raised transition-all cursor-pointer aspect-square shadow-lg relative group ${selectedIds[`folder_${folder.id}`] ? 'ring-2 ring-accent border-accent' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!selectedIds[`folder_${folder.id}`]}
                  onChange={() => setSelectedIds(prev => ({ ...prev, [`folder_${folder.id}`]: !prev[`folder_${folder.id}`] }))}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 left-3 accent-accent cursor-pointer w-4 h-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ opacity: selectedIds[`folder_${folder.id}`] ? 1 : undefined }}
                />
                <Folder className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <p className="truncate text-xs font-semibold tracking-wide text-text-primary w-full text-center px-2">
                  {folder.encrypted_name}
                </p>
              </div>
            ))}

            {isLoading ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                <span className="text-xs uppercase tracking-widest text-text-muted">Fetching from Shards...</span>
              </div>
            ) : filteredFiles.length > 0 ? (
              filteredFiles.map((file) => {
                const displayName = decryptedNames[file.id] || file.encrypted_filename;
                const isDecrypted = !!decryptedNames[file.id];
                
                return (
                  <div 
                    key={file.id}
                    onClick={(e) => {
                      if (e.button === 0 && !e.ctrlKey) handlePreview(file);
                    }}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    className={`border border-border bg-void rounded-xl p-4 flex flex-col items-center hover:border-accent/50 hover:bg-surface-raised transition-all cursor-pointer aspect-square shadow-lg relative group ${selectedIds[file.id] ? 'ring-2 ring-accent border-accent' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedIds[file.id]}
                      onChange={() => setSelectedIds(prev => ({ ...prev, [file.id]: !prev[file.id] }))}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 left-3 accent-accent cursor-pointer w-4 h-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ opacity: selectedIds[file.id] ? 1 : undefined }}
                    />
                    <div className="w-16 h-16 mb-4 relative rounded-lg overflow-hidden shadow-inner flex items-center justify-center bg-surface-raised group-hover:scale-105 transition-transform">
                      <FileThumbnail file={file} decryptedName={displayName} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 p-1 rounded bg-void/90 border border-border/50 backdrop-blur-md">
                        <Lock className={`w-3 h-3 ${isDecrypted ? 'text-accent' : 'text-text-muted'}`} />
                      </div>
                    </div>
                    <p className={`truncate text-xs font-semibold tracking-wide w-full text-center px-2 ${isDecrypted ? 'text-text-primary' : 'text-text-muted opacity-50'}`}>
                      {isDecrypted ? displayName : <CipherText text={displayName} duration={2000} />}
                    </p>
                    <p className="text-[10px] text-text-muted mt-2 uppercase tracking-widest">
                      {file.file_size ? (file.file_size / 1024).toFixed(1) + ' KB' : '0 KB'}
                    </p>
                  </div>
                );
              })
            ) : (
              !currentFolderId && folders?.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted text-xs uppercase tracking-widest">
                  No files found in Vault
                </div>
              )
            )}
          </div>
        )}
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
              ) : previewData.fileType === 'audio' ? (
                <div className="max-w-md w-full bg-[#0f1425] border border-white/5 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mx-auto shadow-lg">
                    <FileText className="w-8 h-8 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200 truncate">{previewData.filename}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Secure Audio Playback</p>
                  </div>
                  <audio src={previewData.objectUrl} controls controlsList="nodownload" className="w-full" autoPlay />
                </div>
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

      {/* Share Modal */}
      {isShareModalOpen && shareFilesTarget && createPortal(
        <ShareModal 
          file={shareFilesTarget} 
          onClose={() => { setIsShareModalOpen(false); setShareFilesTarget(null); }} 
        />,
        document.body
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && renameTargetFile && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setIsRenameModalOpen(false)} className="absolute inset-0 bg-void/90 backdrop-blur-md cursor-pointer" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface border border-border w-full max-w-sm flex flex-col shadow-2xl relative z-10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest mb-4 flex items-center">
              <FileText className="w-4 h-4 text-accent mr-2" /> Rename Asset
            </h3>
            <form onSubmit={submitRename} className="space-y-4">
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onFocus={(e) => {
                  const val = e.target.value;
                  const lastDotIndex = val.lastIndexOf('.');
                  if (lastDotIndex > 0) {
                    e.target.setSelectionRange(0, lastDotIndex);
                  } else {
                    e.target.select();
                  }
                }}
                placeholder="New filename"
                autoFocus
                className="w-full bg-void border border-border focus:border-accent text-text-primary font-mono text-sm p-3 outline-none"
              />
              <div className="flex justify-end space-x-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsRenameModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setIsNewFolderModalOpen(false)} className="absolute inset-0 bg-void/90 backdrop-blur-md cursor-pointer" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface border border-border w-full max-w-sm flex flex-col shadow-2xl relative z-10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-mono text-lg text-text-primary uppercase tracking-widest mb-4 flex items-center">
              <FolderPlus className="w-5 h-5 mr-3 text-accent" /> New Folder
            </h3>
            <form onSubmit={submitNewFolder}>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-void border border-border focus:border-accent text-text-primary font-mono text-sm py-3 px-4 outline-none transition-colors mb-6"
                placeholder="Folder Name"
              />
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsNewFolderModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Info Modal */}
      {isInfoModalOpen && infoTargetFile && createPortal(
        <FileInfoModal 
          file={infoTargetFile} 
          decryptedName={decryptedNames[infoTargetFile.id]}
          onClose={() => { setIsInfoModalOpen(false); setInfoTargetFile(null); }} 
        />,
        document.body
      )}

      {/* Context Menu Panel */}
      {contextMenu.visible && createPortal(
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
            className="fixed pointer-events-auto bg-[#0c0f1d] border border-border shadow-2xl py-1 min-w-[200px] flex flex-col font-mono text-xs text-text-secondary rounded-lg overflow-hidden backdrop-blur-xl"
            style={{ 
              top: contextMenu.y, 
              left: contextMenu.x 
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button onClick={() => { handlePreview(contextMenu.file); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <Eye className="w-4 h-4 mr-3" /> Preview
            </button>
            <button onClick={() => { handleMultiDownload(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <Download className="w-4 h-4 mr-3" /> Download Selected
            </button>
            <button onClick={() => { openShareTarget(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <Share2 className="w-4 h-4 mr-3" /> Share
            </button>
            <button onClick={() => { openRenameModal(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <FileText className="w-4 h-4 mr-3" /> Rename
            </button>
            <button onClick={() => { openInfoModal(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <Info className="w-4 h-4 mr-3" /> File Information
            </button>
            <div className="my-1 border-t border-white/5 w-full" />
            <button onClick={() => { handleCopy(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <Copy className="w-4 h-4 mr-3" /> Copy
            </button>
            <button onClick={() => { handleMove(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
              <Scissors className="w-4 h-4 mr-3" /> Cut
            </button>
            {clipboard.files.length > 0 && (
              <button onClick={() => { handlePaste(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-surface-raised hover:text-accent transition-colors text-left">
                <ClipboardPaste className="w-4 h-4 mr-3" /> Paste
              </button>
            )}
            <div className="my-1 border-t border-white/5 w-full" />
            <button onClick={() => { handleMultiDelete(); closeContextMenu(); }} className="flex items-center w-full px-4 py-2.5 hover:bg-danger/10 text-danger transition-colors text-left">
              <Trash2 className="w-4 h-4 mr-3" /> Move to Bin
            </button>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Files;
