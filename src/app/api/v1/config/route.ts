import { NextResponse } from 'next/server';
import CONSTANT from '../../../constants';

export const GET = async () => {
  try {
    return NextResponse.json(
      {
        success: true,
        message: 'publish key',
        payload: CONSTANT.publish,
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
        message: err.message,
        payload: null,
      },
      {
        status: 400,
      }
    );
  }
};
