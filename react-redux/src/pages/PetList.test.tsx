import { setupServer } from 'msw/node';
import { defaultHandlers, renderWithProviders } from '../testing/testing-utils';
import { rest } from 'msw';
import { API_URL } from '../utils/api-client';
import { act, screen, within } from '@testing-library/react';
import { PetList } from './PetList';
import { createReduxStore } from '../redux/createReduxStore';
import { fetchPetsData } from '../redux/globalSlice';

jest.mock('../utils/reportError');

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test('shows a message when there are no pets', async () => {
  server.use(rest.get(`${API_URL}/pet/all`, async (_req, res, ctx) => res(ctx.json([]))));

  const store = createReduxStore();

  await act(async () => {
    await store.dispatch(fetchPetsData()).unwrap();
  });

  renderWithProviders(<PetList onEdit={jest.fn} onDelete={jest.fn} />, { store });

  const table = await screen.findByRole('table');

  expect(within(table).queryAllByRole('row', { name: 'Pet' })).toHaveLength(0);

  expect(screen.getByText('No items.')).toBeInTheDocument();
});

test('row shows pet list item data', async () => {
  const store = createReduxStore();

  await act(async () => {
    await store.dispatch(fetchPetsData()).unwrap();
  });

  renderWithProviders(<PetList onEdit={jest.fn} onDelete={jest.fn} />, { store });

  const table = await screen.findByRole('table');

  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];

  expect(within(row).getByTestId('col_petId')).toHaveTextContent('42');
  expect(within(row).getByTestId('col_petName')).toHaveTextContent('Gosho');
  expect(within(row).getByTestId('col_addedDate')).toHaveTextContent('31 Oct 2022');
  expect(within(row).getByTestId('col_petKind')).toHaveTextContent('Cat');
});
