import { MainShell } from "@/components/layout/MainShell";
import { ArchiveHeader } from "@/components/typography/ArchiveHeader";
import { ArtifactFeed } from "@/components/features/feed/ArtifactFeed";

export default function HomePage() {
  return (
    <MainShell>
      <ArchiveHeader />
      <ArtifactFeed />
    </MainShell>
  );
}
