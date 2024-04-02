// pages/_app.js
import { Provider } from 'react-redux';
import { NextPage } from 'next';
import store from '../redux/store';

function MyApp({ Component, pageProps }: { Component: NextPage; pageProps: any }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;