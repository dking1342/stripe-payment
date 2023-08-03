'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/ShoppingCart.module.sass';
import { AiOutlinePlus, AiOutlineMinus, AiFillDelete } from 'react-icons/ai';
import Link from 'next/link';
import CONSTANT from '../constants';
import { useRouter } from 'next/navigation';
import ToastMsg from './ToastMsg';
import { Inter } from 'next/font/google';
import { fetchOptions } from '../utils/fetchOptions';
import Stripe from 'stripe';

const inter = Inter({ subsets: ['latin'], weight: ['100', '200', '300'] });

type Props = {};

// variable types
type Checkout = {
  amount: number;
  quantity: number;
  currency: string;
};
type Customer = {
  name: string;
  email: string;
};
type ToastStatus = 'success' | 'fail';
type Direction = 'minus' | 'plus' | 'del';
type Field = 'name' | 'email';
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type SubmitOptions = 'cancel' | 'confirm';
type PaymentMethod = 'now' | 'later' | 'sub';
type Resp = { data: any; error: string };

// function types
type HandleCostFn = (cart: any) => void;
type HandleItemChangeFn = (direction: Direction, id: string) => void;
type HandleModalChangeFn = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: Field
) => void;
type HandleModalErrorHandlingFn = (values: Customer) => void;
type HandleCustomerSearchFn = (customer: any) => Promise<Resp>;
type FetchResponseHelperFn = (
  url: string,
  method: Method,
  body: any
) => Promise<Resp>;
type HandleCurrencyFn = (cart: any) => void;
type HandleToastMessageFn = (status: ToastStatus, message: string) => void;
type HandleCatchErrorFn = (message: string) => void;
type HandlePaymentFn = (payMethod: PaymentMethod) => void;
type CheckLocalStorageFn = () => void;
type HandleInvoiceFn = (
  cart: any,
  checkout: Checkout,
  customer: Stripe.Customer
) => Promise<Resp>;
type HandleModalSubmitFn = (
  e: React.MouseEvent<HTMLButtonElement>,
  command: SubmitOptions
) => Promise<void>;

// initial states
const customerInitState: Customer = { name: 'jack', email: 'jack@example.com' };
const checkoutInitState: Checkout = { amount: 0, quantity: 0, currency: '' };
const responseInitState: Resp = { data: null, error: '' };

