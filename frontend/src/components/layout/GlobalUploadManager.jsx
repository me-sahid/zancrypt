import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, CheckCircle2, UploadCloud, File } from 'lucide-react';
import { useUploadStore } from '../../store/useUploadStore';
import { RiUpload2Line } from 'react-icons/ri';

const GlobalUploadManager = () => {
  const { uploadQueue, isMinimized, setMinimized, removeFile } = useUploadStore();

  if (uploadQueue.length === 0) return null;

  const activeUploads = uploadQueue.filter(f => f.status === 'uploading' || f.status === 'pending');
  const completedUploads = uploadQueue.filter(f => f.status === 'completed');
  const totalProgress = activeUploads.length > 0 
    ? Math.round(activeUploads.reduce((acc, f) => acc + (f.progress || 0), 0) / activeUploads.length)
    : 100;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[60vh]"
          >
            <div className="p-4 border-b border-border bg-surface-elevated flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-text-primary tracking-widest uppercase">Uploading</h4>
                  <p className="text-[10px] text-text-muted font-sans font-medium uppercase">
                    {completedUploads.length} of {uploadQueue.length} complete
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMinimized(true)}
                className="p-1.5 hover:bg-surface-raised rounded-lg text-text-muted transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {uploadQueue.map(file => (
                <div key={file.id} className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {file.thumbnailDataUrl ? (
                      <img src={file.thumbnailDataUrl} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <File className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{file.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-text-muted font-sans font-medium">{file.size}</p>
                      {file.status === 'uploading' && (
                        <p className="text-[10px] text-accent font-sans font-bold">{file.progress}%</p>
                      )}
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2 h-1 w-full bg-surface-raised rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {file.status === 'completed' ? (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                        <CheckCircle2 className="w-5 h-5 text-status-success" />
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 hover:bg-danger/20 hover:text-danger rounded-lg text-text-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={() => setMinimized(!isMinimized)}
        className="h-14 px-5 bg-surface hover:bg-surface-elevated text-text-primary rounded-full shadow-lg shadow-black/20 flex items-center space-x-3 transition-colors border border-border"
      >
        {activeUploads.length > 0 ? (
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-6 h-6 transform -rotate-90">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="transparent" />
              <circle 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - (totalProgress || 0) / 100)}`}
                className="transition-all duration-300" 
              />
            </svg>
          </div>
        ) : (
          <RiUpload2Line className="w-5 h-5 text-accent" />
        )}
        <span className="font-sans text-xs font-bold uppercase tracking-wider">
          {activeUploads.length > 0 ? `${activeUploads.length} Uploading` : 'Uploads Complete'}
        </span>
        {isMinimized ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </motion.button>
    </div>
  );
};

export default GlobalUploadManager;
