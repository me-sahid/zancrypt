import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Database, File, Search, Filter, Share2, 
  Download, Trash2, Lock, CheckCircle2,
  Eye, Calendar, FileVideo, FileImage, FileText,
  Loader2, ArrowUp, ArrowDown, ArrowUpDown, Info,
  Copy, FolderOpen, ClipboardPaste, Folder, Scissors, FolderPlus, CornerLeftUp,
  LayoutGrid, List, X, MoreVertical
} from 'lucide-react';
import { RiSafeLine, RiUpload2Line } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import ShareModal from '../../components/ShareModal';
import FileInfoModal from '../../components/vault/FileInfoModal';
import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService, folderService } from '../../services/vaultServices';
import { useAuthStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';
import FileThumbnail from '../../components/vault/FileThumbnail';
import { deriveKey, decryptData } from '../../utils/crypto';
import CipherText from '../../components/crypto/CipherText';
import SecureInput from '../../components/ui/SecureInput';
import { useLanguageStore } from '../../store/useLanguageStore';
import FileManagerSkeleton from '../../components/skeletons/FileManagerSkeleton';
import SkeletonTableRow from '../../components/skeletons/SkeletonTableRow';
import SkeletonCard from '../../components/skeletons/SkeletonCard';

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

const assembleShardsAsync = async (shards) => {
  let totalLength = 0;
  for (const s of shards) {
    if (s.data) totalLength += s.data.length / 2;
  }
  const bytes = new Uint8Array(totalLength);
  let offset = 0;
  for (let j = 0; j < shards.length; j++) {
    const hex = shards[j].data;
    if (hex) {
      const len = hex.length;
      for (let i = 0; i < len; i += 2) {
        bytes[offset++] = parseInt(hex.substring(i, i + 2), 16);
      }
    }
    // Yield to main thread every few shards to prevent freezing
    if (j % 5 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }
  return bytes;
};

const Files = () => {
  const { 
    files, setFiles, searchQuery, setSearchQuery, 
    currentFolderId, setCurrentFolderId, folders, setFolders,
    clipboard, setClipboard, clearClipboard
  } = useDashboardStore();
  const { t } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoadingTarget, setPreviewLoadingTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState({});
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [decryptedNames, setDecryptedNames] = useState({});
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [folderPath, setFolderPath] = useState([]);

  
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
        // Derive the user's master key from real credentials
        const { user } = useAuthStore.getState();
        if (!window.__keyMaterial) { setIsDecrypting(false); return; }
        const key = await deriveKey(user.email, window.__keyMaterial);
        
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

  const handleNavigateInto = (folder) => {
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.encrypted_name }]);
    setCurrentFolderId(folder.id);
  };

  const handleNavigateUp = () => {
    setFolderPath(prev => {
      const newPath = prev.slice(0, -1);
      setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
      return newPath;
    });
  };

  const handleNavigateToBreadcrumb = (index) => {
    setFolderPath(prev => {
      const newPath = prev.slice(0, index + 1);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      return newPath;
    });
  };

  const handleNavigateToRoot = () => {
    setFolderPath([]);
    setCurrentFolderId(null);
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
    toast.loading('Downloading & decrypting...', { id: 'download-toast' });
    try {
      const res = await fileService.downloadFile(file.id);
      const encryptedBuffer = res.data; // ArrayBuffer of IV + ciphertext

      // Derive the same key used during upload
      const { user } = useAuthStore.getState();
      if (!window.__keyMaterial) throw new Error('Encryption key not available');
      const encKey = await deriveKey(user.email, window.__keyMaterial);

      // Extract 12-byte IV prepended during upload, then decrypt
      const encBytes = new Uint8Array(encryptedBuffer);
      const iv = encBytes.slice(0, 12);
      const ciphertext = encBytes.slice(12);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encKey,
        ciphertext
      );

      const filename = decryptedNames[file.id] || file.encrypted_filename || file.filename || 'decrypted_file';
      const mimeType = getMimeType(filename);
      const blob = new Blob([decryptedBuffer], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast.success('Download complete!', { id: 'download-toast' });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed', { id: 'download-toast' });
    }
  };

  const handlePreview = async (file) => {
    toast.loading('Decrypting preview...', { id: 'preview-toast' });
    setPreviewLoadingTarget(file);
    try {
      const res = await fileService.downloadFile(file.id);
      const encryptedBuffer = res.data; // ArrayBuffer of IV + ciphertext

      // Derive the same key used during upload and decrypt
      const { user } = useAuthStore.getState();
      if (!window.__keyMaterial) throw new Error('Encryption key not available');
      const encKey = await deriveKey(user.email, window.__keyMaterial);
      const encBytes = new Uint8Array(encryptedBuffer);
      const iv = encBytes.slice(0, 12);
      const ciphertext = encBytes.slice(12);
      const rawData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encKey,
        ciphertext
      );
      
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
            filename = file.filename || file.name || 'Unknown File';
          }
        }
      }
      
      if (!filename) filename = file.encrypted_filename || file.filename || 'unknown';
      const mimeType = getMimeType(filename);
      const category = getFileCategory(filename);
      
      let textContent = null;
      let objectUrl = null;
      
      if (category === 'text') {
        textContent = new TextDecoder().decode(rawData);
      } else {
        let blob = new Blob([rawData], { type: mimeType });
        
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'heic' || ext === 'heif') {
          try {
            const heicToModule = await import('heic-to');
            const heicTo = heicToModule.heicTo;
            const converted = await heicTo({ blob, type: 'image/jpeg', quality: 0.8 });
            blob = Array.isArray(converted) ? converted[0] : converted;
          } catch (heicErr) {
            console.error('Failed to convert HEIC in preview:', heicErr);
          }
        }
        
        objectUrl = window.URL.createObjectURL(blob);
      }
      
      setPreviewData({ file, mimeType, fileType: category, filename, textContent, objectUrl });
      setPreviewLoadingTarget(null);
      toast.success('Preview ready', { id: 'preview-toast' });
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Preview failed', { id: 'preview-toast' });
      setPreviewLoadingTarget(null);
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

  if (isLoading && files.length === 0 && folders.length === 0) {
    return <FileManagerSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <div className="font-mono text-xl sm:text-2xl text-text-primary tracking-widest uppercase flex items-center flex-wrap gap-2">
            <RiSafeLine className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" />
            <span 
              onClick={handleNavigateToRoot} 
              className={`cursor-pointer hover:text-accent transition-colors ${folderPath.length === 0 ? 'font-bold' : 'text-text-muted'}`}
            >
              {t('vault', 'title')}
            </span>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className="text-text-muted">&gt;</span>
                <span 
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  className={`cursor-pointer hover:text-accent transition-colors truncate max-w-[100px] sm:max-w-[200px] ${index === folderPath.length - 1 ? 'font-bold text-text-primary' : 'text-text-muted'}`}
                >
                  {folder.name}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="flex-none p-3 border border-border text-text-primary hover:bg-surface-raised transition-colors flex items-center justify-center">
            {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          {clipboard.files.length > 0 && (
            <button onClick={handlePaste} className="flex-1 md:flex-none px-4 md:px-6 py-3 border border-border text-text-primary font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-surface-raised transition-colors flex items-center justify-center whitespace-nowrap">
              <ClipboardPaste className="w-4 h-4 md:mr-2" /> <span className="hidden sm:inline">{t('vault', 'paste')}</span> ({clipboard.files.length})
            </button>
          )}
          <button onClick={() => setIsNewFolderModalOpen(true)} className="flex-1 md:flex-none px-4 md:px-6 py-3 border border-border text-text-primary font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-surface-raised transition-colors flex items-center justify-center whitespace-nowrap">
            <FolderPlus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">{t('vault', 'newFolder')}</span>
          </button>
          <Link to="/uploads" className="flex-1 md:flex-none px-4 md:px-6 py-3 border border-accent text-accent text-center font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors whitespace-nowrap">
            {t('vault', 'upload')}
          </Link>
        </div>
      </div>



      {/* Vault Table */}
      <div className="overflow-hidden">
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
                      <span>{t('vault', 'filename')}</span>
                      {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-accent" onClick={() => handleSort('size')}>
                    <div className="flex items-center space-x-2">
                      <span>{t('vault', 'size')}</span>
                      {sortField === 'size' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-accent hidden sm:table-cell" onClick={() => handleSort('uploaded_at')}>
                    <div className="flex items-center space-x-2">
                      <span>{t('vault', 'timestamp')}</span>
                      {sortField === 'uploaded_at' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-sm text-text-secondary">
                {currentFolderId && (
                  <tr 
                    onClick={handleNavigateUp}
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
                    <td className="py-4 px-6"></td>
                  </tr>
                )}

                {folders && folders.map((folder) => (
                  <tr 
                    key={`folder-${folder.id}`} 
                    onDoubleClick={() => handleNavigateInto(folder)}
                    onContextMenu={(e) => handleContextMenu(e, { ...folder, isFolder: true })}
                    className={`group hover:bg-surface-raised transition-colors cursor-pointer ${selectedIds[`folder_${folder.id}`] ? 'bg-accent/5' : ''}`}
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
                    <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); folderService.deleteFolder(folder.id).then(() => { fetchFiles(); }); }} className="p-2 hover:bg-danger/10 hover:text-danger text-text-muted rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} columns={5} hasAvatar={true} />)
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
                        className={`group hover:bg-surface-raised transition-colors cursor-pointer ${selectedIds[file.id] ? 'bg-accent/5' : ''}`}
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
                        <td className="py-4 px-6 text-right opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); handlePreview(file); }} className="p-2 hover:bg-surface-raised hover:text-accent text-text-muted rounded transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setShareFilesTarget(file); setIsShareModalOpen(true); }} className="p-2 hover:bg-surface-raised hover:text-accent text-text-muted rounded transition-colors" title="Share"><Share2 className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-2 hover:bg-danger/10 hover:text-danger text-text-muted rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (!currentFolderId && (!folders || folders.length === 0)) ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <p className="text-2xl text-text-muted font-normal">No files found in Vault</p>
                        <Link 
                          to="/uploads" 
                          className="flex items-center space-x-3 px-8 py-4 bg-accent hover:bg-accent/90 text-void rounded-xl shadow-lg hover:shadow-accent/20 hover:-translate-y-1 transition-all duration-300"
                        >
                          <RiUpload2Line className="w-6 h-6" />
                          <span className="text-lg font-medium">Upload file</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
            {currentFolderId && (
              <div 
                onClick={handleNavigateUp}
                className="border border-border bg-void rounded-xl p-4 flex flex-col items-center justify-center hover:border-accent/50 hover:bg-surface-raised transition-all cursor-pointer aspect-square shadow-lg"
              >
                <CornerLeftUp className="w-10 h-10 text-text-muted mb-3" />
                <span className="font-bold tracking-widest text-text-muted text-sm uppercase">{t('vault', 'up')}</span>
              </div>
            )}

            {folders && folders.map((folder) => (
              <div 
                key={`folder-${folder.id}`}
                onDoubleClick={() => handleNavigateInto(folder)}
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
              Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} className="aspect-square p-2" hasButton={false} />)
            ) : filteredFiles.length > 0 ? (
              filteredFiles.map((file) => {
                const displayName = decryptedNames[file.id] || file.encrypted_filename;
                const isDecrypted = !!decryptedNames[file.id];
                
                return (
                  <div 
                    key={file.id}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    className={`border border-border bg-surface rounded-xl overflow-hidden hover:border-accent/50 transition-all cursor-pointer shadow-md relative group flex flex-col aspect-square ${selectedIds[file.id] ? 'ring-2 ring-accent border-accent' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedIds[file.id]}
                      onChange={() => setSelectedIds(prev => ({ ...prev, [file.id]: !prev[file.id] }))}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-10 left-3 accent-accent cursor-pointer w-4 h-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ opacity: selectedIds[file.id] ? 1 : undefined }}
                    />

                    {/* Top name bar — matches screenshot style */}
                    <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border flex-shrink-0">
                      <p className={`truncate text-[11px] font-semibold ${isDecrypted ? 'text-text-primary' : 'text-text-muted opacity-60'}`}>
                        {isDecrypted ? displayName : <CipherText text={displayName} duration={2000} />}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, file); }}
                        className="flex-shrink-0 ml-1 p-1 text-text-muted hover:text-text-primary rounded transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Main thumbnail — fills the rest */}
                    <div
                      className="flex-1 w-full relative bg-surface-raised overflow-hidden"
                      onClick={(e) => { if (e.button === 0 && !e.ctrlKey) handlePreview(file); }}
                    >
                      <div className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300">
                        <FileThumbnail file={file} decryptedName={displayName} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-2 right-2 p-1 rounded bg-void/80 border border-border/40 backdrop-blur-sm z-10">
                        <Lock className={`w-2.5 h-2.5 ${isDecrypted ? 'text-accent' : 'text-text-muted'}`} />
                      </div>
                    </div>

                    {/* Bottom size strip */}
                    <div className="px-3 py-1.5 border-t border-border bg-surface flex-shrink-0">
                      <p className="text-[9px] text-text-muted uppercase tracking-widest">
                        {file.file_size ? (file.file_size / 1024).toFixed(1) + ' KB' : '0 KB'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              !currentFolderId && folders?.length === 0 && (
                <div className="col-span-full py-24 flex flex-col items-center justify-center space-y-6">
                  <p className="text-2xl text-text-muted font-normal">No files found in Vault</p>
                  <Link 
                    to="/uploads" 
                    className="flex items-center space-x-3 px-8 py-4 bg-accent hover:bg-accent/90 text-void rounded-xl shadow-lg hover:shadow-accent/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <RiUpload2Line className="w-6 h-6" />
                    <span className="text-lg font-medium">Upload file</span>
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {(previewData || previewLoadingTarget) && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col relative z-10"
          >
            {/* Sleek Toolbar */}
            {previewData && (
              <div className="w-full px-4 py-3 flex items-center justify-between bg-transparent z-50 flex-shrink-0 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <File className="w-4 h-4 text-accent" />
                <h3 className="font-mono text-xs text-white uppercase tracking-widest truncate max-w-[200px] sm:max-w-sm">
                  {previewData ? previewData.filename : (decryptedNames[previewLoadingTarget.id] || previewLoadingTarget.encrypted_filename || 'Loading...')}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {previewData && (
                  <button 
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = previewData.objectUrl;
                      a.download = previewData.filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }} 
                    className="p-2 text-text-muted hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => { setPreviewData(null); setPreviewLoadingTarget(null); }} 
                  className="p-2 text-text-muted hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            )}
            
             <div className="flex-1 bg-transparent p-4 overflow-hidden flex items-center justify-center w-full h-full relative">
               {!previewData ? (
                 <div className="flex flex-col items-center justify-center h-full w-full">
                   <SkeletonCard className="w-full max-w-lg h-64" hasImage={true} hasButton={false} />
                 </div>
               ) : previewData.fileType === 'image' ? (
                <img src={previewData.objectUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : previewData.fileType === 'video' ? (
                <video src={previewData.objectUrl} controls className="max-w-full max-h-full" autoPlay />
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
                <iframe src={previewData.objectUrl} title="PDF Preview" className="w-full h-full max-w-5xl mx-auto border-none" />
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
            className="fixed pointer-events-auto bg-surface border border-border shadow-2xl py-1 min-w-[200px] flex flex-col font-mono text-xs text-text-primary rounded-lg overflow-hidden backdrop-blur-xl"
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
            <div className="my-1 border-t border-border w-full" />
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
            <div className="my-1 border-t border-border w-full" />
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
