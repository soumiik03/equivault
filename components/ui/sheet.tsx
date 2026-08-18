"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Sheet({
  isOpen,
  onClose,
  title = "Evidence & Citation Details",
  description = "Extracted datasheet evidence and supporting references.",
  children,
}: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-black/60 backdrop-blur-[2px] transition-opacity">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Side Drawer Panel */}
      <aside
        className={cn(
          "relative z-10 w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-800 text-zinc-100 shadow-2xl flex flex-col transform transition-transform duration-200 ease-in-out rounded-none"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
            title="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">{children}</div>
      </aside>
    </div>
  );
}
