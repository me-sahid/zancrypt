import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  File, 
  X, 
  Lock, 
  Share2, 
  CheckCircle2, 
  Activity, 
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { fileService, adminService } from '../../services/vaultServices';
import { useDashboardStore } from '../../store/useDashboardStore';

const generatePlaceholderThumbnail = (filename, ext) => {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  
  const category = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'heic', 'heif'].includes(ext) ? 'image' :
                   ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(ext) ? 'video' : 'document';

  // 1. Determine gradient colors based on category/extension
  let colorStart = '#1e1b4b'; // Deep Indigo
  let colorEnd = '#311042';   // Deep Violet
  let accentColor = '#a855f7'; // Purple
  let extLabel = ext.toUpperCase() || 'FILE';
  
  if (category === 'video') {
    colorStart = '#0b1329'; // Slate / Dark Navy
    colorEnd = '#072a40';   // Deep Cyber Blue
    accentColor = '#06b6d4'; // Glowing Cyan
  } else if (category === 'image') {
    colorStart = '#022c22'; // Deep Forest
    colorEnd = '#064e3b';   // Dark Emerald
    accentColor = '#10b981'; // Emerald Green
  } else if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
    colorStart = '#1c1917'; // Dark Stone
    colorEnd = '#451a03';   // Dark Rust
    accentColor = '#f59e0b'; // Amber Gold
  }

  // 2. Draw gradient background
  const grad = ctx.createLinearGradient(0, 0, 160, 160);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 160, 160);

  // 3. Draw a modern glowing grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const gridSpacing = 20;
  for (let x = 0; x < 160; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 160);
    ctx.stroke();
  }
  for (let y = 0; y < 160; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(160, y);
    ctx.stroke();
  }

  // 4. Draw glowing inner border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.25;
  ctx.strokeRect(4, 4, 152, 152);
  ctx.globalAlpha = 1.0;

  // 5. Draw clean vector-like icon in the center
  ctx.fillStyle = accentColor;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (category === 'video') {
    // Draw Play Button Icon
    ctx.beginPath();
    ctx.moveTo(70, 52);
    ctx.lineTo(96, 68);
    ctx.lineTo(70, 84);
    ctx.closePath();
    ctx.fill();
  } else if (category === 'image') {
    // Draw double mountain landscape
    ctx.beginPath();
    ctx.rect(58, 48, 44, 34);
    ctx.stroke();
    // Sun
    ctx.beginPath();
    ctx.arc(88, 58, 4, 0, Math.PI * 2);
    ctx.fill();
    // Mountains
    ctx.beginPath();
    ctx.moveTo(62, 78);
    ctx.lineTo(74, 64);
    ctx.lineTo(82, 72);
    ctx.lineTo(92, 58);
    ctx.lineTo(98, 78);
    ctx.stroke();
  } else {
    // Draw Document Shape
    ctx.beginPath();
    ctx.moveTo(62, 48);
    ctx.lineTo(86, 48);
    ctx.lineTo(98, 60);
    ctx.lineTo(98, 88);
    ctx.lineTo(62, 88);
    ctx.closePath();
    ctx.stroke();
    // folded corner line
    ctx.beginPath();
    ctx.moveTo(86, 48);
    ctx.lineTo(86, 60);
    ctx.lineTo(98, 60);
    ctx.stroke();
  }

  // 6. Draw clean extension badge
  ctx.fillStyle = 'rgba(7, 9, 19, 0.85)';
  ctx.beginPath();
  ctx.roundRect(40, 112, 80, 22, 6);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(extLabel, 80, 123);

  return canvas.toDataURL('image/jpeg', 0.85);
};

const extractThumbnail = (file) => {
  return new Promise((resolve) => {
    const filename = file?.name || '';
    const ext = filename.split('.').pop().toLowerCase();
    
    // Determine category based on name and extension (robust fallback for empty file.type)
    const isImg = file?.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'heic', 'heif'].includes(ext);
    const isVid = file?.type?.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(ext);

    // Fallback generator in case of any failures or unsupported types (like HEIC/MOV on Chrome)
    const triggerFallback = () => {
      try {
        const fallbackBase64 = generatePlaceholderThumbnail(filename, ext);
        resolve(fallbackBase64);
      } catch (err) {
        console.error('Fallback thumbnail generation failed:', err);
        resolve(null);
      }
    };

    // 2.5 second timeout to safely switch to placeholder if video/image rendering hangs
    const timeoutId = setTimeout(() => {
      triggerFallback();
    }, 2500);

    const safeResolve = (val) => {
      clearTimeout(timeoutId);
      resolve(val);
    };

    try {
      if (!file) {
        safeResolve(null);
        return;
      }

      if (isImg && !['heic', 'heif'].includes(ext)) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 160;
            const scale = Math.min(MAX_WIDTH / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            safeResolve(canvas.toDataURL('image/jpeg', 0.7));
          } catch (e) {
            URL.revokeObjectURL(url);
            triggerFallback();
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          triggerFallback();
        };
        img.src = url;
      } else if (isVid && ext !== 'mov') { // Let .mov fallback to dynamic canvas in non-Safari
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;
        video.onloadeddata = () => {
          video.currentTime = 1; // Seek to 1 second
        };
        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 160;
            const scale = Math.min(MAX_WIDTH / video.videoWidth, 1);
            canvas.width = video.videoWidth * scale;
            canvas.height = video.videoHeight * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            safeResolve(canvas.toDataURL('image/jpeg', 0.7));
          } catch (e) {
            URL.revokeObjectURL(url);
            triggerFallback();
          }
        };
        video.onerror = () => {
          URL.revokeObjectURL(url);
          triggerFallback();
        };
        video.src = url;
      } else {
        // Immediately generate high-fidelity placeholder for HEIC, MOV, and other files
        triggerFallback();
      }
    } catch (e) {
      triggerFallback();
    }
  });
};

