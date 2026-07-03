import React, { useState, useEffect, useMemo } from 'react';
import { fileService } from '../../services/vaultServices';
import { useAuthStore } from '../../store/useStore';
import { deriveKey } from '../../utils/crypto';
import { FileText } from 'lucide-react';

const hexToBytes = (hex) => {
  if (!hex) return new Uint8Array(0);
  const len = hex.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i >> 1] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

const getFileCategory = (filename) => {
  if (!filename) return 'document';
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
  return 'document';
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
    // Documents
    'pdf': 'application/pdf'
  };
  return mimeTypes[ext] || 'video/mp4';
};

const getPlaceholderThumbnail = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const category = getFileCategory(filename);
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
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
  } else if (category === 'audio') {
    colorStart = '#2e1065'; // Purple
    colorEnd = '#4c1d95';   // Indigo
    accentColor = '#d946ef'; // Fuchsia
  } else if (category === 'pdf') {
    colorStart = '#450a0a'; // Dark Red
    colorEnd = '#7f1d1d';   // Red
    accentColor = '#ef4444'; // Bright Red
  } else if (category === 'text') {
    colorStart = '#172554'; // Dark Blue
    colorEnd = '#1e3a8a';   // Blue
    accentColor = '#3b82f6'; // Bright Blue
  } else {
    colorStart = '#1c1917'; // Dark Stone
    colorEnd = '#451a03';   // Dark Rust
    accentColor = '#f59e0b'; // Amber Gold
  }

  // 2. Draw gradient background
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // 3. Draw a modern glowing grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 3.2;
  const gridSpacing = 64;
  for (let x = 0; x < 512; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // 4. Draw glowing inner border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6.4;
  ctx.globalAlpha = 0.25;
  ctx.strokeRect(12.8, 12.8, 486.4, 486.4);
  ctx.globalAlpha = 1.0;

  // 5. Draw clean vector-like icon in the center
  ctx.fillStyle = accentColor;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 11.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (category === 'video') {
    // Draw Play Button Icon
    ctx.beginPath();
    ctx.moveTo(224, 166.4);
    ctx.lineTo(307.2, 217.6);
    ctx.lineTo(224, 268.8);
    ctx.closePath();
    ctx.fill();
  } else if (category === 'image') {
    // Draw double mountain landscape
    ctx.beginPath();
    ctx.rect(185.6, 153.6, 140.8, 108.8);
    ctx.stroke();
    // Sun
    ctx.beginPath();
    ctx.arc(281.6, 185.6, 12.8, 0, Math.PI * 2);
    ctx.fill();
    // Mountains
    ctx.beginPath();
    ctx.moveTo(198.4, 249.6);
    ctx.lineTo(236.8, 204.8);
    ctx.lineTo(262.4, 230.4);
    ctx.lineTo(294.4, 185.6);
    ctx.lineTo(313.6, 249.6);
    ctx.stroke();
  } else {
    // Draw Document Shape
    ctx.beginPath();
    ctx.moveTo(198.4, 153.6);
    ctx.lineTo(275.2, 153.6);
    ctx.lineTo(313.6, 192);
    ctx.lineTo(313.6, 281.6);
    ctx.lineTo(198.4, 281.6);
    ctx.closePath();
    ctx.stroke();
    // folded corner line
    ctx.beginPath();
    ctx.moveTo(275.2, 153.6);
    ctx.lineTo(275.2, 192);
    ctx.lineTo(313.6, 192);
    ctx.stroke();
  }

  // 6. Draw clean extension badge
  ctx.fillStyle = 'rgba(7, 9, 19, 0.85)';
  ctx.beginPath();
  ctx.roundRect(128, 358.4, 256, 70.4, 19.2);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28.8px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(extLabel, 256, 393.6);

  return canvas.toDataURL('image/jpeg', 0.85);
};

