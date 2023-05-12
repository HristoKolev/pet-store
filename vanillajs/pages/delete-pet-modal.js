import { createModal } from '../shared/modal.js';
import { createLoadingIndicator } from '../shared/loading-indicator.js';
import { deletePet } from '../utils/api-client.js';
import { createErrorIndicator } from '../shared/error-indicator.js';
import { loadPetListPage } from './pet-list-page.js';
import { getPetState } from '../utils/store.js';

const lockButtons = (wrapper) => {
  wrapper.querySelector('.cancel-button').disabled = true;
  wrapper.querySelector('.confirm-button').disabled = true;
};

const unlockButtons = (wrapper) => {
  wrapper.querySelector('.cancel-button').disabled = false;
  wrapper.querySelector('.confirm-button').disabled = false;
};

export const createDeletePetModal = (pet, onDelete) => {
  const { petKindsByValue } = getPetState();

  let onClose = () => {};

  const modalElement = createModal(
    `
      <h1>Are you sure you want to delete this pet?</h1>

      <div>
          <div class="delete-pet-modal-list-item">PetId: ${pet.petId}</div>
          <div class="delete-pet-modal-list-item">Pet Name: ${pet.petName}</div>
          <div class="delete-pet-modal-list-item">Pet Kind: ${petKindsByValue.get(pet.kind)}</div>
      </div>
      
      <div class="indicator-placeholder"></div>
      
      <div class="button-group">
          <button class="custom-button errorButton confirm-button">Confirm</button>
          <button class="custom-button grayButton cancel-button">Cancel</button>
      </div>
    `,
    {
      onClose: () => onClose(),
      className: 'delete-pet-modal',
    }
  );

  onClose = () => modalElement.remove();

  modalElement.querySelector('.button-group').addEventListener('click', async (ev) => {
    if (ev.target.classList.contains('cancel-button')) {
      modalElement.remove();
    } else if (ev.target.classList.contains('confirm-button')) {
      const indicatorWrapper = modalElement.querySelector('.indicator-placeholder');

      lockButtons(modalElement);
      indicatorWrapper.replaceChildren(createLoadingIndicator('Deleting pet'));
      onClose = () => {};

      try {
        await deletePet(pet.petId);
        modalElement.remove();
        onDelete?.();
        await loadPetListPage();
      } catch (error) {
        console.error(error);

        indicatorWrapper.replaceChildren(createErrorIndicator('An error occurred while deleting the pet.'));
        unlockButtons(modalElement);
        onClose = () => modalElement.remove();
      }
    }
  });

  return modalElement;
};
