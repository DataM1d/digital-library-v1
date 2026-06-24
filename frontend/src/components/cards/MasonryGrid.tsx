"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ArtifactCard } from "./ArtifactCard";
import { Artifact } from "@/types";

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

  const columns = useMemo(() => {
    const cols: ColumnTrack[] = Array.from({ length: columnCount }, () => ({
      heightWeight: 0,
      items: [],
    }));

    items.forEach((item) => {
      let shortestColumn = cols[0];
      for (let i = 1; i < columnCount; i++) {
        if (cols[i].heightWeight < shortestColumn.heightWeight) {
          shortestColumn = cols[i];
        }
      }
      shortestColumn.items.push(item);
      shortestColumn.heightWeight += item.heightWeight;
    });

    return cols;
  }, [items, columnCount]);

  return (
    <div className="flex w-full gap-6 px-0 transition-all duration-300">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-6">
          {col.items.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      ))}
    </div>
  );
}
