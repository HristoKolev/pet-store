import { memo, useCallback, useState } from 'react';

import { Modal } from '../shared/Modal';
import { PetListItem } from '../utils/server-data-model';
import { LoadingIndicator } from '../shared/LoadingIndicator';
import { deletePet } from '../utils/api-client';
import { ErrorIndicator } from '../shared/ErrorIndicator';

import './DeletePetModal.css';

export interface DeletePetModalProps {
  onClose?: () => void;

  pet: PetListItem;

  onDeleted?: () => void;

  petKindsByValue: Map<number, string>;
}

export const DeletePetModal = memo(({ onClose, onDeleted, pet, petKindsByValue }: DeletePetModalProps): JSX.Element => {
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);

  const handleOnClose = useCallback(() => {
    if (!submitLoading) {
      onClose?.();
    }
  }, [submitLoading, onClose]);

  const handleOnConfirmClick = useCallback(() => {
    void (async () => {
      setSubmitLoading(true);
      setSubmitError(false);

      try {
        await deletePet(pet.petId);
        onClose?.();
        onDeleted?.();
      } catch (error) {
        console.error(error);

        setSubmitError(true);
      } finally {
        setSubmitLoading(false);
      }
    })().catch(console.error);
  }, [onClose, onDeleted, pet.petId]);

  return (
    <Modal className="delete-pet-modal" onClose={handleOnClose}>
      <h1>Are you sure you want to delete this pet?</h1>

      <div>
        <div className="delete-pet-modal-list-item">PetId: {pet.petId}</div>
        <div className="delete-pet-modal-list-item">Pet Name: {pet.petName}</div>
        <div className="delete-pet-modal-list-item">Pet Kind: {petKindsByValue.get(pet.kind) || ''}</div>
      </div>

      <div className="indicator-placeholder">
        {submitLoading && <LoadingIndicator text="Deleting pet" />}
        {submitError && <ErrorIndicator errorMessage="An error occurred while deleting the pet." />}
      </div>

      <div className="button-group">
        <button
          className="custom-button errorButton confirm-button"
          onClick={handleOnConfirmClick}
          disabled={submitLoading}
        >
          Confirm
        </button>
        <button className="custom-button grayButton cancel-button" onClick={handleOnClose} disabled={submitLoading}>
          Cancel
        </button>
      </div>
    </Modal>
  );
});
