"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-zinc-800 bg-zinc-950/80 p-1 rounded-sm gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 py-2 px-4 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm text-center flex items-center justify-center gap-2",
              isActive
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-sm text-[10px] font-mono",
                  isActive ? "bg-zinc-900 text-zinc-300" : "bg-zinc-900 text-zinc-500"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
