"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  onChange?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onChange,
  accept = "image/*,.pdf",
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (newFiles: File[]) => {
    if (!newFiles.length) return;
    const combined = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(combined);
    if (onChange) onChange(combined);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    if (onChange) onChange(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={cn(
          "group/file relative p-8 sm:p-10 rounded-2xl cursor-pointer border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden",
          isDragActive
            ? "border-[#3ad389] bg-[#3ad389]/[0.08] shadow-[0_0_30px_rgba(58,211,137,0.2)]"
            : "border-white/15 bg-[#0c0c0e]/90 hover:border-white/30 hover:bg-[#121217]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileSelection(Array.from(e.target.files || []))}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover/file:border-[#3ad389]/40 group-hover/file:text-[#3ad389] transition-all shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <p className="font-sans font-semibold text-white text-base sm:text-lg text-center">
          Upload receipt slip or verification proof
        </p>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 text-center max-w-sm">
          Drag and drop your bank slip, screenshot, or transaction document here, or click to browse
        </p>
        <span className="text-[11px] font-mono text-[#3ad389] mt-3 px-3 py-1 rounded-full bg-[#3ad389]/10 border border-[#3ad389]/20">
          PNG, JPG, WEBP, or PDF up to 10MB
        </span>

        {/* Selected files stack */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md mt-6 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <FileText className="w-4 h-4 text-[#3ad389] shrink-0" />
                    <span className="truncate font-mono text-zinc-200">{file.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">({formatSize(file.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => removeFile(i, e)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                    aria-label="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default FileUpload;
