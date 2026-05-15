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

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Encrypting, 2: Chunking, 3: Distributing, 4: Done

  const onDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const startProcessing = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Animation Steps
    setActiveStep(1); // Encrypting
    await new Promise(r => setTimeout(r, 1500));
    
    setActiveStep(2); // Chunking
    await new Promise(r => setTimeout(r, 2000));
    
    setActiveStep(3); // Distributing
    await new Promise(r => setTimeout(r, 2500));
    
    setActiveStep(4); // Done
    toast.success('Files distributed across node network.');
    setTimeout(() => {
      setIsUploading(false);
      setActiveStep(0);
      setFiles([]);
    }, 2000);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Ingest Assets</h1>
        <p className="text-text-secondary mt-2">Upload your infrastructure secrets for distributed zero-knowledge storage.</p>
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
              <h3 className="text-xl font-bold text-text-primary mb-2">Drag & Drop Encrypted Payloads</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto mb-8">
                Files will be automatically shard-encrypted at the network edge. 
                Maximum individual payload: <span className="text-text-primary font-bold">5GB</span>.
              </p>
              <Button variant="outline" onClick={() => document.getElementById('fileInput').click()}>
                Select Files
              </Button>
              <input 
                id="fileInput" 
                type="file" 
                multiple 
                className="hidden" 
                onChange={(e) => {
                   const newFiles = Array.from(e.target.files).map(file => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    status: 'pending'
                  }));
                  setFiles(prev => [...prev, ...newFiles]);
                }}
              />
            </CardContent>
          </Card>

          {/* Queue */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transfer Queue</CardTitle>
                <CardDescription>{files.length} payloads pending ingestion.</CardDescription>
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
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-text-secondary hover:text-status-danger transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
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
                  Start Distribution
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Status & Distribution Visualization */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Process Pipeline</CardTitle>
              <CardDescription>Live telemetry from the distribution engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="relative">
                {/* Steps */}
                <div className="space-y-10 relative z-10">
                  {[
                    { icon: Lock, label: 'Shard Encryption', desc: 'Applying AES-256-GCM layers.', step: 1 },
                    { icon: Layers, label: 'Chunk Generation', desc: 'Generating 12 distinct shards.', step: 2 },
                    { icon: Share2, label: 'Node Distribution', desc: 'Routing shards to 5 regions.', step: 3 },
                    { icon: CheckCircle2, label: 'Final Verification', desc: 'Verifying integrity hash.', step: 4 },
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
