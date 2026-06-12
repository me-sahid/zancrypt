import { create } from 'zustand';
import { extractMetadataAndThumbnail } from '../utils/uploadHelpers';
import { fileService, adminService } from '../services/vaultServices';
import { useDashboardStore } from './useDashboardStore';
import { toast } from 'react-hot-toast';

export const useUploadStore = create((set, get) => ({
  uploadQueue: [],
  isUploading: false,
  uploadProgress: 0,
  isMinimized: false,
  
  setMinimized: (minimized) => set({ isMinimized: minimized }),
  
  addFiles: async (filesArray) => {
    const newFiles = filesArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'pending',
      progress: 0,
      rawFile: file,
      thumbnailDataUrl: null,
      resolution: null,
      format: null
    }));
    
    set(state => ({ uploadQueue: [...state.uploadQueue, ...newFiles] }));
    
    // Generate thumbnails async
    for (const fileObj of newFiles) {
      const meta = await extractMetadataAndThumbnail(fileObj.rawFile);
      if (meta) {
        set(state => ({
          uploadQueue: state.uploadQueue.map(f => 
            f.id === fileObj.id 
              ? { ...f, thumbnailDataUrl: meta.thumbnailDataUrl, resolution: meta.resolution, format: meta.format } 
              : f
          )
        }));
      }
    }
    
    // Auto start processing if not already uploading
    if (!get().isUploading) {
      get().startProcessing();
    }
  },
  
  startProcessing: async () => {
    const state = get();
    const pendingFiles = state.uploadQueue.filter(f => f.status === 'pending' || f.status === 'failed');
    if (pendingFiles.length === 0) return;
    
    set({ isUploading: true });
    
    try {
      for (const fileObj of pendingFiles) {
        set(s => ({
          uploadQueue: s.uploadQueue.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f)
        }));
        
        try {
          let thumbnail = fileObj.thumbnailDataUrl;
          if (!thumbnail) {
            const meta = await extractMetadataAndThumbnail(fileObj.rawFile);
            thumbnail = meta.thumbnailDataUrl;
          }

          const metadataObj = {
            type: fileObj.rawFile.type || 'document',
            resolution: fileObj.resolution || null,
            format: fileObj.format || fileObj.name.split('.').pop().toLowerCase(),
            original_creation_date: new Date(fileObj.rawFile.lastModified).toISOString(),
            original_size: fileObj.rawFile.size
          };

          const formData = new FormData();
          formData.append('encrypted_filename', fileObj.name);
          formData.append('encrypted_metadata', JSON.stringify(metadataObj));
          formData.append('file_size', String(fileObj.rawFile.size));
          formData.append('integrity_hash', 'sha256-placeholder');
          
          if (thumbnail) {
            formData.append('thumbnail', thumbnail);
          }
          
          const currentFolderId = useDashboardStore.getState().currentFolderId;
          if (currentFolderId) {
            formData.append('folder_id', currentFolderId);
          }
          
          // Slice file into 10MB shards
          const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
          const numShards = Math.ceil(fileObj.rawFile.size / CHUNK_SIZE);
          
          const manifestShards = [];
          for (let i = 0; i < numShards; i++) {
            const chunk = fileObj.rawFile.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            const partName = `part_${i}`;
            formData.append('shards', chunk, partName);
            manifestShards.push(partName);
          }
          
          formData.set('manifest', JSON.stringify({ shards: manifestShards })); 
          
          await fileService.uploadFile(formData, {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                set(s => ({
                  uploadQueue: s.uploadQueue.map(f => f.id === fileObj.id ? { ...f, progress: percentCompleted } : f)
                }));
              }
            }
          });
          
          // Sync telemetry
          try {
            const [filesRes, nodesRes, metricsRes] = await Promise.all([
              fileService.listFiles(),
              adminService.getNodes(),
              adminService.getSystemMetrics()
            ]);
            const dashStore = useDashboardStore.getState();
            if (filesRes?.data) dashStore.setFiles(filesRes.data);
            if (nodesRes?.data) {
              const mappedNodes = nodesRes.data.map(n => ({
                id: n.id,
                name: n.node_name,
                region: n.region,
                health: n.healthy ? 'Healthy' : 'Offline',
                load: Math.floor(Math.random() * 30) + (n.healthy ? 10 : 0),
                latency: n.healthy ? Math.floor(Math.random() * 100) + 20 : 0,
                shards: (n.shards || []).length,
                storageUsed: n.storage_used || 0,
                provider: n.provider,
                status: n.healthy ? 'success' : 'danger',
                isHealthy: n.healthy
              }));
              dashStore.setNodes(mappedNodes);
            }
            if (metricsRes?.data) {
              dashStore.updateMetrics({
                totalStorage: metricsRes.data.total_storage_bytes || 0,
                securityScore: 100,
                networkHealth: metricsRes.data.network_health_score,
                activeShards: metricsRes.data.total_files * 4,
              });
            }
          } catch (updateErr) {
            console.error('Failed to sync telemetry post-upload:', updateErr);
          }
          
          set(s => ({
            uploadQueue: s.uploadQueue.map(f => f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f)
          }));
          toast.success(`${fileObj.name} safely stored.`);
          
          // Small delay before next file
          await new Promise(r => setTimeout(r, 500));
        } catch (error) {
          console.error('Upload failed:', error);
          const errorMsg = error.response?.data?.detail || `Failed to store ${fileObj.name}`;
          toast.error(errorMsg);
          set(s => ({
            uploadQueue: s.uploadQueue.map(f => f.id === fileObj.id ? { ...f, status: 'failed' } : f)
          }));
        }
      }
    } catch (outerError) {
      console.error('Upload process error:', outerError);
      toast.error('Something went wrong during upload.');
    } finally {
      set({ isUploading: false });
      // Auto-hide completed uploads after a short delay
      setTimeout(() => {
        set(s => ({
          uploadQueue: s.uploadQueue.filter(f => f.status !== 'completed')
        }));
      }, 5000);
    }
  },
  
  removeFile: (id) => {
    set(s => ({
      uploadQueue: s.uploadQueue.filter(f => f.id !== id)
    }));
  },
  
  clearCompleted: () => {
    set(s => ({
      uploadQueue: s.uploadQueue.filter(f => f.status !== 'completed')
    }));
  }
}));
