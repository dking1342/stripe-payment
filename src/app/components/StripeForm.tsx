import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { StripeElements, Stripe } from '@stripe/stripe-js';
import CONSTANTS from '../constants';
import { useRouter } from 'next/navigation';
import styles from '../styles/StripeContainer.module.sass';

type Props = {};

const StripeForm = (props: Props) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<string | null>(null);

  const checkElementError = async (el: StripeElements | null) => {
    if (!el) {
      return;
    }
    try {
      const { error: submitError } = await el.submit();
      if (submitError && submitError.message) {
        setMessages(submitError.message && submitError.message);
        return;
      }
    } catch (error) {
      const err = error as Error;
      setMessages(err.message);
      return;
    }
  };

  const confirmPayment = async (
    st: Stripe | null,
    el: StripeElements | null
  ) => {
    if (!st || !el) {
      return;
    }
    try {
      const { error, paymentIntent } = await st.confirmPayment({
        elements: el,
        confirmParams: {
          return_url: `${CONSTANTS.domain}/success`,
        },
        redirect: 'if_required',
      });
      if (error && error.message) {
        setMessages(error.message);
        return;
      }
      if (paymentIntent && paymentIntent.status) {
        switch (paymentIntent.status) {
          case 'succeeded':
            router.push(`${CONSTANTS.domain}/shopping/success`);
            localStorage.removeItem('checkout');
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('storage'));
            break;

          default:
            setMessages(`Payment status: ${paymentIntent.status}`);
            break;
        }
      }
    } catch (error) {
      const err = error as Error;
      setMessages(err.message);
      return;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setIsProcessing(true);
    setMessages('');
    try {
      await checkElementError(elements);
      await confirmPayment(stripe, elements);
    } catch (error) {
      const err = error as Error;
      setMessages(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <PaymentElement />
      <div className={styles.paymentContainer}>
        <button
          type="submit"
          className={styles.paymentBtn}
          disabled={isProcessing}
        >
          <span>{isProcessing ? 'Processing...' : 'Pay Now'}</span>
        </button>
        {messages && <small>{messages}</small>}
      </div>
    </form>
  );
};

export default StripeForm;