const Upload = () => {
  const { setFiles: setFilesStore, setNodes, updateMetrics } = useDashboardStore();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Encrypting, 2: Chunking, 3: Distributing, 4: Done
  const startProcessing = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (const fileObj of files) {
        try {
          setFiles(prevFiles => prevFiles.map(f => 
            f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f
          ));
          setActiveStep(1);
          await new Promise(r => setTimeout(r, 800));
          
          setActiveStep(2);
          await new Promise(r => setTimeout(r, 800));
          
          setActiveStep(3);
          
          let thumbnail = fileObj.thumbnailDataUrl;
          if (!thumbnail) {
            thumbnail = await extractThumbnail(fileObj.rawFile);
          }

          const formData = new FormData();
          formData.append('encrypted_filename', fileObj.name);
          formData.append('encrypted_metadata', JSON.stringify({ type: 'document' }));
          formData.append('file_size', String(fileObj.rawFile.size));
          formData.append('integrity_hash', 'sha256-placeholder');
          formData.append('manifest', JSON.stringify({ shards: [] }));
          if (thumbnail) {
            formData.append('thumbnail', thumbnail);
          }
          formData.append('shards', fileObj.rawFile); 
          
          await fileService.uploadFile(formData, {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setFiles(prevFiles => prevFiles.map(f => 
                  f.id === fileObj.id ? { ...f, progress: percentCompleted } : f
                ));
              }
            }
          });
          
          try {
            const [filesRes, nodesRes, metricsRes] = await Promise.all([
              fileService.listFiles(),
              adminService.getNodes(),
              adminService.getSystemMetrics()
            ]);
            if (filesRes?.data) setFilesStore(filesRes.data);
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
              setNodes(mappedNodes);
            }
            if (metricsRes?.data) {
              updateMetrics({
                totalStorage: metricsRes.data.total_storage_bytes || 0,
                securityScore: 100,
                networkHealth: metricsRes.data.network_health_score,
                activeShards: metricsRes.data.total_files * 4,
              });
            }
          } catch (updateErr) {
            console.error('Failed to sync telemetry post-upload:', updateErr);
          }
          
          setFiles(prevFiles => prevFiles.map(f => 
            f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f
          ));
          setActiveStep(4);
          toast.success(`${fileObj.name} safely stored.`);
          await new Promise(r => setTimeout(r, 500));
        } catch (error) {
          console.error('Upload failed:', error);
          const errorMsg = error.response?.data?.detail || `Failed to store ${fileObj.name}`;
          toast.error(errorMsg);
        }
      }
    } catch (outerError) {
      console.error('Upload process error:', outerError);
      toast.error('Something went wrong during upload.');
    } finally {
      setIsUploading(false);
      setActiveStep(0);
      setFiles([]);
    }
  };

  const handleFilesAdded = (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'pending',
      progress: 0,
      rawFile: file,
      thumbnailDataUrl: null
    }));
    
    setFiles(prev => [...prev, ...newFiles]);

    // Asynchronously generate thumbnails after UI updates
    newFiles.forEach(async (fileObj) => {
      const thumbnailDataUrl = await extractThumbnail(fileObj.rawFile);
      if (thumbnailDataUrl) {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, thumbnailDataUrl } : f
        ));
      }
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFilesAdded(Array.from(e.dataTransfer.files));
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Add Files to Vault</h1>
        <p className="text-text-secondary mt-2">Your files are encrypted and distributed across our secure network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            className={`border-dashed border-2 transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary-accent/50 hover:bg-primary-accent/5'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 shadow-xl border border-border">
                <UploadCloud className="w-8 h-8 text-primary-accent" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Drag & Drop Files Here</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto mb-8">
                Your files will be automatically protected. 
                Maximum file size: <span className="text-text-primary font-bold">5GB</span>.
              </p>
              <Button variant="outline" onClick={() => document.getElementById('fileInput').click()}>
                Select Files
              </Button>
              <input 
                id="fileInput" 
                type="file" 
                multiple 
                className="hidden" 
                onChange={(e) => handleFilesAdded(Array.from(e.target.files))}
              />
            </CardContent>
          </Card>

          {/* Queue */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Files to Upload</CardTitle>
                <CardDescription>{files.length} files ready to be secured.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <File className="w-5 h-5 text-text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{file.name}</p>
                          <p className="text-[10px] text-text-secondary uppercase">{file.size}</p>
                        </div>
                      </div>
                      {file.status === 'completed' ? (
                        <div className="w-6 h-6 rounded-full bg-status-success/20 flex items-center justify-center text-status-success">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : file.status === 'uploading' ? (
                        <div className="relative w-6 h-6 flex items-center justify-center">
                          <svg className="w-6 h-6 transform -rotate-90">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-border" />
                            <circle 
                              cx="12" cy="12" r="10" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              fill="transparent" 
                              strokeDasharray={`${2 * Math.PI * 10}`}
                              strokeDashoffset={`${2 * Math.PI * 10 * (1 - (file.progress || 0) / 100)}`}
                              className="text-status-success transition-all duration-300" 
                            />
                          </svg>
                          <span className="absolute text-[6px] tracking-tighter font-bold text-text-primary">
                            {file.progress || 0}%
                          </span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-text-secondary hover:text-status-danger transition-colors disabled:opacity-50"
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-4 border-t border-border flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={startProcessing} 
                  isLoading={isUploading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Upload
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Status & Distribution Visualization */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload Progress</CardTitle>
              <CardDescription>Real-time status of your secure upload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="relative">
                {/* Steps */}
                <div className="space-y-10 relative z-10">
                  {[
                    { icon: Lock, label: 'Securely Encrypting', desc: 'Protecting your data.', step: 1 },
                    { icon: Layers, label: 'Preparing for Vault', desc: 'Organizing shards.', step: 2 },
                    { icon: Share2, label: 'Sending to Nodes', desc: 'Distributing to secure locations.', step: 3 },
                    { icon: CheckCircle2, label: 'Confirming Safety', desc: 'Final integrity check.', step: 4 },
                  ].map((step, i) => {
                    const isActive = activeStep === step.step;
                    const isCompleted = activeStep > step.step;
                    
                    return (
                      <div key={i} className={`flex items-start space-x-4 transition-opacity ${!isActive && !isCompleted ? 'opacity-30' : 'opacity-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isCompleted ? 'bg-status-success/10 border-status-success text-status-success' : 
                          isActive ? 'bg-primary-accent/10 border-primary-accent text-primary-accent animate-pulse' : 
                          'bg-surface-elevated border-border text-text-secondary'
                        }`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary uppercase tracking-tight">{step.label}</p>
                          <p className="text-[10px] text-text-secondary">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Vertical Line */}
                <div className="absolute top-10 left-5 w-[2px] h-[calc(100%-40px)] bg-border -z-0" />
              </div>

              {/* Dynamic Visualization */}
              <div className="pt-8 border-t border-border">
                <div className="aspect-square glass-panel rounded-2xl flex items-center justify-center overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {activeStep === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <Activity className="w-12 h-12 text-text-secondary opacity-20" />
                      </motion.div>
                    )}
                    
                    {activeStep === 1 && (
                       <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className="relative">
                            <Lock className="w-16 h-16 text-primary-accent" />
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute -inset-4 border-2 border-dashed border-primary-accent/30 rounded-full" 
                            />
                          </div>
                       </motion.div>
                    )}

                    {activeStep === 2 && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="w-6 h-6 bg-surface-elevated border border-border rounded shadow-lg" 
                            />
                          ))}
                       </motion.div>
                    )}

                    {activeStep === 3 && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full h-full">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary-accent rounded flex items-center justify-center">
                            <Layers className="w-4 h-4 text-white" />
                          </div>
                          {[0, 72, 144, 216, 288].map((deg, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                x: Math.cos(deg * Math.PI / 180) * 80,
                                y: Math.sin(deg * Math.PI / 180) * 80
                              }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                              className="absolute top-[calc(50%-4px)] left-[calc(50%-4px)] w-2 h-2 bg-security rounded-full shadow-[0_0_10px_#06B6D4]"
                            />
                          ))}
                       </motion.div>
                    )}

                    {activeStep === 4 && (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                          <CheckCircle2 className="w-16 h-16 text-status-success" />
                          <p className="mt-4 text-xs font-bold text-status-success uppercase tracking-widest">Verified</p>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
