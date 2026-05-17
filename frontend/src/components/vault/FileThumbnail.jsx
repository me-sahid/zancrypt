import React, { useState, useEffect } from 'react';
import { File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { fileService } from '../../services/vaultServices';

const FileThumbnail = ({ file, className }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const filename = file.encrypted_filename || file.filename || file.name;
  const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(filename);

  useEffect(() => {
    let objectUrl = null;
    
    if (isImage) {
      const fetchThumbnail = async () => {
        setIsLoading(true);
        try {
          const res = await fileService.downloadFile(file.id);
          // Backend returns list of {shard_id, data: hex}
          if (res?.data && Array.isArray(res.data)) {
            // Reassemble first shard or all shards for preview
            const hexData = res.data.map(s => s.data).join('');
            const bytes = new Uint8Array(hexData.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            const blob = new Blob([bytes]);
            objectUrl = URL.createObjectURL(blob);
            setThumbnailUrl(objectUrl);
          }
        } catch (err) {
          console.error('Failed to load thumbnail:', err);
          setError(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchThumbnail();
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id, isImage]);

  if (!isImage) {
    return <File className={className} />;
  }

  if (isLoading) {
    return <Loader2 className={`${className} animate-spin opacity-50`} />;
  }

  if (error || !thumbnailUrl) {
    return <ImageIcon className={`${className} opacity-50`} />;
  }

  return (
    <img 
      src={thumbnailUrl} 
      alt={filename} 
      className={`${className} object-cover rounded-md`}
    />
  );
};

export default FileThumbnail;
