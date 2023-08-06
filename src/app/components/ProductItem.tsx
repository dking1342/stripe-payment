'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';
import CONSTANT from '../constants';
import styles from '../styles/ProductItem.module.sass';
import Link from 'next/link';
import ToastMsg from './ToastMsg';
import Modal from './Modal';

type Props = {
  cardName: 'products' | 'subscriptions';
};

const ProductItem = ({ cardName }: Props) => {
  const params = useParams();
  const [item, setItem] = useState<Stripe.Product>();
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastStatus, setToastStatus] = useState<'success' | 'fail'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const handleAddToCart = () => {
    const localStorageCart = localStorage.getItem('cart');

    if (!localStorageCart) {
      localStorage.setItem('cart', JSON.stringify([{ item, quantity }]));
      setToastMessage('Added to cart');
      setToastVisible(true);
      setToastStatus('success');
      setTimeout(() => setToastVisible(false), 2000);
    } else {
      const cart = JSON.parse(localStorageCart);
      const findProduct = cart.find((x: any) => x.item.id === params.id);

      if (!findProduct) {
        const updatedCart = [...cart, { item, quantity }];
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setToastMessage('Added to cart');
        setToastVisible(true);
        setToastStatus('success');
        setTimeout(() => setToastVisible(false), 2000);
      } else {
        if (findProduct.quantity === quantity) {
          setToastMessage('Item already exists');
          setToastVisible(true);
          setToastStatus('fail');
          setTimeout(() => setToastVisible(false), 2000);
        } else {
          const updatedCart = cart.map((c: any) => {
            if (c.item.id === params.id) {
              return { item, quantity };
            }
            return c;
          });
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          setToastMessage('Cart updated');
          setToastVisible(true);
          setToastStatus('success');
          setTimeout(() => setToastVisible(false), 2000);
        }
      }
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddSubscription = () => {
    // init modal
    const modalElement = document.getElementById('modal') as HTMLDialogElement;
    modalElement.style.display = 'flex';
    modalElement.showModal();
  };

  // init fn
  const getProduct = async (url: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        setMessages('invalid fetch request');
        return;
      }
      const data = await res.json();
      if (!data.success) {
        setMessages('invalid route request');
        return;
      }
      setItem(data.payload);

      const product: Stripe.Product = data.payload;
      const { default_price }: any = product;
      setPrice(default_price);
    } catch (error) {
      const err = error as Error;
      setMessages(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocalStorage = async () => {
    const localStorageProduct = localStorage.getItem(`${cardName}`);
    if (!localStorageProduct) {
      if (cardName === 'products') {
        await getProduct(`${CONSTANT.domain}/api/v1/products/${params.id}`);
      }
      if (cardName === 'subscriptions') {
        await getProduct(
          `${CONSTANT.domain}/api/v1/products/subscribe/${params.id}`
        );
      }
    } else {
      let products: Stripe.Product[] = JSON.parse(localStorageProduct);
      let product = products.find((x) => x.id === params.id);

      if (!product) {
        if (cardName === 'products') {
          await getProduct(`${CONSTANT.domain}/api/v1/products/${params.id}`);
        }
        if (cardName === 'subscriptions') {
          await getProduct(
            `${CONSTANT.domain}/api/v1/products/subscribe/${params.id}`
          );
        }
      } else {
        setItem(product);
        setPrice(product.default_price);
      }
    }
  };

  const checkQuantity = () => {
    const localStorageQuantity = localStorage.getItem('cart');

    if (localStorageQuantity) {
      const cart = JSON.parse(localStorageQuantity);
      const findProduct = cart.find((x: any) => x.item.id === params.id);

      if (findProduct) {
        setQuantity(findProduct.quantity);
      }
    }
  };

  useEffect(() => {
    checkLocalStorage();
    checkQuantity();
  }, []);

  if (isLoading && !messages && !item) {
    return <div>loading...</div>;
  } else if (!isLoading && messages) {
    return <div>{messages}</div>;
  } else if (!isLoading && item) {
    return (
      <>
        <div className={styles.itemContainer}>
          <div className={styles.itemImgContainer}>
            <div className={styles.linkContainer}>
              <Link
                href={
                  cardName === 'products' ? '/shopping' : '/shopping/subscribe'
                }
              >
                Back to home
              </Link>
            </div>
            <img src={item.images[0]} alt={item.name} />
          </div>
          <div className={styles.itemContentContainer}>
            <h1 className={styles.itemHeader}>{item.name}</h1>
            <p className={styles.itemDescription}>{item.description}</p>
            {price ? (
              <>
                <hr />
                <p className={styles.itemPrice}>
                  ${(price.unit_amount / 100).toFixed(2)}
                </p>
                {cardName === 'products' && (
                  <div className={styles.quantityContainer}>
                    Quantity:
                    <select
                      name="quantity"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                )}
                {cardName === 'products' ? (
                  <button className={styles.itemBtn} onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                ) : (
                  <button
                    className={styles.itemBtn}
                    onClick={handleAddSubscription}
                  >
                    Make Subscription
                  </button>
                )}
              </>
            ) : (
              <div className={styles.itemOutStock}>
                <h1>out of stock</h1>
              </div>
            )}
          </div>
        </div>
        <ToastMsg
          isVisible={toastVisible}
          status={toastStatus}
          message={toastMessage}
        />
        <Modal item={item} paymentMethod="sub" />
      </>
    );
  } else {
    <div></div>;
  }
};

export default ProductItem;
