import React from 'react';
import styles from '../../styles/Cart.module.sass';
import ShoppingCart from '@/app/components/ShoppingCart';
import { Metadata } from 'next';

type Props = {};

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Shopping cart',
};

const page = (props: Props) => {
  return (
    <section className={styles.section}>
      <h1>Your items</h1>
      <ShoppingCart />
    </section>
  );
};

export default page;
