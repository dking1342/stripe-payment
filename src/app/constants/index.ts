export default {
  secret: process.env.SECRET_KEY!,
  publish: process.env.PUBLISH_KEY!,
  domain:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NODE_ENV === 'production'
      ? 'https://stripe-payment-mocha.vercel.app/'
      : '',
};
