// Composer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { ERole, useChatStore } from '@/store/useChatStore';
import apiService from '@/services/apiService'; // adapter le chemin si besoin
import { AxiosProgressEvent } from 'axios';


export function Composer() {
  const addMessage = useChatStore((s) => s.addMessage);
  // NOTE: on ne récupère plus sendMessage
  // const isLoading = useChatStore((s) => s.isLoading); // supprimé (optionnel)

  // Upload state
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // load models once
    (async () => {
      try {
        const list = await apiService.getModels();
        setModels(list);
        if (list.length > 0) setSelectedModel(list[0]);
      } catch (err: any) {
        setError(err?.message || 'Impossible to load model');
      }
    })();
  }, []);

  async function handleFileChosen(f: File | null) {
    setFile(f);
    setError(null);
    setProgress(0);

    if (!f) return;

    const name = f.name.toLowerCase();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    handleFileChosen(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    handleFileChosen(f);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  async function handleUpload() {
    setError(null);

    if (!file) {
      setError('File field empty.');
      return;
    }

    if (!selectedModel) {
      setError('Model field empty.');
      return;
    }

    const filename = file.name.toLowerCase();
    if (
      !filename.endsWith('.pdf') &&
      !filename.endsWith('.docx') &&
      !filename.endsWith('.txt')
    ) {
      setError('Only PDF, DOCX ou TXT supported.');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const resp = await apiService.uploadFile(
        selectedModel,
        file,
        (ev: AxiosProgressEvent) => {
          if (ev.total) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setProgress(pct);
          }
        }
      );

      const server = resp?.data ?? resp;

      const content =
        typeof server?.response === 'string'
          ? server.response
          : server?.response
          ? JSON.stringify(server.response, null, 2)
          : JSON.stringify(server, null, 2);

      const savedFileUrl: String =
        server?.file_url ?? server?.saved_filename ?? resp?.fileName ?? null;

      const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
      const fileUrl = savedFileUrl.startsWith("http") ? `${savedFileUrl}` : `${backendBase}/${savedFileUrl}`;

      const timestamp = server?.timestamp ? new Date(server?.timestamp): new Date()
      // Ajoute la réponse assistant directement dans le store (plus de sendMessage)
      addMessage({
        role: ERole.ASSISTANT,
        content,
        file_url: fileUrl ?? undefined,
        model_id: server?.model_id ?? selectedModel,
        timestamp: timestamp,
      });

      
    } catch (err: any) {
      setError(err?.message || "Error during upload");
    } finally {
      setUploading(false);
     // setFile(null);
      setProgress(0);
    }
  }

  return (
  <div className="w-full max-w-2xl mx-auto p-1 md:p-3 flex flex-col gap-1 md:gap-3
                min-h-0 md:min-h-auto max-h-[34vh] md:max-h-none overflow-auto text-sm md:text-base">

  {/* Choisir modèle */}
  <label className="block text-sm md:text-base font-medium">Choose a model</label>
  <select
  value={selectedModel}
  onChange={(e) => setSelectedModel(e.target.value)}
  className="mb-0 w-full border rounded px-2 py-1 text-xs md:text-sm 
             bg-background text-foreground"
>
  {models.length === 0 ? (
    <option value="" className="bg-background text-foreground">
      (No model found)
    </option>
  ) : (
    models.map((m) => (
      <option key={m} value={m} className="bg-background text-foreground">
        {m}
      </option>
    ))
  )}
</select>


  {/* Drop area */}
  { !uploading && <div
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onClick={() => fileInputRef.current?.click()}
    className={`border-2 border-dashed rounded p-2 md:p-3 text-center cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
  >
    <input
      ref={fileInputRef}
      type="file"
      accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
      onChange={onFileSelected}
      className="hidden"
    />

    {file ? (
      <div>
        <p className="font-medium text-xs md:text-sm">File :</p>
        <p className="text-xs truncate max-w-full">{file.name}</p>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-1">
        <Paperclip className="w-5 h-5 text-gray-500" />
        <p className="font-medium text-xs md:text-sm">Upload PDF / DOCX / TXT</p>
        <p className="text-xs text-gray-500">Only PDF, DOCX, TXT support</p>
      </div>
    )}
  </div>
  }
  {/* Upload progress / error */}
  {uploading && (
    <div className="mb-0">
      <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
        <div style={{ width: `${progress}%` }} className="h-full rounded bg-gradient-to-r from-blue-500 to-blue-300" />
      </div>
      <p className="text-xs mt-1">Uploading: {progress}%</p>
    </div>
  )}

  {error && <div className="text-xs text-red-600">{error}</div>}

  {uploading && (
    <div className="flex flex-col items-center gap-2 mt-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
      </div>
      <p className="text-xs text-gray-600">
        Analyzing document in progress... This might take a while.
      </p>
    </div>
  )}
  {/* Buttons */}
<div className="flex w-full flex-col sm:flex-row gap-2 mt-1">
  <button
    onClick={handleUpload}
    disabled={uploading}
    className="w-full sm:flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs md:text-sm disabled:opacity-60"
  >
    {uploading ? 'Sending...' : 'Send'}
  </button>

  <button
    onClick={() => {
      setFile(null);
      setError(null);
      setProgress(0);
    }}
    disabled={uploading}
    className="w-full sm:flex-1 px-3 py-2 border rounded text-xs md:text-sm disabled:opacity-60"
  >
    Start over
  </button>
</div>

</div>

  );
}

export default Composer;
