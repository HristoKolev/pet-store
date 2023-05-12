import { createElement } from '../utils/html-helpers.js';

export const createLoadingIndicator = (text = 'Loading') =>
  createElement(`
    <div class="loading-indicator">
        <span class="loader">${text}</span>
    </div>
`);
