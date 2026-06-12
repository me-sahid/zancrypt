export const generatePlaceholderThumbnail = (filename, ext) => {
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

export const extractMetadataAndThumbnail = (file) => {
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
        resolve({ thumbnailDataUrl: fallbackBase64, resolution: null, format: ext });
      } catch (err) {
        console.error('Fallback thumbnail generation failed:', err);
        resolve({ thumbnailDataUrl: null, resolution: null, format: ext });
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
        safeResolve({ thumbnailDataUrl: null, resolution: null, format: ext });
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
            const resolution = `${img.width}x${img.height}`;
            URL.revokeObjectURL(url);
            safeResolve({ thumbnailDataUrl: canvas.toDataURL('image/jpeg', 0.7), resolution, format: ext });
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
            const resolution = `${video.videoWidth}x${video.videoHeight}`;
            URL.revokeObjectURL(url);
            safeResolve({ thumbnailDataUrl: canvas.toDataURL('image/jpeg', 0.7), resolution, format: ext });
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
