import { memo } from 'react';

import './ErrorIndicator.css';

export interface ErrorIndicatorProps {
  errorMessage?: string;
  errorSubMessage?: string;
}

const defaultErrorMessage = 'An error occurred while fetching your data.';
const defaultErrorSubMessage = 'If the error persists, please, contact your network administrator.';

export const ErrorIndicator = memo(
  ({
    errorMessage = defaultErrorMessage,
    errorSubMessage = defaultErrorSubMessage,
  }: ErrorIndicatorProps): JSX.Element => {
    return (
      <div className="error-indicator" data-testid="error-indicator">
        <div className="error-indicator-wrapper">
          <div className="error-indicator-row">{errorMessage}</div>
          <div className="error-indicator-row">{errorSubMessage}</div>
        </div>
      </div>
    );
  }
);
