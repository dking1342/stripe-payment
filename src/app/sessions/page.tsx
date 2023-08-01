import React from 'react';
import CheckoutForm from '../components/CheckoutForm';
import Link from 'next/link';

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <Link href={'/'}>home</Link>
      <h1>sessions</h1>
      <CheckoutForm />
    </div>
  );
};

export default page;
