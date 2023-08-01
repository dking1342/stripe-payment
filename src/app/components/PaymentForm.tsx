'use client';
import React, { useEffect, useState } from 'react';
import { fetchOptions } from '../utils/fetchOptions';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CONSTANT from '../constants';

type Props = {};

const PaymentForm = (props: Props) => {
  let [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [viewProducts, setViewProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    currency: 'usd',
    productSelect: { price_id: 1, quantity: 1 },
    hasSub: false,
    customer: { name: 'jack', email: 'jack@example.com' },
    payment: {
      cc: '4242424242424242',
      ccMonth: '01',
      ccYear: '25',
      ccCvc: '123',
    },
  });

  const handleNav = (e: any, type: 'next' | 'back') => {
    e.preventDefault();
    switch (type) {
      case 'next':
        setPage(page++);
        break;
      case 'back':
        setPage(page--);
      default:
        setPage(1);
        break;
    }
    setPage(page++);
  };

  const handleChange = (e: any, name: string, val?: any) => {
    switch (name) {
      case 'currency':
        const filteredProducts = products.filter(
          (x) => x.default_price.currency === e.target.value.toLowerCase()
        );
        setFormValues({
          ...formValues,
          currency: e.target.value.toLowerCase(),
        });
        setViewProducts(filteredProducts);

        break;
      case 'sub':
        setFormValues({
          ...formValues,
          hasSub: !formValues.hasSub,
        });
        break;
      case 'name':
        setFormValues({
          ...formValues,
          customer: { ...formValues.customer, name: e.target.value },
        });
        break;
      case 'email':
        setFormValues({
          ...formValues,
          customer: { ...formValues.customer, email: e.target.value },
        });
        break;
      case 'cc':
        setFormValues({
          ...formValues,
          payment: { ...formValues.payment, cc: e.target.value },
        });
        break;
      case 'month':
        setFormValues({
          ...formValues,
          payment: { ...formValues.payment, ccMonth: e.target.value },
        });
        break;
      case 'year':
        setFormValues({
          ...formValues,
          payment: { ...formValues.payment, ccYear: e.target.value },
        });
        break;
      case 'cvc':
        setFormValues({
          ...formValues,
          payment: { ...formValues.payment, ccCvc: e.target.value },
        });
        break;
      case 'price':
        e.preventDefault();
        setFormValues({
          ...formValues,
          productSelect: {
            ...formValues.productSelect,
            price_id: val,
          },
        });
        break;
      default:
        return;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const options: RequestInit = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(formValues),
      };
      const response = await fetch(
        'http://localhost:3000/api/v1/sessions/create-checkout-session',
        options
      );
      const data = await response.json();
    } catch (error) {
      const err = error as Error;
    }
  };

  // fetch requests
  const getProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/products');
      if (res.ok) {
        const { payload } = await res.json();
        setProducts(payload);
        setViewProducts(
          payload.filter(
            (x: any) => x.default_price.currency === formValues.currency
          )
        );
        setFormValues({
          ...formValues,
          productSelect: {
            ...formValues.productSelect,
            price_id: payload.filter(
              (x: any) => x.default_price.currency === formValues.currency
            )[0].default_price.id,
          },
        });
      } else {
        setErrors('unsuccessful');
      }
    } catch (error) {
      const err = error as Error;
      setErrors(err.message);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      {page === 1 ? (
        <>
          <div>
            <select
              name="currency"
              id="currency"
              onChange={(e) => handleChange(e, 'currency')}
            >
              <option defaultValue="usd">USD</option>
              <option value="eur">EUR</option>
            </select>
          </div>
          <div>
            {viewProducts
              .sort(
                (a, b) =>
                  a.default_price.unit_amount - b.default_price.unit_amount
              )
              .map((p) => (
                <button
                  style={
                    p.default_price.id === formValues.productSelect.price_id
                      ? { backgroundColor: 'pink' }
                      : { backgroundColor: 'grey' }
                  }
                  key={p.id}
                  onClick={(e) => handleChange(e, 'price', p.default_price.id)}
                >
                  {formValues.currency === 'usd'
                    ? '$'
                    : formValues.currency === 'eur'
                    ? '€'
                    : ''}
                  {(p.default_price.unit_amount / 100).toPrecision(4)}
                </button>
              ))}
          </div>
          <div>
            <label htmlFor="sub">Subscription?</label>
            <input
              type="checkbox"
              name="sub"
              id="sub"
              checked={formValues.hasSub}
              onChange={(e) => handleChange(e, 'sub')}
            />
          </div>
        </>
      ) : page === 2 ? (
        <>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formValues.customer.name}
              onChange={(e) => handleChange(e, 'name')}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formValues.customer.email}
              onChange={(e) => handleChange(e, 'email')}
            />
          </div>
        </>
      ) : (
        <div>
          <h3>payment method</h3>
          <div>
            <label htmlFor="cc">Credit Card</label>
            <input
              type="text"
              maxLength={16}
              minLength={16}
              name="cc"
              id="cc"
              value={formValues.payment.cc}
              onChange={(e) => handleChange(e, 'cc')}
            />
          </div>
          <div>
            <label htmlFor="month">Month</label>
            <select
              name="month"
              id="month"
              value={formValues.payment.ccMonth}
              onChange={(e) => handleChange(e, 'month')}
            >
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dev</option>
            </select>
          </div>
          <div>
            <label htmlFor="year">Year</label>
            <select
              name="year"
              id="year"
              value={formValues.payment.ccYear}
              onChange={(e) => handleChange(e, 'year')}
            >
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
            </select>
          </div>
          <div>
            <label htmlFor="cvc">CVC</label>
            <input
              type="text"
              name="cvc"
              id="cvc"
              value={formValues.payment.ccCvc}
              onChange={(e) => handleChange(e, 'cvc')}
            />
          </div>
        </div>
      )}

      <div>
        <span>
          {page > 1 && (
            <button onClick={(e) => handleNav(e, 'back')}>back</button>
          )}
        </span>
        <span>
          {page < 3 && (
            <button onClick={(e) => handleNav(e, 'next')}>next</button>
          )}
        </span>
        {page === 3 && (
          <div>
            <input type="submit" value="submit" />
          </div>
        )}
      </div>
    </form>
  );
};

export default PaymentForm;
