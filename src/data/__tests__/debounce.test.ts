import { debounce } from '../../domain/debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('fires only once after the delay with the latest arguments', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    debounced('b');
    debounced('c');

    // Nothing should have fired before the delay elapses.
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancel() prevents a pending invocation from firing', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('x');
    debounced.cancel();

    jest.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('allows a new invocation after a previous one has fired', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced(1);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced(2);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });
});
