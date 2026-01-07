'use client';

import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export interface UseFileUploadReturn {
  progress: number;
  isUploading: boolean;
  error: string | null;
  upload: (file: File) => Promise<void>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setProgress(0);
    setIsUploading(true);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      const response = await apiService.uploadFile(file);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.message === 'File uploaded successfully') {
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return { progress, isUploading, error, upload, reset };
}
