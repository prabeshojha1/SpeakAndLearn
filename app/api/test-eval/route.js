import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Test API endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      status: 'success',
      message: 'POST request received',
      body: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
} 