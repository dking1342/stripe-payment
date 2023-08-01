import { NextResponse } from 'next/server';

export const apiError = (error: any) => {
  const err = error as Error;

  return NextResponse.json(
    {
      success: false,
      message: err.message,
      payload: null,
    },
    {
      status: 400,
    }
  );
};
