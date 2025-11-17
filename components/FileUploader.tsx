'use client';

import React, { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploaderProps {
  onClose: () => void;
}

export function FileUploader({ onClose }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { progress, isUploading, error, upload } = useFileUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await upload(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-secondary rounded-lg p-4 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Upload File</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-background rounded transition-colors"
        >
          <X className="w-4 h-4 text-foreground/60" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />

      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-border rounded-lg p-6 hover:bg-background transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
        >
          <Upload className="w-5 h-5 text-foreground/60" />
          <span className="text-sm text-foreground/70">Click to select a file</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="text-sm text-foreground truncate">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isUploading}
              className="text-xs text-foreground/60 hover:text-foreground"
            >
              Change
            </button>
          </div>

          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-foreground/60">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}
    </div>
  );
}
