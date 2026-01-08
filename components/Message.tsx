'use client';

import React from 'react';
import { Message as MessageType } from '@/store/useChatStore';
import { Download } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

type Requirement = {
  exigence: string;
  description: string;
  type: string;
};
type Cat = 'fonctionnelle' | 'non_fonctionnelle' ;

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  // Parse content: accept array, stringified array, or try to extract first [...] substring
  const parseRequirements = (raw: unknown): Requirement[] | null => {
    if (!raw) return null;

    // If already an array of objects
    if (Array.isArray(raw)) {
      return raw.map((r: any) => ({
        exigence: r?.exigence ?? r?.requirement ?? r?.description ?? '',
        description: r?.description ?? '',
        type: r?.type ?? '',
      }));
    }

    const s = String(raw).trim();

    const tryParse = (str: string) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    // 1) direct parse
    let parsed = tryParse(s);
    if (parsed) {
      return parsed.map((r: any) => ({
        exigence: r?.exigence ?? r?.requirement ?? r?.title ?? '',
        description: r?.description ?? '',
        type: r?.type ?? '',
      }));
    }

    // 2) extract first JSON array substring
    const first = s.indexOf('[');
    const last = s.lastIndexOf(']');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = s.slice(first, last + 1);
      parsed = tryParse(candidate);
      if (parsed) {
        return parsed.map((r: any) => ({
          exigence: r?.exigence ?? r?.requirement ?? r?.title ?? '',
          description: r?.description ?? '',
          type: r?.type ?? '',
        }));
      }
    }

    return null;
  };

  const rawRequirements = parseRequirements(message.content);

  const classify = (t: any): Cat => {
    const s = String(t ?? '').toLowerCase();
      if (s === 'functional' || s === 'fonctionnel' || s === 'fonctionnelle') return 'fonctionnelle';
      if (s === 'non_functional' || s === 'nonfonctionnel' || s === 'non_fonctionnelle') return 'non_fonctionnelle';
      return 'non_fonctionnelle';
  };

  const requirementsByType: Record<Cat, Requirement[]> = {
    fonctionnelle: [],
    non_fonctionnelle: [],
   
  };

  if (rawRequirements) {
    rawRequirements.forEach((r) => {
      const req: Requirement = {
        exigence: r?.exigence ?? '',
        description: r?.description ?? '',
        type: r?.type ?? '',
      };
      const cat = classify(req.type);
      requirementsByType[cat].push(req);
    });
  }

  const bubbleClass = isUser
    ? 'bg-primary text-white rounded-br-none'
    : 'bg-secondary text-foreground rounded-bl-none';

  const url = message.file_url ?? null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
  <div
    className={`w-full max-w-full sm:max-w-[85%] md:max-w-[70%] lg:max-w-[100%] px-3 py-2 md:px-4 md:py-3 rounded-lg ${bubbleClass} flex flex-col gap-3 group`}
  >
    {/* Header (assistant) */}
    {!isUser && (
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-gray-700 text-[10px] md:text-xs font-bold text-white">
          AI
        </div>
        <div className="text-xs md:text-sm font-medium text-foreground/90">
          {message.model_id ?? 'Assistant'}
        </div>
      </div>
    )}

    {/* Content: grouped by type */}
    {rawRequirements ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Fonctionnelles */}
        {requirementsByType.fonctionnelle.length > 0 && (
          <div>
            <div className="text-sm md:text-base font-semibold mb-2">Functional requirement</div>
            <div className="space-y-2">
              {requirementsByType.fonctionnelle.map((r, i) => (
                <div
                  key={`func-${i}`}
                  className="p-2 md:p-3 rounded border border-cyan-400 bg-cyan-900/20 mb-2"
                >
                  <div className="text-sm md:text-sm font-semibold text-cyan-400 mb-1">
                    {r.exigence}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 leading-snug">
                    {r.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-fonctionnelles */}
        {requirementsByType.non_fonctionnelle.length > 0 && (
          <div>
            <div className="text-sm md:text-base font-semibold mb-2">Non-functional requirement</div>
            <div className="space-y-2">
              {requirementsByType.non_fonctionnelle.map((r, i) => (
                <div
                  key={`nonfunc-${i}`}
                  className="p-2 md:p-3 rounded border border-purple-400 bg-purple-900/20 mb-2"
                >
                  <div className="text-sm md:text-sm font-semibold text-purple-400 mb-1">
                    {r.exigence}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 leading-snug">
                    {r.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ) : (
      // Fallback raw content
      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
    )}

    {/* timestamp */}
    <div className="mt-2">
      <span className="text-[11px] md:text-xs opacity-70">
        {message.timestamp instanceof Date
          ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>

    {/* Bottom file preview (s'affiche en bas). download visible sur mobile et au hover sur desktop */}
    {url && (
      <div className="mt-3 border-t border-gray-700 pt-3">
        <div className="relative">
          <div className="flex items-center justify-between">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-xs md:text-sm"
              title="Open the file"
            >
              Open the file
            </a>

            <a
              href={url}
              download={message.file_url ? message.file_url.split('/').pop() : undefined}
              className="ml-2 inline-block opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label="Télécharger le fichier"
              title="Télécharger le fichier"
            >
              <div className="p-1 rounded bg-foreground/10 hover:bg-foreground/20">
                <Download className="w-4 h-4" />
              </div>
            </a>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

  );
}
