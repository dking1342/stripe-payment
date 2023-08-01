import React from 'react';
import styles from '../../styles/Checkout.module.sass';
import StripeContainer from '../../components/StripeContainer';
import { Metadata } from 'next';

type Props = {};

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Checkout for items yet to be paid',
};

const page = (props: Props) => {
  return (
    <section className={styles.section}>
      <StripeContainer theme="stripe" labels="above" />
    </section>
  );
};

export default page;
