import { createElement } from '../utils/html-helpers.js';

const defaultErrorMessage = 'An error occurred while fetching your data.';
const defaultErrorSubMessage = 'If the error persists, please, contact your network administrator.';

export const createErrorIndicator = (errorMessage = defaultErrorMessage, errorSubMessage = defaultErrorSubMessage) =>
  createElement(`
    <div class="error-indicator">
        <div class="error-indicator-wrapper">
            <div class="error-indicator-row">
                ${errorMessage}
            </div>
            <div class="error-indicator-row">
                ${errorSubMessage}
            </div>
        </div>
    </div>
`);
