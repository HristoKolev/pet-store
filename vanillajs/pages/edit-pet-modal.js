import { createModal } from '../shared/modal.js';
import { getPetState } from '../utils/store.js';
import { createLoadingIndicator } from '../shared/loading-indicator.js';
import { getPet, updatePet, createPet } from '../utils/api-client.js';
import { createErrorIndicator } from '../shared/error-indicator.js';
import { createDeletePetModal } from './delete-pet-modal.js';
import { loadPetListPage } from './pet-list-page.js';

const getCurrentDate = () => {
  const now = new Date();

  return (
    now.getFullYear().toString() +
    '-' +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    now.getDate().toString().padStart(2, '0')
  );
};

const fillForm = (form, pet) => {
  form.querySelector('#petName').value = pet.petName || '';
  form.querySelector('#kind').value = pet.kind || '';
  form.querySelector('#age').value = pet.age || '';
  form.querySelector('#healthProblems').checked = Boolean(pet.healthProblems);
  form.querySelector('#addedDate').value = pet.addedDate;
  form.querySelector('#notes').value = pet.notes || '';
};

const readForm = (form) => {
  return {
    petName: form.querySelector('#petName').value || '',
    kind: Number(form.querySelector('#kind').value || '0') || undefined,
    age: Number(form.querySelector('#age').value || '0') || undefined,
    healthProblems: form.querySelector('#healthProblems').checked,
    addedDate: form.querySelector('#addedDate').value || undefined,
    notes: form.querySelector('#notes').value || undefined,
  };
};

const viewPetTitle = 'View pet';
const editPetTitle = 'Edit pet';
const addPetTitle = 'Add pet';

const readonlyInputList = ['kind', 'addedDate'];

const lockFrom = (form) => {
  for (const input of form.querySelectorAll('.form-input')) {
    input.disabled = true;
  }

  form.querySelector('.save-button').disabled = true;
  form.querySelector('.cancel-button').disabled = true;
};

const unlockForm = (form, exceptionIds = []) => {
  for (const input of form.querySelectorAll('.form-input')) {
    input.disabled = exceptionIds.includes(input.id);
  }

  form.querySelector('.save-button').disabled = false;
  form.querySelector('.cancel-button').disabled = false;
};

const disableEditing = (form) => {
  for (const input of form.querySelectorAll('.form-input')) {
    input.disabled = true;
  }

  form.querySelector('.save-button').style.display = 'none';
  form.querySelector('.cancel-button').style.display = 'none';

  form.querySelector('.edit-button').style.display = '';
  form.querySelector('.delete-button').style.display = '';
  form.querySelector('.modal-cancel-button').style.display = '';

  form.querySelector('.form-title').textContent = viewPetTitle;
};

const enableEditing = (form, exceptionIds = []) => {
  for (const input of form.querySelectorAll('.form-input')) {
    input.disabled = exceptionIds.includes(input.id);
  }

  form.querySelector('.save-button').style.display = '';
  form.querySelector('.cancel-button').style.display = '';

  form.querySelector('.edit-button').style.display = 'none';
  form.querySelector('.delete-button').style.display = 'none';
  form.querySelector('.modal-cancel-button').style.display = 'none';

  form.querySelector('.form-title').textContent = editPetTitle;
};

