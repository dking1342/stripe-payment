'use client';
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeForm from './StripeForm';
import { fetchOptions } from '../utils/fetchOptions';
import CONSTANT from '../constants';

type Props = {
  theme?: 'stripe' | 'night' | 'flat' | 'none' | undefined;
  labels?: 'floating' | 'above' | undefined;
};

const StripeContainer = ({ theme = 'night', labels = 'floating' }: Props) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [errors, setErrors] = useState('');

  const getStripePromise = (key: string) => {
    return loadStripe(`${key}`, {
      apiVersion: '2022-11-15',
    });
  };

  const getPublishKey = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/config');
      if (!res.ok) {
        setErrors('invalid fetch request');
        return;
      }
      const data = await res.json();
      if (!data.success) {
        setErrors('invalid route request');
        return;
      }
      setStripePromise(data.payload);
    } catch (error) {
      const err = error as Error;
      setErrors(err.message);
      return;
    }
  };

  const getPaymentIntent = async () => {
    try {
      // get checkout state
      const hasCheckout = localStorage.getItem('checkout');

      if (!hasCheckout) {
        setErrors('invalid checkout');
        return;
      }
      const checkout = JSON.parse(hasCheckout);
      const res = await fetch(
        `${CONSTANT.domain}/api/v1/payments/create-payment-intent`,
        fetchOptions(checkout)
      );
      if (!res.ok) {
        setErrors('invalid fetch request');
      }

      const data = await res.json();
      if (!data.success) {
        setErrors('invalid route request');
      }
      setClientSecret(data.payload);
    } catch (error) {
      const err = error as Error;
      setErrors(err.message);
    }
  };

  useEffect(() => {
    getPublishKey();
    getPaymentIntent();
  }, []);

  return (
    <>
      {stripePromise && clientSecret && (
        <Elements
          stripe={getStripePromise(stripePromise)}
          options={{
            clientSecret,
            appearance: { theme, labels },
          }}
        >
          <StripeForm />
        </Elements>
      )}
      {errors && <small>{errors}</small>}
    </>
  );
};

export default StripeContainer;
