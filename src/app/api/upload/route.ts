// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('files');

  try {
    await Promise.all(
      files.map(async (file) => {
        if (file instanceof Blob) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${Date.now()}_${file.name}`;
          const uploadDir = path.join(process.cwd(), 'public/uploads', filename);
          await writeFile(uploadDir, buffer);
        }
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}