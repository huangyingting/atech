import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export async function GET() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'llms.txt');
  const content = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : '# Atech Hardware & Wire Protocol Specification\n';
  return new NextResponse(content, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
