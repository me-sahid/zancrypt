import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Download, CheckCircle, Flame, Lock, Zap, Undo2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

/**
 * SelfDestructToggle component
 * Allows users to compile their encrypted vault files into self-destructing HTML wrappers.
 */
const SelfDestructToggle = ({ fileId, shareToken, fileName, mimeType, onWrapperGenerated, baseUrl }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(3600); // Default 1 Hour (3600 seconds)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const timeOptions = [
    { label: '1 Hour', seconds: 3600 },
    { label: '6 Hours', seconds: 21600 },
    { label: '24 Hours', seconds: 86400 },
    { label: '72 Hours', seconds: 259200 }
  ];

  const handleGenerateWrapper = async () => {
    if (!shareToken) {
      toast.error('Please generate a standard share link first to register the token');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await api.post(
        '/api/share/generate-wrapper',
        {
          file_id: parseInt(fileId, 10),
          timer_seconds: timerSeconds,
          share_token: shareToken,
          file_name: fileName,
          mime_type: mimeType || 'application/octet-stream'
        },
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'text/html' });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const safeName = (fileName || 'document').replace("'", "");
      link.download = `${safeName}_zancrypt_protected.html`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      
      // Delay revocation to prevent race condition in browser download manager
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setIsDone(true);
      toast.success('Protected self-destructing file generated!');
      if (onWrapperGenerated) {
        onWrapperGenerated();
      }
    } catch (error) {
      console.error('Failed to generate self-destruct wrapper:', error);
      toast.error('Failed to generate protected wrapper file');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {!isEnabled ? (
          // Landscape inactive teaser card with custom button
          <motion.div
            key="inactive-teaser"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col justify-between h-full space-y-4"
          >
            <div className="space-y-3.5">
              {/* Header Icon Block */}
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] shrink-0 animate-pulse">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-wider leading-none">
                    Self-Destruct HTML Wrapper
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Zero-trust client-side executing container
                  </p>
                </div>
              </div>

              {/* Explanatory Teaser Points */}
              <div className="bg-[#0b0e17] border border-[#1e293b]/30 rounded-xl p-4 space-y-3">
                <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    <strong className="text-white">Strict In-Memory Decrypt:</strong> Recipients never touch raw source bytes; files decrypt inside a secure sandboxed browser tab.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    <strong className="text-white">Active Anti-Copy Checks:</strong> Detects and blocks focus losses, tab transitions, and print prompts, wiping all variables instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Activation Button */}
            <button
              type="button"
              onClick={() => setIsEnabled(true)}
              className="w-full py-3.5 px-4 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-rose-950/20 flex items-center justify-center space-x-2.5 group cursor-pointer"
            >
              <Flame className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Enable Ephemeral Self-Destruct</span>
            </button>
          </motion.div>
        ) : (
          // Active Configuration Controls
          <motion.div
            key="active-controls"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col justify-between h-full space-y-4"
          >
            <div className="space-y-4">
              {/* Header switch & back button */}
              <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                    Wrapper Sandbox Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEnabled(false);
                    setIsDone(false);
                  }}
                  className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider bg-slate-800/40 border border-slate-700/30 px-2 py-1 rounded-lg transition-all"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Teaser Mode</span>
                </button>
              </div>

              {/* Expiry Selector button group */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Local Expiration Duration
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {timeOptions.map((opt) => (
                    <button
                      key={opt.seconds}
                      type="button"
                      onClick={() => {
                        setTimerSeconds(opt.seconds);
                        setIsDone(false);
                      }}
                      className={`py-2 px-1 text-[10px] font-black rounded-lg border transition-all ${
                        timerSeconds === opt.seconds
                          ? 'bg-rose-500/10 border-rose-500 text-rose-300 shadow-md shadow-rose-500/5'
                          : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Red Warning Card */}
              <div className="flex items-start space-x-2.5 p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl text-rose-200">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <p className="font-bold text-rose-400 uppercase tracking-wider">Destruction Warning:</p>
                  <p className="mt-0.5 text-slate-300">
                    The compiled HTML container will permanently decrypt strictly in-memory and completely shred itself <strong>{
                      timeOptions.find(o => o.seconds === timerSeconds)?.label
                    }</strong> after the recipient first opens it.
                  </p>
                </div>
              </div>

              {/* Copy Wrapper Link Panel */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                  <span>Direct Destruction Link</span>
                  <span className="text-[8px] font-bold text-rose-400 lowercase tracking-normal bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                    recipient downloads html directly
                  </span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <div className="flex-1 bg-[#070913] border border-[#1e293b]/60 rounded-lg px-2.5 py-2 text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-nowrap scrollbar-none select-all cursor-text select-text leading-tight">
                    {`${baseUrl || window.location.origin}/api/share/w/${shareToken}?t=${timerSeconds}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${baseUrl || window.location.origin}/api/share/w/${shareToken}?t=${timerSeconds}`);
                      toast.success('Destruction link copied to clipboard!');
                    }}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:text-rose-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Copy to clipboard"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Compile/Download Action Button */}
            <div className="pt-2">
              {!isDone ? (
                <Button
                  type="button"
                  onClick={handleGenerateWrapper}
                  isLoading={isGenerating}
                  className="w-full py-3 font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-600/10 active:scale-95 transition-all flex items-center justify-center space-x-2 border border-rose-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate Protected File (.html)</span>
                </Button>
              ) : (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                  <div className="text-[10px] font-semibold leading-tight">
                    Protected wrapper downloaded! Share this `.html` file with your recipient.
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelfDestructToggle;
