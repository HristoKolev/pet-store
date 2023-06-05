import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { App } from './App';
import { API_URL } from './utils/api-client';
import { defaultHandlers, renderWithProviders } from './testing/testing-utils';

jest.mock('./utils/reportError');

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

test('shows app heading', async () => {
  renderWithProviders(<App />);

  expect(screen.getByRole('heading', { name: 'Pet Store' })).toBeInTheDocument();
});

test('add pet button is only shown after the first fetch', async () => {
  renderWithProviders(<App />);

  expect(screen.queryByRole('button', { name: 'Add Pet' })).not.toBeInTheDocument();

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  expect(screen.getByRole('button', { name: 'Add Pet' })).toBeInTheDocument();
});

test('shows an error indicator when the pets endpoint fails', async () => {
  server.use(rest.get(`${API_URL}/pet/all`, async (_req, res, ctx) => res(ctx.status(500))));

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  await waitFor(() => {
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
  });
});

test('shows an error indicator when the pet kinds endpoint fails', async () => {
  server.use(rest.get(`${API_URL}/pet/kinds`, async (_req, res, ctx) => res(ctx.status(500))));

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  await waitFor(() => {
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
  });
});

test('displays a list of pets', async () => {
  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  const table = await screen.findByRole('table');

  expect(within(table).getAllByRole('row', { name: 'Pet' })).toHaveLength(3);
});

test('shows a message when there are no pets', async () => {
  server.use(rest.get(`${API_URL}/pet/all`, async (_req, res, ctx) => res(ctx.json([]))));

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  const table = await screen.findByRole('table');

  expect(within(table).queryAllByRole('row', { name: 'Pet' })).toHaveLength(0);

  expect(screen.getByText('No items.')).toBeInTheDocument();
});

test('view / edit button brings up the details modal', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  const table = await screen.findByRole('table');

  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];

  const editButton = within(row).getByRole('button', { name: 'View / Edit' });

  await user.click(editButton);

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'View / Edit pet modal' })).toBeInTheDocument();
  });
});

test('delete button brings up the delete modal', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  const table = await screen.findByRole('table');

  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];

  const deleteButton = within(row).getByRole('button', { name: 'Delete' });

  await user.click(deleteButton);

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Delete pet modal' })).toBeInTheDocument();
  });
});

test('clicking the cancel button on the delete modal closes the modal', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const table = await screen.findByRole('table');

  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];

  const deleteButton = within(row).getByRole('button', { name: 'Delete' });

  await user.click(deleteButton);

  const deleteModal = await screen.findByRole('dialog', { name: 'Delete pet modal' });

  await user.click(within(deleteModal).getByRole('button', { name: 'Cancel' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: 'Delete pet modal' })).not.toBeInTheDocument();
  });
});

test('clicking the cancel button on the edit modal closes the modal', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const table = await screen.findByRole('table');

  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];

  const editButton = within(row).getByRole('button', { name: 'View / Edit' });

  await user.click(editButton);

  const deleteModal = await screen.findByRole('dialog', { name: 'View / Edit pet modal' });

  await user.click(within(deleteModal).getByRole('button', { name: 'Cancel' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: 'View / Edit pet modal' })).not.toBeInTheDocument();
  });
});

test('add buttons brings up the add modal', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  const addButton = screen.getByRole('button', { name: 'Add Pet' });

  await user.click(addButton);

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Add pet modal' })).toBeInTheDocument();
  });
});

test('re-fetches the list of pets when a pet is deleted', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const table = await screen.findByRole('table');
  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];
  const deleteButton = within(row).getByRole('button', { name: 'Delete' });
  await user.click(deleteButton);

  const confirmButton = await screen.findByRole('button', { name: 'Confirm' });

  const onPetListEndpoint = jest.fn();
  const onPetKindsEndpoint = jest.fn();

  server.use(
    rest.get(`${API_URL}/pet/all`, async (_req, res, ctx) => {
      onPetListEndpoint();
      return res(ctx.json([]));
    }),
    rest.get(`${API_URL}/pet/kinds`, async (_req, res, ctx) => {
      onPetKindsEndpoint();
      return res(ctx.json([]));
    })
  );

  await user.click(confirmButton);

  await waitFor(async () => {
    await expect(onPetListEndpoint).toBeCalled();
  });

  await waitFor(async () => {
    await expect(onPetKindsEndpoint).not.toBeCalled();
  });
});

test('re-fetches the list of pets when a pet is saved', async () => {
  const user = userEvent.setup();

  renderWithProviders(<App />);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  const table = await screen.findByRole('table');

  const row = within(table).getAllByRole('row', { name: 'Pet' })[0];

  await user.click(within(row).getByRole('button', { name: 'View / Edit' }));

  const editModal = await screen.findByRole('dialog', { name: 'View / Edit pet modal' });

  await user.click(within(editModal).getByRole('button', { name: 'Edit' }));

  await waitFor(() => {
    expect(within(editModal).getByRole('heading', { name: 'Edit pet' })).toBeInTheDocument();
  });

  await user.type(within(editModal).getByLabelText('Name:'), '_new');

  const onPetListEndpoint = jest.fn();
  const onPetKindsEndpoint = jest.fn();

  server.use(
    rest.get(`${API_URL}/pet/all`, async (_req, res, ctx) => {
      onPetListEndpoint();
      return res(ctx.json([]));
    }),
    rest.get(`${API_URL}/pet/kinds`, async (_req, res, ctx) => {
      onPetKindsEndpoint();
      return res(ctx.json([]));
    })
  );

  await user.click(await within(editModal).findByRole('button', { name: 'Save' }));

  await waitFor(async () => {
    await expect(onPetListEndpoint).toBeCalled();
  });

  await waitFor(async () => {
    await expect(onPetKindsEndpoint).not.toBeCalled();
  });
});
