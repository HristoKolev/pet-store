import { memo } from 'react';

import './LoadingIndicator.css';

export interface LoadingIndicatorProps {
  text?: string;
}

export const LoadingIndicator = memo(({ text = 'Loading' }: LoadingIndicatorProps): JSX.Element => {
  return (
    <div className="loading-indicator" data-testid="loading-indicator">
      <span className="loader">{text}</span>
    </div>
  );
});