const FileThumbnail = ({ file, className, decryptedName }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(file.thumbnail || null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filename = decryptedName || file.encrypted_filename || file.filename || file.name || 'unnamed';
  const category = getFileCategory(filename);

  const isStaticImage = thumbnailUrl && (thumbnailUrl.startsWith('data:image/') || thumbnailUrl.startsWith('data:'));

  if (category === 'text') {
    return (
      <div className={`${className} bg-void flex items-center justify-center rounded-md border border-border/20`}>
        <FileText className="w-10 h-10 text-text-muted/60" strokeWidth={1.5} />
      </div>
    );
  }
  
  if (category === 'pdf') {
    return (
      <div className={`${className} bg-void flex flex-col items-center justify-center rounded-md border border-border/20`}>
        <FileText className="w-9 h-9 text-status-danger/70 mb-1.5" strokeWidth={1.5} />
        <span className="text-[9px] font-bold text-status-danger/80 tracking-widest uppercase bg-status-danger/10 px-2 py-0.5 rounded">PDF</span>
      </div>
    );
  }

  // Update thumbnailUrl state if file.thumbnail changes
  useEffect(() => {
    if (file.thumbnail) {
      setThumbnailUrl(file.thumbnail);
    }
  }, [file.thumbnail]);

  // Instantly generate a fallback card
  const generatedPlaceholder = useMemo(() => {
    return getPlaceholderThumbnail(filename);
  }, [filename]);

  useEffect(() => {
    if (file.thumbnail) return;

    let objectUrl = null;

    if (category === 'image' || category === 'video' || category === 'pdf') {
      const fetchRealMedia = async () => {
        setIsLoading(true);
        try {
          const res = await fileService.downloadFile(file.id);
          if (res?.data) {
            const encryptedBuffer = res.data;
            let blob;
            let bytes;

            if (file.encrypted_filename) {
              const { user } = useAuthStore.getState();
              const keyMaterial = useAuthStore.getState().keyMaterial;
              if (!keyMaterial) throw new Error('Encryption key not available');
              const encKey = await deriveKey(user.email, keyMaterial);
              const encBytes = new Uint8Array(encryptedBuffer);
              const iv = encBytes.slice(0, 12);
              const ciphertext = encBytes.slice(12);
              const rawData = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                encKey,
                ciphertext
              );
              bytes = new Uint8Array(rawData);
              const mimeType = getMimeType(filename);
              blob = new Blob([bytes], { type: mimeType });
            } else {
              // Fallback for unencrypted legacy files
              bytes = new Uint8Array(encryptedBuffer);
              const mimeType = getMimeType(filename);
              blob = new Blob([bytes], { type: mimeType });
            }
            
            const ext = filename.split('.').pop().toLowerCase();
            if (ext === 'heic' || ext === 'heif') {
              try {
                // Dynamically import heic-to to keep initial page load lightweight and lightning fast!
                const heicToModule = await import('heic-to');
                const heicTo = heicToModule.heicTo;
                const converted = await heicTo({
                  blob,
                  type: 'image/jpeg',
                  quality: 0.5 // High-performance medium-quality thumbnail conversion
                });
                blob = Array.isArray(converted) ? converted[0] : converted;
              } catch (heicErr) {
                console.error('Failed to convert HEIC to JPEG client-side:', heicErr);
                // Gracefully fallback to original HEIC blob and let image loader decide
              }
            }
            
            if (ext === 'pdf') {
              try {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
                const loadingTask = pdfjsLib.getDocument({ data: bytes });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.0 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setThumbnailUrl(dataUrl);
              } catch (pdfErr) {
                console.error('Failed to generate PDF thumbnail client-side:', pdfErr);
                setHasError(true);
              }
            } else {
              objectUrl = URL.createObjectURL(blob);
              setThumbnailUrl(objectUrl);
            }
          } else {
            setHasError(true);
          }
        } catch (err) {
          console.error('Failed to load real thumbnail preview:', err);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRealMedia();
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id, filename, category, file.thumbnail]);

  if (hasError || !thumbnailUrl) {
    return (
      <img 
        src={generatedPlaceholder} 
        alt={filename} 
        className={`${className} object-contain rounded-md bg-void/50`}
      />
    );
  }

  if (category === 'video' && !isStaticImage) {
    return (
      <div className={`${className} relative overflow-hidden bg-slate-950 flex items-center justify-center rounded-md`}>
        <video 
          src={thumbnailUrl} 
          className="w-full h-full object-cover pointer-events-none" 
          muted 
          playsInline 
          preload="auto"
          onLoadedMetadata={(e) => {
            e.target.currentTime = 0.5; // Seek to 0.5 seconds for frame extraction
          }}
        />
        {/* Sleek video overlay */}
        <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
          <div className="p-1 rounded-full bg-slate-950/60 text-white border border-white/10 backdrop-blur-sm shadow-md">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (category === 'video' && isStaticImage) {
    return (
      <div className={`${className} relative overflow-hidden bg-slate-950 flex items-center justify-center rounded-md`}>
        <img 
          src={thumbnailUrl} 
          alt={filename} 
          className="w-full h-full object-contain bg-void/50"
          onError={() => setHasError(true)}
        />
        {/* Sleek video overlay */}
        <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
          <div className="p-1 rounded-full bg-slate-950/60 text-white border border-white/10 backdrop-blur-sm shadow-md">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (category === 'pdf' && !isStaticImage) {
    return (
      <div className={`${className} relative overflow-hidden bg-white flex items-center justify-center rounded-md pointer-events-none`}>
        <iframe 
          src={`${thumbnailUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
          className="w-full h-full border-none pointer-events-none" 
          tabIndex="-1"
          title={filename}
        />
        <div className="absolute inset-0 z-10 bg-transparent"></div>
      </div>
    );
  }

  // category === 'image' or any other custom thumbnail
  return (
    <img 
      src={thumbnailUrl} 
      alt={filename} 
      className={`${className} object-contain rounded-md bg-void/50`}
      onError={() => setHasError(true)} // Graceful fallback if format isn't supported by browser (e.g. HEIC on Chrome)
    />
  );
};

export default FileThumbnail;