const ShoppingCart = (props: Props) => {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState<string | number>(0);
  const [tax, setTax] = useState(0);
  const [currency, setCurrency] = useState('');
  const [checkout, setCheckout] = useState<Checkout>(checkoutInitState);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastStatus, setToastStatus] = useState<ToastStatus>('success');
  const [toastMsg, setToastMsg] = useState('');
  const [customer, setCustomer] = useState<Customer>(customerInitState);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('now');

  const handleCost: HandleCostFn = (cart) => {
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

  const handleItemChange: HandleItemChangeFn = (direction, id) => {
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

  const handleModalChange: HandleModalChangeFn = (e, field) => {
    e.preventDefault();
    setCustomer({ ...customer, [field]: e.target.value });
  };

  const handleModalErrorHandling: HandleModalErrorHandlingFn = (values) => {
    const setStateHelper = (input: string) => {
      setNameError(input);
      setEmailError(input);
    };
    Object.entries(values).forEach((entry) => {
      const [_, value] = entry;
      !value ? setStateHelper('Fill in field') : setStateHelper('');
    });
    if (!nameError || !emailError) return;
  };

  const fetchResponseHelper: FetchResponseHelperFn = async (
    url,
    method,
    body
  ) => {
    let response = responseInitState;
    setIsProcessingInvoice(true);
    try {
      let resp: Response;

      // fetch
      if (method === 'POST' || method === 'PUT') {
        resp = await fetch(url, fetchOptions(body));
      } else {
        resp = await fetch(url);
      }

      // response error handler
      if (!resp.ok) {
        response = { ...response, error: 'Invalid fetch request' };
        return response;
      }

      // data error handler
      const data = await resp.json();
      if (!data.success) {
        response = { ...response, error: 'Invalid data request' };
        return response;
      }
      response = { ...response, data };
      return response;
    } catch (error) {
      const err = error as Error;
      response = { ...response, error: err.message };
      return response;
    } finally {
      setIsProcessingInvoice(false);
    }
  };

  const handleCustomerSearch: HandleCustomerSearchFn = async (customer) => {
    return await fetchResponseHelper(
      `${CONSTANT.domain}/api/v1/customer/search`,
      'POST',
      customer
    );
  };

  const handleInvoice: HandleInvoiceFn = async (cart, checkout, customer) => {
    return await fetchResponseHelper(
      `${CONSTANT.domain}/api/v1/invoices/create`,
      'POST',
      { cart, checkout, customer }
    );
  };

  const handlePayLater = async () => {
    // set customer
    localStorage.setItem('customer', JSON.stringify(customer));
    let cus;
    let invoice;

    // retrieve customer from stripe
    try {
      cus = await handleCustomerSearch(customer);
    } catch (error) {
      handleCatchError('unable to find customer');
    }

    // error handling for customer
    if (!cus || cus.error) {
      handleCatchError('invalid customer info');
    }

    // retrieve invoice from stripe
    try {
      invoice = await handleInvoice(items, checkout, cus!.data.payload);
    } catch (error) {
      handleCatchError('invalid invoice created');
    }

    // error handling for invoice
    if (!invoice || invoice.error) {
      handleCatchError('invalid fetch request');
    }

    // successful invoice fetch request
    localStorage.removeItem('cart');
    localStorage.removeItem('checkout');
    localStorage.removeItem('customer');
    window.dispatchEvent(new Event('storage'));
    const newWindow = window.open(
      `${invoice!.data.payload.hosted_invoice_url}`,
      '_blank',
      'noopener,noreferrer'
    );
    if (newWindow) newWindow.opener = null;
    router.push(`${CONSTANT.domain}/shopping/success`);
  };

  const handleModalSubmit: HandleModalSubmitFn = async (e, command) => {
    e.preventDefault();

    if (command === 'cancel') {
      const modalElement = document.getElementById(
        'modal'
      ) as HTMLDialogElement;
      modalElement.style.display = 'none';
      modalElement.close();
      setNameError('');
      setEmailError('');
      return;
    }

    // error handling
    handleModalErrorHandling(customer);

    if (paymentMethod === 'later') {
      await handlePayLater();
    } else {
      handleCatchError('payment method not found');
    }
  };

  const handleCurrency: HandleCurrencyFn = (cart) => {
    const currencies = cart.map((c: any) => c.item.default_price.currency);
    const checkCurrencies = currencies.every(
      (x: string, i: number, arr: any) => x == arr[0]
    );
    if (checkCurrencies) {
      setCurrency(currencies[0]);
    }
  };

  const handleToastMessage: HandleToastMessageFn = (status, message) => {
    setToastVisible(true);
    setToastStatus(status);
    setToastMsg(message);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCatchError: HandleCatchErrorFn = (message) => {
    const modalElement = document.getElementById('modal') as HTMLDialogElement;
    modalElement.style.display = 'none';
    modalElement.close();
    setNameError('');
    setEmailError('');
    handleToastMessage('fail', message);
    return;
  };

  const handlePayment: HandlePaymentFn = (payMethod) => {
    const isLocalStorageCart = localStorage.getItem('cart');
    const isLocalStorageCheckout = localStorage.getItem('checkout');

    if (!isLocalStorageCart || !isLocalStorageCheckout) {
      handleToastMessage('fail', 'No items in cart');
      return;
    }
    // set checkout currency
    setCheckout({ ...checkout, currency });

    if (payMethod === 'later') {
      // init modal
      const modalElement = document.getElementById(
        'modal'
      ) as HTMLDialogElement;
      modalElement.style.display = 'flex';
      modalElement.showModal();

      // payment method
      setPaymentMethod(payMethod);
    } else {
      router.push(`${CONSTANT.domain}/shopping/checkout`);
    }
  };

  const checkLocalStorage: CheckLocalStorageFn = () => {
    const localStorageCart = localStorage.getItem('cart');

    if (localStorageCart) {
      const cart = JSON.parse(localStorageCart);
      setItems(cart);
      handleCurrency(cart);
    }
  };

  useEffect(() => {
    checkLocalStorage();
    const hasCustomer = localStorage.getItem('customer');

    if (hasCustomer) {
      localStorage.removeItem('customer');
    }
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
    <>
      <div className={styles.cartContainer}>
        {items.length > 0 ? (
          <>
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
                  $
                  {((item.default_price.unit_amount / 100) * quantity).toFixed(
                    2
                  )}
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
          </>
        ) : (
          <>
            <p>No items yet...</p>
            <Link href={`${CONSTANT.domain}/shopping`}>Back to shopping</Link>
          </>
        )}
        {items.length > 0 && (
          <>
            <div className={styles.cartTotalsContainer}>
              <h1 className={styles.cartTotalsTitle}>Your Totals</h1>
              <div className={styles.cartTotalsTallyContainer}>
                <span className={styles.cartTotalsQuantity}>
                  Quantity: {items.length}
                </span>
                <span className={styles.cartTotalsTaxes}>
                  Taxes: ${tax.toFixed(2)}
                </span>
                <span className={styles.cartTotalsCost}>
                  Cost: ${totalCost}
                </span>
              </div>
            </div>
            <div className={styles.cartPaymentContainer}>
              <button
                className={styles.cartPaymentBtn}
                onClick={() => handlePayment('now')}
              >
                pay now
              </button>
              <button
                className={styles.cartPaymentBtn}
                onClick={() => handlePayment('later')}
              >
                pay later
              </button>
            </div>
          </>
        )}
        <ToastMsg
          isVisible={toastVisible}
          status={toastStatus}
          message={toastMsg}
        />
      </div>
      <dialog id="modal" className={styles.modal} open={false}>
        <form>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              maxLength={50}
              required
              pattern="/A-Za-z{0,50}/"
              value={customer.name}
              className={inter.className}
              onChange={(e) => handleModalChange(e, 'name')}
            />
            {nameError && <small>{nameError}</small>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              pattern="/*@*/"
              value={customer.email}
              className={inter.className}
              onChange={(e) => handleModalChange(e, 'email')}
            />
            {emailError && <small>{emailError}</small>}
          </div>
          <div className={styles.btnContainer}>
            <button
              onClick={(e) => handleModalSubmit(e, 'cancel')}
              className={
                isProcessingInvoice
                  ? `${styles.disabled}`
                  : `${styles.notDisabled}`
              }
            >
              cancel
            </button>
            <button
              onClick={(e) => handleModalSubmit(e, 'confirm')}
              className={
                isProcessingInvoice
                  ? `${styles.disabled}`
                  : `${styles.notDisabled}`
              }
            >
              confirm
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default ShoppingCart;
