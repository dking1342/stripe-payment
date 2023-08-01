import Link from 'next/link';
import React from 'react';

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <Link href={'/'}>home</Link>
      <h1>Success ✅</h1>
    </div>
  );
};

export default page;
