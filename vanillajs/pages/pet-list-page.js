import { createLoadingIndicator } from '../shared/loading-indicator.js';
import { getPetKinds, getPetList } from '../utils/api-client.js';
import { createErrorIndicator } from '../shared/error-indicator.js';
import { createElement } from '../utils/html-helpers.js';
import { createDeletePetModal } from './delete-pet-modal.js';
import { createEditModal } from './edit-pet-modal.js';
import { getPetState, setPetKinds, setPetList } from '../utils/store.js';

const formatDate = (date) => {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const createPetsTable = (petList, petKindsByValue, petListById) => {
  const element = createElement(`
    <div class="table-wrapper">
        <table class="custom-table">
            <thead class="custom-table-header">
                <tr class="custom-table-header-row">
                    <th class="custom-table-header-first-cell" scope="col">#</th>
                    <th class="custom-table-header-cell" scope="col">Pet Name</th>
                    <th class="custom-table-header-cell" scope="col">Added</th>
                    <th class="custom-table-header-cell" scope="col">Kind</th>
                    <th class="custom-table-header-cell edit-row-header" scope="col"></th>
                    <th class="custom-table-header-cell delete-row-header" scope="col"></th>
                </tr>
            </thead>
            <tbody class="custom-table-body">
            ${petList
              .map(
                (pet) => `
                <tr class="custom-table-row">
                    <th class="custom-table-first-cell" scope="row">${pet.petId}</th>
                    <td class="custom-table-cell">${pet.petName}</td>
                    <td class="custom-table-cell">${formatDate(pet.addedDate)}</td>
                    <td class="custom-table-cell">${petKindsByValue.get(pet.kind)}</td>
                    <td class="custom-table-cell">
                        <button class="custom-button warningButton edit-button" data-pet-id="${
                          pet.petId
                        }">View / Edit</button>
                    </td>
                    <td class="custom-table-cell">
                        <button class="custom-button errorButton delete-button" data-pet-id="${
                          pet.petId
                        }">Delete</button>
                    </td>
                </tr>
            `
              )
              .join('')}
            </tbody>
        </table>
        
        ${!petList.length ? '<div class="no-items-label">No items.</div>' : ''}
    </div>
    `);

  element.querySelector('tbody').addEventListener('click', (ev) => {
    if (ev.target.classList.contains('delete-button')) {
      const petId = Number(ev.target.getAttribute('data-pet-id'));
      const pet = petListById.get(petId);

      document.body.appendChild(createDeletePetModal(pet));
    } else if (ev.target.classList.contains('edit-button')) {
      const petId = Number(ev.target.getAttribute('data-pet-id'));
      const pet = petListById.get(petId);

      document.body.appendChild(createEditModal(pet.petId));
    }
  });

  return element;
};

export const loadPetListPage = async (onDataLoad) => {
  const petState = getPetState();

  const wrapper = document.querySelector('.pet-list-page-content');

  wrapper.replaceChildren(createLoadingIndicator('Loading pets'));

  try {
    const petListPromise = getPetList();

    if (!petState.petKinds) {
      setPetKinds(await getPetKinds());
    }

    setPetList(await petListPromise);

    onDataLoad?.();

    wrapper.replaceChildren(createPetsTable(petState.petList, petState.petKindsByValue, petState.petListById));
  } catch (error) {
    console.error(error);

    wrapper.replaceChildren(createErrorIndicator());
  }
};
