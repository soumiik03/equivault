"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border border-zinc-800 bg-zinc-950 rounded-sm overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-zinc-900/50"
      >
        <div className="flex-1">{title}</div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ml-3",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-zinc-800/80 bg-zinc-950/80">
          {children}
        </div>
      )}
    </div>
  );
}
