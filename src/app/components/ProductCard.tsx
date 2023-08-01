import React from 'react';
import Stripe from 'stripe';
import styles from '../styles/ProductCard.module.sass';
import Link from 'next/link';
import CONSTANT from '../constants';

type Props = {
  item: Stripe.Product;
};

const ProductCard = ({ item }: Props) => {
  const { default_price }: any = item;
  return (
    <Link
      href={`${CONSTANT.domain}/shopping/${item.id}`}
      className={styles.cardContainer}
    >
      {item.images.map((img) => (
        <img key={img} src={img} alt={item.name} />
      ))}
      <h1>
        {item.name.length > 35 ? `${item.name.slice(0, 35)}...` : item.name}
      </h1>
      {default_price && <p>￡{(default_price.unit_amount / 100).toFixed(2)}</p>}
    </Link>
  );
};

export default ProductCard;
