import { createElement } from '../utils/html-helpers.js';

export const createModal = (html, { onClose, className = '' }) => {
  const modalElement = createElement(`
        <div class="modal open">
            <div class="modal-bg modal-exit"></div>
            <div class="modal-container ${className}">
                ${html}
                <img src="resources/icons8-cancel-30.png" class="modal-close modal-exit" alt="Close modal">
            </div>
        </div>
    `);

  modalElement.addEventListener('click', (ev) => {
    if (ev.target.classList.contains('modal-exit')) {
      if (onClose) {
        onClose();
      } else {
        modalElement.remove();
      }
    }
  });

  return modalElement;
};
