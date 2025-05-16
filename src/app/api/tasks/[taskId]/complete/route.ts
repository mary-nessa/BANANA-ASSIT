import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json({ error: 'Server configuration error: API_BASE_URL not set' }, { status: 500 });
    }

    const url = `${apiBaseUrl}/api/tasks/${params.taskId}/complete`;
    console.log(`Completing task at: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend responded with ${response.status}: ${errorText}`);
      return NextResponse.json({ error: `Backend error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in /api/tasks/[taskId]/complete:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}