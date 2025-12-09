'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import apiService from '@/services/apiService'; // adapter le chemin si besoin
import { AxiosProgressEvent } from 'axios';

export function Composer() {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isLoading = useChatStore((s) => s.isLoading);

  // Upload state
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
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
        setError(err?.message || 'Impossible de récupérer la liste des modèles');
      }
    })();
  }, []);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      setFile(f);
      setResult(null);
      setError(null);
      setProgress(0);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) {
      setFile(f);
      setResult(null);
      setError(null);
      setProgress(0);
    }
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
    setResult(null);

    if (!file) {
      setError('Aucun fichier sélectionné.');
      return;
    }

    if (!selectedModel) {
      setError('Aucun modèle sélectionné.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Le fichier doit être un PDF.');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // NOTE:
      // onUploadProgress : callback ProgressEvent => setProgress
      // Si ta version d'ApiService prend ce 3ème argument, tout est bon.
      // Sinon je peux ajouter ce paramètre dans ApiService (dis-moi).
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

      // Affiche le résultat brut
      setResult(resp?.data ?? resp);

      // Si la réponse contient un champ texte utile, réutiliser sendMessage pour conserver le flow
      // (la logique existante du store traitera l'affichage)
      const candidateReply =
        resp?.data?.reply ??
        (typeof resp?.data === 'string' ? resp.data : undefined);

      if (candidateReply && typeof candidateReply === 'string') {
        // On envoie la réponse dans le store pour être affichée comme message reçu
        // (Adapte si ton store attend un autre format)
        await sendMessage(candidateReply);
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      setFile(null);
      setResult(null);
      setError(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-medium mb-3">Uploader un PDF / Extraction</h3>

      <label className="block text-sm font-medium mb-2">Choisir un modèle</label>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="mb-4 w-full border rounded px-3 py-2"
      >
        {models.length === 0 ? (
          <option value="">(Aucun modèle disponible)</option>
        ) : (
          models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))
        )}
      </select>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-3 border-2 border-dashed rounded p-6 text-center cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileSelected}
          className="hidden"
        />

        {file ? (
          <div>
            <p className="font-medium">Fichier sélectionné :</p>
            <p className="text-sm">{file.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Paperclip className="w-6 h-6 text-gray-500" />
            <p className="font-medium">Déposez un fichier PDF ici, ou cliquez pour choisir</p>
            <p className="text-sm text-gray-500">Seuls les PDF sont acceptés</p>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full rounded bg-gradient-to-r from-blue-500 to-blue-300"
            />
          </div>
          <p className="text-sm mt-1">Uploading: {progress}%</p>
        </div>
      )}

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={uploading || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {uploading ? 'Envoi...' : 'Envoyer le PDF'}
        </button>

        <button
          onClick={() => {
            setFile(null);
            setResult(null);
            setError(null);
            setProgress(0);
          }}
          className="px-4 py-2 border rounded"
        >
          Réinitialiser
        </button>
      </div>

      {/* {result && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="font-medium mb-2">Résultat</h4>
          <pre className="text-xs max-h-72 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )} */}

      {/* ----------------------------------------------------------------------
          NOTE: j'ai commenté la zone de texte d'écriture (comme demandé).
          Si tu veux la réactiver, décommente la partie suivante et replace-la
          à l'endroit voulu dans l'UI.
      ---------------------------------------------------------------------- */}
      {/*
      <div className="flex gap-3 mt-4">
        <textarea
          // textarea original commented out per request
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isLoading}
          className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
          style={{ minHeight: '48px' }}
          rows={1}
        />
        <div className="flex gap-2">
          <button
            disabled={isLoading}
            className="p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Upload file"
          >
            <Paperclip className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
      */}

    </div>
  );
}

export default Composer;
