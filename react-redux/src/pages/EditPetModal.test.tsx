import { act, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { defaultHandlers, renderWithProviders } from '../testing/testing-utils';
import { createReduxStore } from '../redux/createReduxStore';
import { fetchPetsData } from '../redux/globalSlice';
import { EditPetModal } from './EditPetModal';
import { API_URL } from '../utils/api-client';
import { WaitHandle } from '../testing/wait-handle';

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

interface RenderEditModalOptions {
  registerHandlers?: () => void;

  addMode?: boolean;
}

const renderEditModal = async (options?: RenderEditModalOptions) => {
  const handleOnDeleted = jest.fn();
  const handleOnClose = jest.fn();
  const handleOnSaved = jest.fn();

  const store = createReduxStore();

  await act(async () => {
    await store.dispatch(fetchPetsData()).unwrap();
  });

  options?.registerHandlers?.();

  const petId = options?.addMode ? undefined : 42;

  renderWithProviders(
    <EditPetModal petId={petId} onClose={handleOnClose} onDeleted={handleOnDeleted} onSaved={handleOnSaved} />,
    { store }
  );

  return {
    handleOnDeleted,
    handleOnClose,
    handleOnSaved,
  };
};

const verifyDisplayMode = async () => {
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'View pet' })).toBeInTheDocument();
  });

  const editButton = screen.getByRole('button', { name: 'Edit' });
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });

  expect(editButton).toBeEnabled();
  expect(deleteButton).toBeEnabled();
  expect(cancelButton).toBeEnabled();

  const nameField = screen.getByLabelText('Name:');
  expect(nameField).toBeDisabled();

  const kindField = screen.getByLabelText('Kind:');
  expect(kindField).toBeDisabled();

  const ageField = screen.getByLabelText('Age:');
  expect(ageField).toBeDisabled();

  const healthProblemsField = screen.getByLabelText('Health Problems:');
  expect(healthProblemsField).toBeDisabled();

  const addedDateField = screen.getByLabelText('Added Date:');
  expect(addedDateField).toBeDisabled();

  const notesField = screen.getByLabelText('Notes:');
  expect(notesField).toBeDisabled();
};

const verifyEditMode = async () => {
  expect(screen.getByRole('heading', { name: 'Edit pet' })).toBeInTheDocument();

  const saveButton = screen.getByRole('button', { name: 'Save' });
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });

  expect(saveButton).toBeEnabled();
  expect(cancelButton).toBeEnabled();

  const nameField = screen.getByLabelText('Name:');
  expect(nameField).toBeEnabled();

  const kindField = screen.getByLabelText('Kind:');
  expect(kindField).toBeDisabled();

  const ageField = screen.getByLabelText('Age:');
  expect(ageField).toBeEnabled();

  const healthProblemsField = screen.getByLabelText('Health Problems:');
  expect(healthProblemsField).toBeEnabled();

  const addedDateField = screen.getByLabelText('Added Date:');
  expect(addedDateField).toBeDisabled();

  const notesField = screen.getByLabelText('Notes:');
  expect(notesField).toBeEnabled();
};

const verifyAddMode = async () => {
  expect(screen.getByRole('heading', { name: 'Add pet' })).toBeInTheDocument();

  const saveButton = screen.getByRole('button', { name: 'Save' });
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });

  expect(saveButton).toBeEnabled();
  expect(cancelButton).toBeEnabled();

  const nameField = screen.getByLabelText('Name:');
  expect(nameField).toBeEnabled();

  const kindField = screen.getByLabelText('Kind:');
  expect(kindField).toBeEnabled();

  const ageField = screen.getByLabelText('Age:');
  expect(ageField).toBeEnabled();

  const healthProblemsField = screen.getByLabelText('Health Problems:');
  expect(healthProblemsField).toBeEnabled();

  const addedDateField = screen.getByLabelText('Added Date:');
  expect(addedDateField).toBeEnabled();

  const notesField = screen.getByLabelText('Notes:');
  expect(notesField).toBeEnabled();
};

const verifyDefaultFieldValues = () => {
  expect(screen.getByLabelText('Name:')).toHaveValue('Gosho');
  expect(screen.getByLabelText('Kind:')).toHaveValue('1');
  expect(screen.getByLabelText('Age:')).toHaveValue(2);
  expect(screen.getByLabelText('Health Problems:')).not.toBeChecked();
  expect(screen.getByLabelText('Added Date:')).toHaveValue('2022-10-31');
  expect(screen.getByLabelText('Notes:')).toHaveValue('White fur, very soft.');
};

