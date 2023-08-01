import React from 'react';
import ProductItem from '../../components/ProductItem';
import styles from '../../styles/Cart.module.sass';
import { Metadata } from 'next';

type Props = {};

export const metadata: Metadata = {
  title: 'Shopping Item',
  description: 'An item from the shopping list',
};

const page = (props: Props) => {
  return (
    <section className={styles.section}>
      <ProductItem />
    </section>
  );
};

export default page;
