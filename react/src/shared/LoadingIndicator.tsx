import './LoadingIndicator.css';
import { memo } from 'react';

export interface LoadingIndicatorProps {
  text?: string;
}

export const LoadingIndicator = memo(({ text = 'Loading' }: LoadingIndicatorProps): JSX.Element => {
  return (
    <div className="loading-indicator">
      <span className="loader">{text}</span>
    </div>
  );
});