test('edit modal defaults to view mode when called with a valid pet id', async () => {
  await renderEditModal();

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  await verifyDisplayMode();
});

test('shows error indicator when pet request fails', async () => {
  await renderEditModal({
    registerHandlers: () => {
      server.use(rest.get(`${API_URL}/pet/:petId`, async (_req, res, ctx) => res(ctx.status(500))));
    },
  });

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator);

  await waitFor(() => {
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
  });
});

test('onClosed is called on successful delete operation', async () => {
  const user = userEvent.setup();

  const { handleOnClose } = await renderEditModal();

  const deleteButton = await screen.findByRole('button', { name: 'Delete' });

  await user.click(deleteButton);

  const deleteModal = await screen.findByRole('dialog', { name: 'Delete pet modal' });

  const confirmButton = await within(deleteModal).findByRole('button', { name: 'Confirm' });

  await user.click(confirmButton);

  expect(handleOnClose).toBeCalled();
});

test('onClosed is called when cancel button is clicked', async () => {
  const user = userEvent.setup();

  const { handleOnClose } = await renderEditModal();

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });

  await user.click(cancelButton);

  expect(handleOnClose).toBeCalled();
});

test('transitions the form into edit mode when the edit button is clicked', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const editButton = await screen.findByRole('button', { name: 'Edit' });

  await user.click(editButton);

  await verifyEditMode();
});

test('transitions back to display mode when the cancel button is clicked', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const editButton = await screen.findByRole('button', { name: 'Edit' });

  await user.click(editButton);

  expect(screen.getByRole('heading', { name: 'Edit pet' })).toBeInTheDocument();

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });

  await user.click(cancelButton);

  await verifyDisplayMode();
});

test('clicking save transitions the form to display mode', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const editButton = await screen.findByRole('button', { name: 'Edit' });

  await user.click(editButton);

  const nameField = screen.getByLabelText('Name:');
  const ageField = screen.getByLabelText('Age:');
  const healthProblemsField = screen.getByLabelText('Health Problems:');
  const notesField = screen.getByLabelText('Notes:');

  await user.clear(nameField);
  await user.type(nameField, 'test123');
  await user.clear(ageField);
  await user.type(ageField, '2');
  await user.click(healthProblemsField);
  await user.clear(notesField);
  await user.type(notesField, 'Notes 123');

  const waitHande = new WaitHandle();

  server.use(
    rest.put(`${API_URL}/pet/:petId`, async (req, res, ctx) => {
      await waitHande.wait();
      const petId = Number(req.params.petId);
      const body = await req.json();
      return res(ctx.json({ ...body, petId }));
    })
  );

  const saveButton = screen.getByRole('button', { name: 'Save' });

  await user.click(saveButton);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  waitHande.release();
  await waitForElementToBeRemoved(loadingIndicator);

  await verifyDisplayMode();

  expect(screen.getByLabelText('Name:')).toHaveValue('test123');
  expect(screen.getByLabelText('Kind:')).toHaveValue('1');
  expect(screen.getByLabelText('Age:')).toHaveValue(2);
  expect(screen.getByLabelText('Health Problems:')).toBeChecked();
  expect(screen.getByLabelText('Added Date:')).toHaveValue('2022-10-31');
  expect(screen.getByLabelText('Notes:')).toHaveValue('Notes 123');
});

test('delete modal is closed after cancel is clicked', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const deleteButton = await screen.findByRole('button', { name: 'Delete' });

  await user.click(deleteButton);

  const deleteModal = await screen.findByRole('dialog', { name: 'Delete pet modal' });

  const cancelButton = await within(deleteModal).findByRole('button', { name: 'Cancel' });

  await user.click(cancelButton);

  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: 'Delete pet modal' })).not.toBeInTheDocument();
  });
});

test('form is returned to display mode when the cancel button is clicked', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const editButton = await screen.findByRole('button', { name: 'Edit' });

  await user.click(editButton);

  const nameField = screen.getByLabelText('Name:');
  const ageField = screen.getByLabelText('Age:');
  const healthProblemsField = screen.getByLabelText('Health Problems:');
  const notesField = screen.getByLabelText('Notes:');

  await user.clear(nameField);
  await user.type(nameField, 'test123');
  await user.clear(ageField);
  await user.type(ageField, '2');
  await user.click(healthProblemsField);
  await user.clear(notesField);
  await user.type(notesField, 'Notes 123');

  const cancelButton = screen.getByRole('button', { name: 'Cancel' });

  await user.click(cancelButton);

  await verifyDisplayMode();

  await verifyDefaultFieldValues();
});

