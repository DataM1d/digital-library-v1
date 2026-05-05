"use client";

import { Blurhash } from "react-blurhash";

interface BlurPlaceholderProps {
    hash: string | undefined;
    className?: string;
}

export function BlurPlaceholder({ hash, className }: BlurPlaceholderProps) {
    if (!hash) {
        return <div className={`bg-zinc-100 dark:bg-zinc-900 animate-pulse ${className}`} />;
    }

    return (
    <div className={`relative overflow-hidden ${className}`}>
      <Blurhash
        hash={hash}
        width="100%"
        height="100%"
        resolutionX={32}
        resolutionY={32}
        punch={1}
        className="absolute inset-0"
      />
    </div>
  );
}