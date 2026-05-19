import React from "react";
import { MainShell } from "@/components/layout/MainShell";
import { ArchiveHeader } from "@/components/typography/ArchiveHeader";
import { ArtifactsSection } from "@/components/sections/ArtifactsSection";

export default function HomePage() {
  return (
    <MainShell>
      <ArchiveHeader />
      <ArtifactsSection />
    </MainShell>
  );
}
