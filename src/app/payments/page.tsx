import React from 'react';
import StripeContainer from '../components/StripeContainer';

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <h1>accept a payment</h1>
      <StripeContainer />
    </div>
  );
};

export default page;
