'use client';
import React, { useEffect, useState } from 'react';
import styles from '../styles/ShoppingCart.module.sass';
import { AiOutlinePlus, AiOutlineMinus, AiFillDelete } from 'react-icons/ai';
import Link from 'next/link';
import CONSTANT from '../constants';
import { useRouter } from 'next/navigation';
import ToastMsg from './ToastMsg';

type Props = {};

const ShoppingCart = (props: Props) => {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState<string | number>(0);
  const [tax, setTax] = useState(0);
  const [currency, setCurrency] = useState('');
  const [checkout, setCheckout] = useState<{
    amount: number;
    quantity: number;
    currency: string;
  }>({ amount: 0, quantity: 0, currency });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastStatus, setToastStatus] = useState<'success' | 'fail'>('success');
  const [toastMsg, setToastMsg] = useState('');

  const handleCost = (cart: any) => {
    if (cart.length) {
      const preCost: number = cart.reduce((acc: number, val: any) => {
        const price = (val.item.default_price.unit_amount / 100).toFixed(2);
        const cost = (Number(price) * val.quantity).toFixed(2);
        acc = Number(acc) + Number(cost);
        return acc;
      }, 0);
      const taxes: number = Number((preCost * 0.15).toFixed(2));
      const cost = (preCost + taxes).toFixed(2);
      setTax(taxes);
      setTotalCost(cost);
    } else {
      setTax(0);
      setTotalCost(0);
    }
  };

  const handleItemChange = (
    direction: 'plus' | 'minus' | 'del',
    id: string
  ) => {
    switch (direction) {
      case 'plus':
        const plusItems = items.map((item) => {
          if (item.item.id === id) {
            return {
              ...item,
              quantity: String(Number(item.quantity) + 1),
            };
          } else {
            return item;
          }
        });
        setItems(plusItems);
        break;

      case 'minus':
        const minusItems = items.map((item) => {
          if (item.item.id === id) {
            return {
              ...item,
              quantity: String(Number(item.quantity) - 1),
            };
          } else {
            return item;
          }
        });
        setItems(minusItems);
        break;

      case 'del':
        if (confirm('Are you sure you want to remove item?')) {
          const delItems = items.filter((item) => item.item.id !== id);
          setItems(delItems);
        }
        break;

      default:
        break;
    }
  };

  const handleCurrency = (cart: any) => {
    const currencies = cart.map((c: any) => c.item.default_price.currency);
    const checkCurrencies = currencies.every(
      (x: string, i: number, arr: any) => x == arr[0]
    );
    if (checkCurrencies) {
      setCurrency(currencies[0]);
    }
  };

  const handlePayment = () => {
    const isLocalStorageCart = localStorage.getItem('cart');
    const isLocalStorageCheckout = localStorage.getItem('checkout');

    if (!isLocalStorageCart || !isLocalStorageCheckout) {
      setToastVisible(true);
      setToastStatus('fail');
      setToastMsg('No items in cart');
      setTimeout(() => setToastVisible(false), 2000);
      return;
    }
    // set checkout currency
    setCheckout({ ...checkout, currency });
    router.push(`${CONSTANT.domain}/shopping/checkout`);
  };

  const checkLocalStorage = () => {
    const localStorageCart = localStorage.getItem('cart');

    if (localStorageCart) {
      const cart = JSON.parse(localStorageCart);
      setItems(cart);
      handleCurrency(cart);
    }
  };

  useEffect(() => {
    checkLocalStorage();
  }, []);

  useEffect(() => {
    handleCost(items);
    setCheckout({ ...checkout, quantity: items.length });

    if (items.length) {
      localStorage.setItem('cart', JSON.stringify(items));
      window.dispatchEvent(new Event('storage'));
    } else {
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
    }
  }, [items]);

  useEffect(() => {
    const convertedCost = Number(totalCost) * 100;
    setCheckout({ ...checkout, amount: convertedCost });
  }, [totalCost]);

  useEffect(() => {
    if (checkout.quantity === 0) {
      localStorage.removeItem('checkout');
    } else {
      localStorage.setItem('checkout', JSON.stringify(checkout));
    }
  }, [checkout]);

  return (
    <div className={styles.cartContainer}>
      {items.map(({ item, quantity }) => (
        <div className={styles.cartItem} key={item.id}>
          <Link
            href={`${CONSTANT.domain}/shopping/${item.id}`}
            className={styles.cartItemImg}
          >
            <img src={item.images} alt={item.name} />
          </Link>
          <Link href={`${CONSTANT.domain}/shopping/${item.id}`}>
            <span className={styles.cartItemTitle}>
              {item.name.slice(0, 25)}
            </span>
          </Link>
          <span className={styles.cartItemPrice}>
            ${(item.default_price.unit_amount / 100).toFixed(2)}
          </span>
          <span className={styles.cartItemQuantityContainer}>
            <button
              className={`${styles.cartItemQuantityMinus} ${styles.cartItemBtn}`}
              onClick={() => handleItemChange('minus', item.id)}
              disabled={quantity <= 1}
            >
              <AiOutlineMinus />
            </button>
            <span className={styles.cartItemQuantity}>{quantity}</span>
            <button
              className={`${styles.cartItemQuantityPlus} ${styles.cartItemBtn}`}
              onClick={() => handleItemChange('plus', item.id)}
            >
              <AiOutlinePlus />
            </button>
          </span>
          <span className={styles.cartItemCost}>
            ${((item.default_price.unit_amount / 100) * quantity).toFixed(2)}
          </span>
          <button
            className={styles.cartItemDel}
            onClick={() => handleItemChange('del', item.id)}
          >
            <AiFillDelete />
          </button>
        </div>
      ))}
      <hr />
      <div className={styles.cartTotalsContainer}>
        <h1 className={styles.cartTotalsTitle}>Your Totals</h1>
        <div className={styles.cartTotalsTallyContainer}>
          <span className={styles.cartTotalsQuantity}>
            Quantity: {items.length}
          </span>
          <span className={styles.cartTotalsTaxes}>
            Taxes: ${tax.toFixed(2)}
          </span>
          <span className={styles.cartTotalsCost}>Cost: ${totalCost}</span>
        </div>
      </div>
      <div className={styles.cartPaymentContainer}>
        <button className={styles.cartPaymentBtn} onClick={handlePayment}>
          make payment
        </button>
      </div>
      <ToastMsg
        isVisible={toastVisible}
        status={toastStatus}
        message={toastMsg}
      />
    </div>
  );
};

export default ShoppingCart;
