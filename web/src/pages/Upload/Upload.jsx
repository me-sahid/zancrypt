import React from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useUploadStore } from '../../store/useUploadStore';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const { addFiles } = useUploadStore();
  const navigate = useNavigate();

  const handleFilesAdded = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    addFiles(Array.from(selectedFiles));
    // Optional: go to vault to see them, or just let them stay on the upload page.
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Add Files to Vault</h1>
        <p className="text-text-secondary mt-2">Your files are automatically encrypted, sharded, and distributed across the network.</p>
      </div>

      <Card 
        className="border-dashed border-2 transition-all cursor-pointer hover:border-primary-accent/50 hover:bg-primary-accent/5 bg-surface"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <CardContent className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 shadow-2xl border border-border">
            <UploadCloud className="w-10 h-10 text-primary-accent" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-3">Drag & Drop Files Here</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mb-10">
            Securely upload your files. They will be immediately encrypted client-side and sent to the global upload manager.
          </p>
          <Button variant="primary" onClick={() => document.getElementById('fileInput').click()} className="px-8 py-4 text-sm font-bold tracking-widest uppercase">
            Browse Files
          </Button>
          <input 
            id="fileInput" 
            type="file" 
            multiple 
            className="hidden" 
            onChange={(e) => handleFilesAdded(e.target.files)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
