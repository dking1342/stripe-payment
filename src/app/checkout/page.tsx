import Link from 'next/link';
import React from 'react';
import PaymentForm from '../components/PaymentForm';

type Props = {};

const page = (props: Props) => {
  return (
    <main>
      <Link href={'/'}>home</Link>
      <h1>checkout</h1>
      <PaymentForm />
    </main>
  );
};

export default page;
