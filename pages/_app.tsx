import "../styles/globals.css";

type AppPropsLocal = { Component: any; pageProps: Record<string, unknown> };

export default function App({ Component, pageProps }: AppPropsLocal) {
  return <Component {...pageProps} />;
}

