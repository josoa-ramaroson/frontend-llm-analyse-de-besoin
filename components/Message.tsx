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
type Cat = 'fonctionnelle' | 'non_fonctionnelle' | 'other';

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
    if (
      (s.includes('non') && s.includes('fonction')) ||
      s.includes('non_fonction') ||
      s.includes('non-fonction') ||
      s.includes('nonfonction')
    ) {
      return 'non_fonctionnelle';
    }
    if (s.includes('fonction') || s.includes('func')) return 'fonctionnelle';
    if (s.includes('non')) return 'non_fonctionnelle';
    return 'other';
  };

  const requirementsByType: Record<Cat, Requirement[]> = {
    fonctionnelle: [],
    non_fonctionnelle: [],
    other: [],
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
        className={`max-w-2xl w-full px-4 py-3 rounded-lg ${bubbleClass} flex flex-col gap-4 group`}
      >
        {/* Header (assistant) */}
        {!isUser && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
              AI
            </div>
            <div className="text-sm font-medium text-foreground/90">
              {message.model_id ?? 'Assistant'}
            </div>
          </div>
        )}

        {/* Content: grouped by type */}
        {rawRequirements ? (
          <div className="grid gap-4">
            {/* Fonctionnelles */}
            {requirementsByType.fonctionnelle.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">Besoins fonctionnels</div>
                <div className="space-y-2">
                  {requirementsByType.fonctionnelle.map((r, i) => (
                    <div
                      key={`func-${i}`}
                      className="p-3 rounded border border-gray-700 bg-transparent"
                    >
                      <div className="text-sm font-semibold text-foreground/95 mb-1">
                        {r.exigence}
                      </div>
                      <div className="text-sm text-foreground/90">{r.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-fonctionnelles */}
            {requirementsByType.non_fonctionnelle.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">Besoins non-fonctionnels</div>
                <div className="space-y-2">
                  {requirementsByType.non_fonctionnelle.map((r, i) => (
                    <div
                      key={`nonfunc-${i}`}
                      className="p-3 rounded border border-gray-700 bg-transparent"
                    >
                      <div className="text-sm font-semibold text-foreground/95 mb-1">
                        {r.exigence}
                      </div>
                      <div className="text-sm text-foreground/90">{r.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other */}
            {requirementsByType.other.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">Autres</div>
                <div className="space-y-2">
                  {requirementsByType.other.map((r, i) => (
                    <div
                      key={`other-${i}`}
                      className="p-3 rounded border border-gray-700 bg-transparent"
                    >
                      <div className="text-sm font-semibold text-foreground/95 mb-1">
                        {r.exigence || r.description}
                      </div>
                      {r.description && (
                        <div className="text-sm text-foreground/90">{r.description}</div>
                      )}
                      <div className="text-xs opacity-70 mt-1">Type: {r.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fallback raw content
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}

        {/* timestamp */}
        <div className="mt-2">
          <span className="text-xs opacity-70">
            {message.timestamp instanceof Date
              ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Bottom file preview (s'affiche en bas). download visible au survol du bloc (group-hover) */}
        {url && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            <div className="relative">
              
                <div className="flex items-center justify-between">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                    Ouvrir le fichier
                  </a>

                  <a
                    href={url}
                    // download={message.file_url?.split("/")[-1] ?? undefined}
                    className="ml-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Télécharger le fichier`}
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
