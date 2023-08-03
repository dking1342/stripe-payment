import React from 'react';
import styles from '../../styles/ShoppingSuccess.module.sass';
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {};

export const metadata: Metadata = {
  title: 'Order Success',
  description:
    'Your order has been placed and either paid or an invoice has been sent',
};

const page = (props: Props) => {
  return (
    <section className={styles.section}>
      <h1>Thank you for your order</h1>
      <p>You will receive an email with the details of your purchase order</p>
      <Link href={'/shopping'} className={styles.successLink}>
        Back to shopping
      </Link>
    </section>
  );
};

export default page;