export const createEditModal = (petId) => {
  const { petKinds } = getPetState();

  let onClose = () => {};

  const modalElement = createModal(
    `
      <form class="pet-form">
          <h1 class="form-title"></h1>
          
          <div class="fields">
              <label for="petName">
                  Name:
                  <input type="text" name="petName" id="petName" class="form-input" required minlength="2" maxlength="20">
              </label>
              
              <label for="kind">
                  Kind:
                  <select name="kind" id="kind" class="form-input" required>
                      <option value=""></option>
                      ${petKinds.map((kind) => `<option value="${kind.value}">${kind.displayName}</option>`).join('')}
                  </select>
              </label>
              
              <label for="age">
                  Age:
                  <input type="number" name="age" id="age" class="form-input" required min="0">
              </label>
              
              <label for="healthProblems">
                  Health Problems:
                  <input type="checkbox" name="healthProblems" id="healthProblems" class="form-input">
              </label>
              
              <label for="addedDate">
                  Added Date:
                  <input type="date" name="addedDate" id="addedDate" class="form-input" required>
              </label>
              
              <label for="notes" class="notes-label">
                  <span>Notes:</span>
                  <textarea name="notes" id="notes" cols="30" rows="10" class="form-input"></textarea>
              </label>
          </div>
          
          <div class="indicator-placeholder"></div>
          
          <div class="button-group">
              <button type="button" class="custom-button warningButton edit-button">Edit</button>
              <button type="button" class="custom-button errorButton delete-button">Delete</button>
              <button type="button" class="custom-button grayButton modal-cancel-button">Cancel</button>
              
              <button type="button" class="custom-button blueButton save-button">Save</button>
              <button type="button" class="custom-button grayButton cancel-button">Cancel</button>
          </div>
      </form>
    `,
    { onClose: () => onClose(), className: 'edit-pet-modal' }
  );

  const formElement = modalElement.querySelector('form');
  const modalBody = modalElement.querySelector('.modal-container');

  let existingPet;

  if (petId) {
    (async () => {
      const loadingIndicator = createLoadingIndicator('Loading pet');

      try {
        modalBody.appendChild(loadingIndicator);
        formElement.style.display = 'none';

        existingPet = await getPet(petId);

        fillForm(formElement, existingPet);
        disableEditing(formElement);

        loadingIndicator.remove();
        formElement.style.display = '';
      } catch (error) {
        console.error(error);

        loadingIndicator.remove();
        modalBody.appendChild(createErrorIndicator());
      } finally {
        onClose = () => modalElement.remove();
      }
    })().catch(console.error);
  } else {
    fillForm(formElement, { addedDate: getCurrentDate() });
    enableEditing(formElement);
    formElement.querySelector('.form-title').textContent = addPetTitle;
    onClose = () => modalElement.remove();
  }

  const indicatorWrapper = modalElement.querySelector('.indicator-placeholder');

  formElement.querySelector('.button-group').addEventListener('click', async (ev) => {
    if (ev.target.classList.contains('cancel-button')) {
      if (existingPet) {
        fillForm(formElement, existingPet);
        disableEditing(formElement);

        indicatorWrapper.innerHTML = '';
      } else {
        modalElement.remove();
      }
    } else if (ev.target.classList.contains('delete-button')) {
      document.body.appendChild(
        createDeletePetModal(existingPet, () => {
          modalElement.remove();
        })
      );
    } else if (ev.target.classList.contains('save-button')) {
      if (formElement.reportValidity()) {
        try {
          lockFrom(formElement);

          indicatorWrapper.replaceChildren(createLoadingIndicator('Saving pet'));
          onClose = () => {};

          const petData = readForm(formElement);

          if (existingPet) {
            existingPet = await updatePet(existingPet.petId, petData);
          } else {
            existingPet = await createPet(petData);
          }

          fillForm(formElement, existingPet);
          disableEditing(formElement);

          indicatorWrapper.innerHTML = '';

          await loadPetListPage();
        } catch (error) {
          console.error(error);

          indicatorWrapper.replaceChildren(createErrorIndicator('An error occurred while saving the pet.'));

          if (existingPet) {
            unlockForm(formElement, readonlyInputList);
          } else {
            unlockForm(formElement);
          }
        } finally {
          onClose = () => modalElement.remove();
        }
      }
    } else if (ev.target.classList.contains('modal-cancel-button')) {
      modalElement.remove();
    } else if (ev.target.classList.contains('edit-button')) {
      unlockForm(formElement, readonlyInputList);
      enableEditing(formElement, readonlyInputList);
    }
  });

  return modalElement;
};
