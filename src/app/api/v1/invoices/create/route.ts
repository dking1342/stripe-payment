import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import CONSTANT from '../../../../constants';

const stripe = new Stripe(CONSTANT.secret, {
  apiVersion: '2022-11-15',
});

export const POST = async (req: Request) => {
  let cart;
  let cus;
  let invoice;
  let finalInvoice;
  let errorArr = [];
  try {
    const { cart: reqCart, customer: reqCustomer } = await req.json();
    cart = reqCart;
    cus = reqCustomer;
  } catch (error) {
    const err = error as Error;
    errorArr.push(err.message);
  }

  try {
    // create invoice
    const inv = await stripe.invoices.create({
      customer: cus.id,
      pending_invoice_items_behavior: 'exclude',
      collection_method: 'send_invoice',
      days_until_due: 30,
    });
    invoice = inv;
  } catch (error) {
    const err = error as Error;
    errorArr.push(err.message);
  }

  try {
    const mappedInvoices = cart.map((item: any) => {
      return new Promise(async (resolve, reject) => {
        try {
          let invoiceItem = await stripe.invoiceItems.create({
            customer: cus.id,
            price: item.item.default_price.id,
            quantity: Number(item.quantity),
            invoice: invoice.id,
          });
          return resolve(invoiceItem);
        } catch (error) {
          const err = error as Error;
          return reject(err.message);
        }
      });
    });

    // create invoice item/s
    const promiseFn = async () => {
      try {
        let promises = await Promise.all(mappedInvoices);
      } catch (error) {
        const err = error as Error;
        errorArr.push(err.message);
      }
    };
    await promiseFn();
  } catch (error) {
    const err = error as Error;
    errorArr.push(err.message);
  }

  try {
    // finalized invoice item
    finalInvoice = await stripe.invoices.sendInvoice(invoice.id);
  } catch (error) {
    const err = error as Error;
    errorArr.push(err.message);
  }

  const filteredErrors = errorArr.filter((x) => x !== undefined);

  if (filteredErrors.length) {
    return NextResponse.json(
      {
        success: false,
        message: JSON.stringify(errorArr),
        payload: null,
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'invoice created',
      payload: finalInvoice,
    },
    {
      status: 201,
    }
  );
};
