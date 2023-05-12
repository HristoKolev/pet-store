import { render, screen } from '@testing-library/react';
import { Modal } from './Modal';
import userEvent from '@testing-library/user-event';

test('clicking on the X button calls onClose', async () => {
  const user = userEvent.setup();

  const handleOnClose = jest.fn();

  render(<Modal onClose={handleOnClose} children={<></>} />);

  const xButton = screen.getByRole('button', { name: 'Close modal' });

  await user.click(xButton);

  expect(handleOnClose).toBeCalled();
});

test('clicking on the backdrop calls onClose', async () => {
  const user = userEvent.setup();

  const handleOnClose = jest.fn();

  render(<Modal onClose={handleOnClose} children={<></>} />);

  await user.click(screen.getByTestId('modal-backdrop'));

  expect(handleOnClose).toBeCalled();
});
