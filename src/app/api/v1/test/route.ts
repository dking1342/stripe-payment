import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    return NextResponse.json(
      {
        success: true,
        payload: ['it', 'is', 'working'],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        payload: ['not', 'working'],
      },
      {
        status: 400,
        statusText: err.message,
      }
    );
  }
};
