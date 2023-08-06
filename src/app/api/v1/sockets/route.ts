import { apiError } from '@/app/utils/apiError';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    console.log('sockets');

    return NextResponse.json(
      {
        success: true,
        message: 'handling sockets',
        payload: [],
      },
      { status: 200 }
    );
  } catch (error) {
    apiError(error);
  }
};
