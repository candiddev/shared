declare module "https://cdn.paddle.com/paddle/paddle.js";

declare global {
  namespace NodeJS {
    interface Global {
      Paddle: PaddleJS;
    }
  }
}

declare const Paddle: PaddleJS;

interface PaddleJS {
  Checkout: {
    open(product: {
      closeCallback(): void;
      email: string;
      passthrough: string;
      product: number;
      success: string;
    });
  };
  Environment: {
    set(environment: string): void;
  };
  Product: {
    Prices(
      productID: number,
      callback: (price: {
        country: string;
        price: {
          net: string;
        };
      }) => void,
    ): void;
  };
  Setup(config: { vendor: number }): void;
}
