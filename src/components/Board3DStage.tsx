'use client';

import React from 'react';
import { BoardViewer3D } from '@/components/BoardViewer3D';

export function Board3DStage({
  boardType = '14port_board',
  placements = [],
  emulating = true,
}: {
  boardType?: string;
  placements?: Array<{
    instance_id: string;
    part_id: string;
    slot: string;
    rotation_deg?: number;
  }>;
  emulating?: boolean;
}) {
  return (
    <BoardViewer3D
      boardId={boardType}
      placements={placements}
      initialEmulate={emulating}
    />
  );
}
