import React from 'react';
import ProductCards from '../components/ProductCards';
import styles from '../styles/Shop.module.sass';
import { Metadata } from 'next';
import CONSTANT from '../constants';

type Props = {};

export const metadata: Metadata = {
  title: 'Shopping',
  description: 'Ecommerce site with Stripe payment system included',
};

const page = (props: Props) => {
  return (
    <div className={styles.shopContainer}>
      <h1 className={styles.header}>Best Products</h1>
      <ProductCards
        url={`${CONSTANT.domain}/api/v1/products`}
        cardName="products"
      />
    </div>
  );
};

export default page;
