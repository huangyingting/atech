import React, { Suspense } from 'react';
import { StandaloneBoardInspector } from '@/app/board/page';

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading project board…</div>}>
      <StandaloneBoardInspector initialProjectId={id} />
    </Suspense>
  );
}
