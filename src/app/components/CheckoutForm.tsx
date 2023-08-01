'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Props = {};

const CheckoutForm = (props: Props) => {
  const router = useRouter();
  let [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [viewProducts, setViewProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    currency: 'usd',
    productSelect: { price_id: '', quantity: 1 },
    hasSub: false,
  });

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

      if (data.success) {
        router.push(data.payload.url);
      } else {
        setErrors('error');
      }
    } catch (error) {
      const err = error as Error;
      setErrors(err.message);
    }
  };

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

  if (errors) {
    return (
      <div>
        <h1>errors</h1>
        <p>{errors}</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
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
            (a, b) => a.default_price.unit_amount - b.default_price.unit_amount
          )
          .map((p) => (
            <button
              style={
                p.default_price.id === formValues.productSelect.price_id
                  ? { backgroundColor: 'green' }
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
      <div>
        <input type="submit" value="make payment" />
      </div>
    </form>
  );
};

export default CheckoutForm;
