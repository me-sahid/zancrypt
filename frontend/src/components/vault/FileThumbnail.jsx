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
  const filename = decryptedName || file.encrypted_filename || file.filename || file.name || 'unnamed';
  
  const iconPath = `/asset/zancrypt_svg_icon_pack/${getFileIcon(filename)}`;

  return (
    <img 
      src={iconPath} 
      alt={filename} 
      className={`${className} object-contain rounded-md`}
      onError={(e) => { e.target.src = '/asset/zancrypt_svg_icon_pack/documents.svg'; }}
    />
  );
};

export default FileThumbnail;
