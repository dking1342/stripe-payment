import React from 'react';
import ProductCards from '../components/ProductCards';
import styles from '../styles/Shop.module.sass';
import { Metadata } from 'next';

type Props = {};

export const metadata: Metadata = {
  title: 'Shopping',
  description: 'Ecommerce site with Stripe payment system included',
};

const page = (props: Props) => {
  return (
    <div className={styles.shopContainer}>
      <h1 className={styles.header}>Best Sellers in Home</h1>
      <ProductCards />
    </div>
  );
};

export default page;
