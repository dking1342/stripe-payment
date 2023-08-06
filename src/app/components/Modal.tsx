'use client';
import React, { useState } from 'react';
import styles from '../styles/ShoppingCart.module.sass';
import { Inter } from 'next/font/google';
import { fetchOptions } from '../utils/fetchOptions';
import CONSTANT from '../constants';
import Stripe from 'stripe';
import { useRouter } from 'next/navigation';
import ToastMsg from './ToastMsg';
import { couldStartTrivia } from 'typescript';

const inter = Inter({ subsets: ['latin'], weight: ['100', '200', '300'] });

type Props = {
  paymentMethod?: PaymentMethod;
  items?: any[];
  checkout?: Checkout;
  item?: any;
};

// variables
type Customer = {
  name: string;
  email: string;
};
type Checkout = {
  amount: number;
  quantity: number;
  currency: string;
};

type Field = 'name' | 'email';
type SubmitOptions = 'cancel' | 'confirm';
type PaymentMethod = 'now' | 'later' | 'sub';
type Resp = { data: any; error: string };
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ToastStatus = 'success' | 'fail';

// functions
type HandleModalChangeFn = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: Field
) => void;
type HandleModalSubmitFn = (
  e: React.MouseEvent<HTMLButtonElement>,
  command: SubmitOptions
) => Promise<void>;
type HandleModalErrorHandlingFn = (values: Customer) => void;
type HandleCustomerSearchFn = (customer: any) => Promise<Resp>;
type FetchResponseHelperFn = (
  url: string,
  method: Method,
  body: any
) => Promise<Resp>;
type HandleCatchErrorFn = (message: string) => void;
type HandleToastMessageFn = (status: ToastStatus, message: string) => void;
type HandleInvoiceFn = (
  cart: any,
  customer: Stripe.Customer,
  checkout?: Checkout | null
) => Promise<Resp>;

// init state
const customerInitState: Customer = { name: 'jack', email: 'jack@example.com' };
const responseInitState: Resp = { data: null, error: '' };
const checkoutInitState: Checkout = { amount: 0, quantity: 0, currency: '' };

const Modal = ({ paymentMethod, items, checkout, item }: Props) => {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(customerInitState);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastStatus, setToastStatus] = useState<ToastStatus>('success');
  const [toastMsg, setToastMsg] = useState('');

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

  const handleCustomerSearch: HandleCustomerSearchFn = async (customer) => {
    return await fetchResponseHelper(
      `${CONSTANT.domain}/api/v1/customer/search`,
      'POST',
      customer
    );
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

  const handleInvoice: HandleInvoiceFn = async (cart, customer, checkout?) => {
    return await fetchResponseHelper(
      `${CONSTANT.domain}/api/v1/invoices/create`,
      'POST',
      { cart, checkout, customer }
    );
  };

  const handleSub = async (body: any) => {
    return await fetchResponseHelper(
      `${CONSTANT.domain}/api/v1/subscriptions`,
      'POST',
      body
    );
  };

  const handleSubscription = async () => {
    // set customer
    localStorage.setItem('customer', JSON.stringify(customer));
    let cus;
    let priceId = item.default_price.id;
    let sub;

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

    // post subscription to stripe
    const body = { customerId: cus?.data.payload.id, priceId };
    try {
      sub = await handleSub(body);
    } catch (error) {
      console.log(error);
      handleCatchError('invalid subscription created');
    }

    // error handling for sub
    if (!sub || sub.error) {
      handleCatchError('invalid fetch created');
    }

    // successful subscription fetch request
    localStorage.removeItem('subscriptions');
    localStorage.removeItem('customer');
    window.dispatchEvent(new Event('storage'));
    const newWindow = window.open(
      `${sub!.data.payload.latest_invoice.hosted_invoice_url}`,
      '_blank',
      'noopener,noreferrer'
    );
    if (newWindow) newWindow.opener = null;
    router.push(`${CONSTANT.domain}/shopping/success`);
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
      invoice = await handleInvoice(items, cus!.data.payload, checkout);
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

  const handleModalChange: HandleModalChangeFn = (e, field) => {
    e.preventDefault();
    setCustomer({ ...customer, [field]: e.target.value });
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
    }
    if (paymentMethod === 'sub') {
      await handleSubscription();
    }
  };

  return (
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
      <ToastMsg
        isVisible={toastVisible}
        status={toastStatus}
        message={toastMsg}
      />
    </dialog>
  );
};

export default Modal;
