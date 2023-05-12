import { reportError } from './reportError';

test('logs the error to the console', async () => {
  console.error = jest.fn();

  const error = new Error('test error');

  reportError(error);

  expect(console.error).toBeCalledWith(error);
});