test('cancel button resets the state successfully after failed update request', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const editButton = await screen.findByRole('button', { name: 'Edit' });

  await user.click(editButton);

  const nameField = screen.getByLabelText('Name:');
  const ageField = screen.getByLabelText('Age:');
  const healthProblemsField = screen.getByLabelText('Health Problems:');
  const notesField = screen.getByLabelText('Notes:');

  await user.clear(nameField);
  await user.type(nameField, 'test123');
  await user.clear(ageField);
  await user.type(ageField, '2');
  await user.click(healthProblemsField);
  await user.clear(notesField);
  await user.type(notesField, 'Notes 123');

  const waitHandle = new WaitHandle();

  server.use(
    rest.put(`${API_URL}/pet/:petId`, async (_req, res, ctx) => {
      await waitHandle.wait();
      return res(ctx.status(500));
    })
  );

  const saveButton = screen.getByRole('button', { name: 'Save' });

  await user.click(saveButton);

  const loadingIndicator = await screen.findByTestId('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  await waitFor(() => {
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
  });

  const cancelButton = screen.getByRole('button', { name: 'Cancel' });

  await user.click(cancelButton);

  await verifyDisplayMode();

  await verifyDefaultFieldValues();

  await waitFor(() => {
    expect(screen.queryByTestId('error-indicator')).not.toBeInTheDocument();
  });
});

// Doesn't work due to jsdom bug: https://github.com/jsdom/jsdom/issues/2898
test.skip('will not submit data if input validation fails', async () => {
  const user = userEvent.setup();

  await renderEditModal();

  const editButton = await screen.findByRole('button', { name: 'Edit' });

  await user.click(editButton);

  const nameField = screen.getByLabelText('Name:');

  await user.clear(nameField);
  await user.type(nameField, 'X');

  const updateEndpointFunc = jest.fn();

  server.use(
    rest.put(`${API_URL}/pet/:petId`, async (_req, res, ctx) => {
      updateEndpointFunc();
      return res(ctx.json({}));
    })
  );

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(updateEndpointFunc).not.toBeCalled();

  await verifyEditMode();
});

describe('add mode', function () {
  test('error indicator is shown when the add request fails', async () => {
    const user = userEvent.setup();

    const waitHandle = new WaitHandle();

    await renderEditModal({
      registerHandlers: () => {
        server.use(
          rest.post(`${API_URL}/pet`, async (_req, res, ctx) => {
            await waitHandle.wait();
            return res(ctx.status(500));
          })
        );
      },
      addMode: true,
    });

    await verifyAddMode();

    const nameField = screen.getByLabelText('Name:');
    const kindField = screen.getByLabelText('Kind:');
    const ageField = screen.getByLabelText('Age:');
    const healthProblemsField = screen.getByLabelText('Health Problems:');
    const addedDateField = screen.getByLabelText('Added Date:');
    const notesField = screen.getByLabelText('Notes:');

    await user.clear(nameField);
    await user.type(nameField, 'test123');
    await user.selectOptions(kindField, ['Cat']);
    await user.clear(ageField);
    await user.type(ageField, '2');
    await user.click(healthProblemsField);
    await user.clear(addedDateField);
    await user.type(addedDateField, '2023-10-10');
    await user.clear(notesField);
    await user.type(notesField, 'Notes 123');

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    const loadingIndicator = await screen.findByTestId('loading-indicator');
    waitHandle.release();
    await waitForElementToBeRemoved(loadingIndicator);

    await waitFor(() => {
      expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
    });
  });

  test('transitions to display mode after successful save', async () => {
    const user = userEvent.setup();

    await renderEditModal({
      addMode: true,
    });

    await verifyAddMode();

    const nameField = screen.getByLabelText('Name:');
    const kindField = screen.getByLabelText('Kind:');
    const ageField = screen.getByLabelText('Age:');
    const healthProblemsField = screen.getByLabelText('Health Problems:');
    const addedDateField = screen.getByLabelText('Added Date:');
    const notesField = screen.getByLabelText('Notes:');

    await user.clear(nameField);
    await user.type(nameField, 'test123');
    await user.selectOptions(kindField, ['Cat']);
    await user.clear(ageField);
    await user.type(ageField, '2');
    await user.click(healthProblemsField);
    await user.clear(addedDateField);
    await user.type(addedDateField, '2023-10-10');
    await user.clear(notesField);
    await user.type(notesField, 'Notes 123');

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    await verifyDisplayMode();
  });

  test('cancel button calls onClose', async () => {
    const user = userEvent.setup();

    const { handleOnClose } = await renderEditModal({
      addMode: true,
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await user.click(cancelButton);

    expect(handleOnClose).toBeCalled();
  });
});
