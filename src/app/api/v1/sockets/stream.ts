import { NextApiRequest, NextApiResponse } from 'next';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = await req.body();
    console.log({ body });

    res.send({ success: true, message: 'handler working', payload: [] });
  } catch (error) {
    const err = error as Error;
    res.status(400);
    res.send({ success: false, message: err.message, payload: null });
  }
};
