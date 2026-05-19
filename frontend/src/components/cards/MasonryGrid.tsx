"use client";

import React, { useEffect, useState } from "react";
import { ArtifactCard, Artifact } from "./ArtifactCard";

interface MasonryGridProps {
  items: Artifact[];
}

interface ColumnTrack {
  heightWeight: number;
  items: Artifact[];
}

export function MasonryGrid({ items }: MasonryGridProps) {
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumnCount(1);
      } else if (window.innerWidth < 1024) {
        setColumnCount(2);
      } else if (window.innerWidth < 1440) {
        setColumnCount(3);
      } else {
        setColumnCount(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns: ColumnTrack[] = Array.from({ length: columnCount }, () => ({
    heightWeight: 0,
    items: [],
  }));

  items.forEach((item) => {
    let shortestColumn = columns[0];
    for (let i = 1; i < columnCount; i++) {
      if (columns[i].heightWeight < shortestColumn.heightWeight) {
        shortestColumn = columns[i];
      }
    }
    shortestColumn.items.push(item);
    shortestColumn.heightWeight += item.heightWeight;
  });

  return (
    <div className="flex w-full gap-4 px-2 transition-all duration-300">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-4">
          {col.items.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      ))}
    </div>
  );
}
