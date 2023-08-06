'use client';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Navbar.module.sass';
import { AiOutlineShop, AiOutlineShoppingCart } from 'react-icons/ai';
import Link from 'next/link';

type Props = {};

const Navbar = (props: Props) => {
  const [quantity, setQuantity] = useState(0);

  const checkQuantityCount = () => {
    const localStorageCart = localStorage.getItem('cart');
    if (localStorageCart) {
      const cartCount = JSON.parse(localStorageCart).length;
      if (cartCount) {
        setQuantity(cartCount);
      } else {
        setQuantity(0);
      }
    } else {
      setQuantity(0);
    }
  };

  useEffect(() => {
    checkQuantityCount();
  }, []);

  useEffect(() => {
    window.addEventListener('storage', checkQuantityCount);

    return () => {
      window.removeEventListener('storage', checkQuantityCount);
    };
  }, []);

  return (
    <nav className={styles.navbar}>
      <Link href={'/shopping'} className={styles.iconContainer}>
        <AiOutlineShop />
      </Link>
      <div>
        <Link href={'/shopping/subscribe'}>Subscriptions</Link>
        <Link href={'/shopping/cart'} className={styles.iconContainer}>
          <AiOutlineShoppingCart />
          {quantity > 0 && (
            <div className={styles.badge}>
              <span>{quantity < 10 ? quantity : '9+'}</span>
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
