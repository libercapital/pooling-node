export interface PoolParam<T> {
  fn: () => Promise<T>
  validate: (data: T) => boolean;
  interval?: number;
  intervalDelay?: (attemptIndex: number) => number;
  maxAttempts: number;
  backoff?: boolean;
}

const poll = async <T>({
  fn,
  validate,
  interval,
  intervalDelay,
  maxAttempts,
  backoff = false,
}: PoolParam<T>): Promise<T> => {
  let attempts = 0;
  let timeout = 0;

  const executePoll = async (resolve: (value: T) => void, reject: (value: unknown) => void) => {
    const result = await fn();
    attempts += 1;
    if (intervalDelay) {
      timeout = intervalDelay(attempts);
    } else if (typeof interval === 'number') {
      timeout = backoff ? timeout + interval : interval;
    } 

    const isValidate = validate(result);

    if (isValidate) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error('Exceeded max attempts'));
    } else {
      setTimeout(executePoll, timeout, resolve, reject);
      return;
    }
  };

  return new Promise(executePoll);
};

export default poll;
