type PromiseLike<T> = T | Promise<T>;

const promisify = <T>(fn: () => PromiseLike<T>): Promise<T> => {
  if (fn instanceof Promise) {
    return fn;
  }

  return new Promise((resolve, reject) => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  });
};

export const retry = <T>(
  fn: () => PromiseLike<T>,
  options: {
    retries: number;
    delay: number;
    onRetry?: (error: Error, count: number) => void;
  },
) => {
  const func = () => promisify(fn);
  return new Promise<T>((resolve, reject) => {
    const attempt = (count: number) => {
      func()
        .then(resolve)
        .catch((error) => {
          if (count >= options.retries) {
            reject(error);
          } else {
            if (options.onRetry) {
              options.onRetry(error, count);
            }
            setTimeout(() => attempt(count + 1), options.delay);
          }
        });
    };
    attempt(1);
  });
};
