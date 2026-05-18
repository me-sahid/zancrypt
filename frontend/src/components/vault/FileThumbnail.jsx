import React, { useState, useEffect, useMemo } from 'react';
import { fileService } from '../../services/vaultServices';

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
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'heic', 'heif'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  return 'document';
};

const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    'ogg': 'video/ogg'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

const getPlaceholderThumbnail = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const category = getFileCategory(filename);
  
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
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

const FileThumbnail = ({ file, className }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filename = file.encrypted_filename || file.filename || file.name || 'unnamed';
  const category = getFileCategory(filename);

  // Instantly generate a fallback card
  const generatedPlaceholder = useMemo(() => {
    return getPlaceholderThumbnail(filename);
  }, [filename]);

  useEffect(() => {
    let objectUrl = null;

    if (category === 'image' || category === 'video') {
      const fetchRealMedia = async () => {
        setIsLoading(true);
        try {
          const res = await fileService.downloadFile(file.id);
          if (res?.data && Array.isArray(res.data)) {
            // Reassemble the file from local shards
            const hexData = res.data.map(s => s.data).join('');
            const bytes = hexToBytes(hexData);
            const mimeType = getMimeType(filename);
            let blob = new Blob([bytes], { type: mimeType });
            
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
            
            objectUrl = URL.createObjectURL(blob);
            setThumbnailUrl(objectUrl);
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
  }, [file.id, filename, category]);

  // Fallback to beautiful neon card during loading, error, or document types
  if (category === 'document' || hasError || !thumbnailUrl) {
    return (
      <img 
        src={generatedPlaceholder} 
        alt={filename} 
        className={`${className} object-cover rounded-md`}
      />
    );
  }

  if (category === 'video') {
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

  // category === 'image'
  return (
    <img 
      src={thumbnailUrl} 
      alt={filename} 
      className={`${className} object-cover rounded-md`}
      onError={() => setHasError(true)} // Graceful fallback if format isn't supported by browser (e.g. HEIC on Chrome)
    />
  );
};

export default FileThumbnail;
