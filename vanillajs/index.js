import { loadPetListPage } from './pages/pet-list-page.js';
import { initializeState } from './utils/store.js';
import { createEditModal } from './pages/edit-pet-modal.js';
import { createElement } from './utils/html-helpers.js';

const createMainContainer = () => {
  const mainElement = createElement(`
        <main>
            <div class="pet-list-page-header">
                <h2>Pet Store</h2>
                <button class="custom-button success-button add-pet-button" style="display: none;">Add Pet</button>
            </div>
            <hr>
            <div class="pet-list-page-content"></div>
        </main>
    `);

  mainElement.querySelector('.add-pet-button').addEventListener('click', () => {
    document.body.appendChild(createEditModal());
  });

  return mainElement;
};

(async () => {
  initializeState();

  const mainContainer = createMainContainer();

  document.body.appendChild(mainContainer);

  await loadPetListPage(() => {
    mainContainer.querySelector('.add-pet-button').style.display = '';
  });
})().catch(console.error);
