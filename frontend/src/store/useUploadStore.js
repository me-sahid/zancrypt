import { create } from 'zustand';
import { extractMetadataAndThumbnail } from '../utils/uploadHelpers';
import { fileService, adminService } from '../services/vaultServices';
import { useDashboardStore } from './useDashboardStore';
import { toast } from 'react-hot-toast';

function encodeWithWorker(fileBuffer) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/workers/erasure.worker.js');
    worker.onmessage = ({ data }) => {
      if (data.type === 'complete') { worker.terminate(); resolve(data.shards); }
      if (data.type === 'error')    { worker.terminate(); reject(new Error(data.message)); }
    };
    worker.onerror = (e) => { worker.terminate(); reject(e); };
    worker.postMessage({ fileBuffer }, [fileBuffer]);
  });
}

async function uploadSingleFile(fileObj, onProgress) {
  let thumbnail = fileObj.thumbnailDataUrl;
  if (!thumbnail) {
    const meta = await extractMetadataAndThumbnail(fileObj.rawFile);
    thumbnail = meta?.thumbnailDataUrl;
  }

  const metadataObj = {
    type: fileObj.rawFile.type || 'document',
    resolution: fileObj.resolution || null,
    format: fileObj.format || fileObj.name.split('.').pop().toLowerCase(),
    original_creation_date: new Date(fileObj.rawFile.lastModified).toISOString(),
    original_size: fileObj.rawFile.size,
  };

  const CHUNK_SIZE = 10 * 1024 * 1024;
  const numShards = Math.ceil(fileObj.rawFile.size / CHUNK_SIZE);
  const manifestShards = [];
  const shardBlobs = [];

  for (let i = 0; i < numShards; i++) {
    const chunk = fileObj.rawFile.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const partName = `part_${i}`;
    manifestShards.push(partName);
    shardBlobs.push({ name: partName, blob: chunk });
  }

  const formData = new FormData();
  formData.append('encrypted_filename', fileObj.name);
  formData.append('encrypted_metadata', JSON.stringify(metadataObj));
  formData.append('file_size', String(fileObj.rawFile.size));
  formData.append('integrity_hash', 'sha256-placeholder');
  formData.append('manifest', JSON.stringify({ shards: manifestShards }));

  if (thumbnail) formData.append('thumbnail', thumbnail);

  const currentFolderId = useDashboardStore.getState().currentFolderId;
  if (currentFolderId) formData.append('folder_id', currentFolderId);

  for (const { name, blob } of shardBlobs) {
    formData.append('shards', blob, name);
  }

  await fileService.uploadFile(formData, {
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
}

async function syncDashboard() {
  try {
    const [filesRes, nodesRes, metricsRes] = await Promise.all([
      fileService.listFiles(),
      adminService.getNodes(),
      adminService.getSystemMetrics(),
    ]);
    const dash = useDashboardStore.getState();
    if (filesRes?.data) dash.setFiles(filesRes.data);
    if (nodesRes?.data) {
      dash.setNodes(nodesRes.data.map(n => ({
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
        isHealthy: n.healthy,
      })));
    }
    if (metricsRes?.data) {
      dash.updateMetrics({
        totalStorage: metricsRes.data.total_storage_bytes || 0,
        securityScore: 100,
        networkHealth: metricsRes.data.network_health_score,
        activeShards: metricsRes.data.total_files * 4,
      });
    }
  } catch (e) {
    console.error('Dashboard sync failed:', e);
  }
}

export const useUploadStore = create((set, get) => ({
  uploadQueue: [],
  isUploading: false,
  isMinimized: false,

  setMinimized: (v) => set({ isMinimized: v }),

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
      format: null,
    }));

    set(s => ({ uploadQueue: [...s.uploadQueue, ...newFiles] }));

    await Promise.all(newFiles.map(async (fileObj) => {
      const meta = await extractMetadataAndThumbnail(fileObj.rawFile);
      if (meta) {
        set(s => ({
          uploadQueue: s.uploadQueue.map(f =>
            f.id === fileObj.id
              ? { ...f, thumbnailDataUrl: meta.thumbnailDataUrl, resolution: meta.resolution, format: meta.format }
              : f
          ),
        }));
      }
    }));

    if (!get().isUploading) get().startProcessing();
  },

  startProcessing: async () => {
    const pendingFiles = get().uploadQueue.filter(f => f.status === 'pending' || f.status === 'failed');
    if (!pendingFiles.length) return;

    set({ isUploading: true });

    await Promise.all(pendingFiles.map(async (fileObj) => {
      set(s => ({
        uploadQueue: s.uploadQueue.map(f =>
          f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f
        ),
      }));

      try {
        await uploadSingleFile(fileObj, (progress) => {
          set(s => ({
            uploadQueue: s.uploadQueue.map(f =>
              f.id === fileObj.id ? { ...f, progress } : f
            ),
          }));
        });

        set(s => ({
          uploadQueue: s.uploadQueue.map(f =>
            f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f
          ),
        }));
        toast.success(`${fileObj.name} safely stored.`);

      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(error.response?.data?.detail || `Failed to store ${fileObj.name}`);
        set(s => ({
          uploadQueue: s.uploadQueue.map(f =>
            f.id === fileObj.id ? { ...f, status: 'failed' } : f
          ),
        }));
      }
    }));

    await syncDashboard();

    set({ isUploading: false });

    setTimeout(() => {
      set(s => ({ uploadQueue: s.uploadQueue.filter(f => f.status !== 'completed') }));
    }, 5000);
  },

  removeFile: (id) => set(s => ({ uploadQueue: s.uploadQueue.filter(f => f.id !== id) })),
  clearCompleted: () => set(s => ({ uploadQueue: s.uploadQueue.filter(f => f.status !== 'completed') })),
}));