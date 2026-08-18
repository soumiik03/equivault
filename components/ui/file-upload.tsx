'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  FileImage,
  FileVideo,
  Archive,
  File as FileIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: FileStatus;
  label?: string;
  errorMessage?: string;
}

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  onFilesAdded?: (files: File[]) => void;
  onFileRemove?: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  files?: FileItem[];
}

export function FileUpload({
  onFilesAdded,
  onFileRemove,
  maxFiles = 2,
  maxSizeMB = 50,
  accept = '.pdf,.png,.jpg,.jpeg,.svg,.webp',
  files = [],
  className,
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (onFilesAdded) {
          onFilesAdded(droppedFiles);
        }
      }
    },
    [onFilesAdded],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        if (onFilesAdded) {
          onFilesAdded(selectedFiles);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesAdded],
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image/'))
      return <FileImage className="h-4 w-4 text-zinc-300" />;
    if (fileType.includes('pdf'))
      return <FileText className="h-4 w-4 text-zinc-300" />;
    if (fileType.includes('video/'))
      return <FileVideo className="h-4 w-4 text-zinc-300" />;
    if (fileType.includes('zip') || fileType.includes('archive'))
      return <Archive className="h-4 w-4 text-zinc-300" />;
    return <FileIcon className="h-4 w-4 text-zinc-300" />;
  };

  return (
    <div className={cn('w-full max-w-lg mx-auto space-y-4', className)} {...props}>
      {/* Drop Zone Card */}
      <div
        className={cn(
          'group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/80',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div
          className={cn(
            'flex min-h-[190px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 p-5 text-center transition-all duration-200',
            isDragging
              ? 'border-zinc-500 bg-zinc-900/80'
              : 'hover:border-zinc-700 hover:bg-zinc-950/90',
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple={maxFiles > 1}
            accept={accept}
            onChange={handleFileSelect}
          />

          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 shadow-inner group-hover:scale-105 group-hover:bg-zinc-800 transition-all">
            <UploadCloud className="h-5 w-5 stroke-[2]" />
          </div>

          <p className="text-zinc-200 text-sm font-medium mb-1">
            Click to upload{' '}
            <span className="text-zinc-400 font-normal">
              or drag and drop
            </span>
          </p>

          <p className="text-zinc-500 text-xs mb-3">
            PDF, PNG, JPG, or WEBP (max. {maxSizeMB}MB)
          </p>

          <button
            type="button"
            className="pointer-events-none rounded-lg bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700/60 transition-colors group-hover:bg-zinc-750"
          >
            Browse Files
          </button>
        </div>

        {/* Selected Documents Listing */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-1">
              <span className="text-zinc-400 text-xs font-medium">
                Uploaded ({files.length}/{maxFiles})
              </span>
            </div>

            <div className="space-y-2">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 rounded-xl bg-zinc-950/80 border border-zinc-800 p-3 transition-colors hover:border-zinc-700"
                >
                  <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800 shrink-0">
                    {getFileIcon(fileItem.file.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="text-zinc-200 truncate text-xs font-semibold">
                          {fileItem.file.name}
                        </p>
                        {fileItem.label && (
                          <span className="inline-block text-[10px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded mt-0.5">
                            {fileItem.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {fileItem.status === 'success' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/50">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Ready
                          </span>
                        )}
                        {fileItem.status === 'error' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-950/40 px-2 py-0.5 text-[11px] font-medium text-red-400 border border-red-800/40">
                            <AlertCircle className="h-3 w-3" /> Error
                          </span>
                        )}
                        {fileItem.status === 'uploading' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <Loader2 className="h-3 w-3 animate-spin text-zinc-300" /> {Math.round(fileItem.progress)}%
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFileRemove) onFileRemove(fileItem.id);
                          }}
                          className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-md p-1 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-zinc-500 text-[11px] mt-0.5">
                      {formatFileSize(fileItem.file.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
