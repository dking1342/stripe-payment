import React from 'react';
import styles from '../../styles/ShoppingSuccess.module.sass';
import Link from 'next/link';

type Props = {};

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
