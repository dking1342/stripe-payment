import { Metadata } from 'next';
import React from 'react';
import styles from '../../styles/Shop.module.sass';
import ProductCards from '../../components/ProductCards';
import CONSTANT from '../../constants';

type Props = {};

export const metadata: Metadata = {
  title: 'Subscriptions',
  description: 'Subscriptions for sale',
};

const page = (props: Props) => {
  return (
    <div className={styles.shopContainer}>
      <h1 className={styles.header}>Best Subscriptions</h1>
      <ProductCards
        url={`${CONSTANT.domain}/api/v1/products/subscriptions`}
        cardName="subscriptions"
      />
    </div>
  );
};

export default page;
