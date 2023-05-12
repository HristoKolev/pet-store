import { memo, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

import './Modal.css';

export interface ModalProps {
  children: ReactNode;

  className?: string;

  ariaLabel?: string;

  onClose?: () => void;
}

const ModalImpl = memo(({ children, onClose, className, ariaLabel }: ModalProps): JSX.Element => {
  const handleOnClose = useCallback(() => onClose?.(), [onClose]);

  return (
    <div className="modal open">
      <div className="modal-bg modal-exit" data-testid="modal-backdrop" onClick={handleOnClose}></div>
      <div className={`modal-container ${className || ''}`} role="dialog" aria-label={ariaLabel}>
        {children}
        <img
          role="button"
          src="./icons8-cancel-30.png"
          className="modal-close modal-exit"
          alt="Close modal"
          onClick={handleOnClose}
        />
      </div>
    </div>
  );
});

export const Modal = ({ children, ...rest }: ModalProps) =>
  createPortal(<ModalImpl {...rest}>{children}</ModalImpl>, document.body);
