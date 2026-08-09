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

export const getFileIcon = (filename) => {
  if (!filename) return 'documents.svg';
  const ext = filename.split('.').pop().toLowerCase();
  
  if (['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'flv', 'mts', 'm2ts', 'm4v', 'mpg', 'mpeg', '3gp'].includes(ext)) return 'video.svg';
  if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'gif', 'heic', 'heif', 'tiff', 'tif', 'raw', 'cr3', 'arw', 'bmp', 'ico'].includes(ext)) return 'image.svg';
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext)) return 'audio.svg';
  if (['pdf'].includes(ext)) return 'pdf.svg';
  if (['txt', 'rtf', 'md', 'csv'].includes(ext)) return 'text.svg';
  if (['docx', 'doc'].includes(ext)) return 'word.svg';
  if (['xlsx', 'xls'].includes(ext)) return 'excel.svg';
  if (['pptx', 'ppt', 'key', 'odp'].includes(ext)) return 'powerpoint.svg';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'zip.svg';
  if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) return 'code.svg';
  
  return 'documents.svg';
};

const getPlaceholderThumbnail = (filename) => {
  return `/asset/zancrypt_svg_icon_pack/${getFileIcon(filename)}`;
};

const FileThumbnail = ({ file, className, decryptedName }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(file.thumbnail || null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filename = decryptedName || file.encrypted_filename || file.filename || file.name || 'unnamed';
  const category = getFileCategory(filename);

  const isStaticImage = thumbnailUrl && (thumbnailUrl.startsWith('data:image/') || thumbnailUrl.startsWith('data:'));

  // Custom SVG renderers not needed as they fallback gracefully to getPlaceholderThumbnail


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
