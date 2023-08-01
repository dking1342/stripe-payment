'use client';
import React, { useEffect, useState } from 'react';
import CONSTANT from '../constants';
import Stripe from 'stripe';
import ProductCard from './ProductCard';
import styles from '../styles/ProductCards.module.sass';

type Props = {};

const ProductCards = (props: Props) => {
  const [products, setProducts] = useState<Stripe.Product[]>([]);
  const [messages, setMessages] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // fetch calls
  const getProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${CONSTANT.domain}/api/v1/products`);
      if (!res.ok) {
        setMessages('invalid fetch request');
      }
      const data = await res.json();
      if (!data.success) {
        setMessages('invalid route request');
      }
      const filteredProducts = data.payload.filter(
        (x: any) => x.default_price.currency === 'gbp'
      );

      setProducts(filteredProducts);
      localStorage.setItem('products', JSON.stringify(filteredProducts));
    } catch (error) {
      const err = error as Error;
      setMessages(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocalStorage = async () => {
    let localStorageProducts = localStorage.getItem('products');
    if (!localStorageProducts) {
      await getProducts();
    } else {
      setProducts(JSON.parse(localStorageProducts));
    }
  };

  useEffect(() => {
    checkLocalStorage();
  }, []);

  if (isLoading) {
    return <div>loading...</div>;
  } else if (messages) {
    <div>{messages}</div>;
  } else {
    return (
      <div className={styles.cardsContainer}>
        {products.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    );
  }
};

export default ProductCards;
