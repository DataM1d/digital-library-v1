import React from "react";
import { ArchiveHeader } from "@/components/typography/ArchiveHeader";
import { ArtifactsSection } from "@/components/sections/ArtifactsSection";

export default function HomePage() {
  return (
    <div className="pt-0">
      <ArchiveHeader />
      <ArtifactsSection />
    </div>
  );
}
