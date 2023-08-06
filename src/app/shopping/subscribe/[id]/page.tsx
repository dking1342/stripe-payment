import React from 'react';
import { Metadata } from 'next';
import ProductItem from '../../../components/ProductItem';
import styles from '../../../styles/Cart.module.sass';

type Props = {};

export const metadata: Metadata = {
  title: 'Subscription Item',
  description: 'An subscription from the subs list',
};

const page = (props: Props) => {
  return (
    <section className={styles.section}>
      <ProductItem cardName="subscriptions" />
    </section>
  );
};

export default page;
