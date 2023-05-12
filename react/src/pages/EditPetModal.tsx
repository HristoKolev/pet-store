import { ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react';

import { Modal } from '../shared/Modal';
import { Pet, PetKind } from '../utils/server-data-model';
import { createPet, getPet, updatePet } from '../utils/api-client';
import { LoadingIndicator } from '../shared/LoadingIndicator';
import { ErrorIndicator } from '../shared/ErrorIndicator';
import { DeletePetModal } from './DeletePetModal';

import './EditPetModal.css';

export interface EditPetModalProps {
  onClose?: () => void;

  petId: number | undefined;

  onSaved?: () => void;

  onDeleted?: () => void;

  petKinds: PetKind[];

  petKindsByValue: Map<number, string>;
}

const getCurrentDate = (): string => {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    '-' +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    now.getDate().toString().padStart(2, '0')
  );
};

const getFormTitle = (existingPet: Pet | undefined, editMode: boolean): string => {
  if (existingPet && editMode) {
    return 'Edit pet';
  } else if (existingPet && !editMode) {
    return 'View pet';
  } else if (!existingPet && editMode) {
    return 'Add pet';
  } else {
    return '';
  }
};

export const EditPetModal = memo(
  ({ petId, onSaved, onDeleted, onClose, petKinds, petKindsByValue }: EditPetModalProps): JSX.Element => {
    const [editingEnabled, setEditingEnabled] = useState<boolean>(false);

    const [existingPetLoading, setExistingPetLoading] = useState<boolean>(false);
    const [existingPetError, setExistingPetError] = useState<boolean>(false);
    const [existingPet, setExistingPet] = useState<Pet | undefined>();

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<boolean>();

    const [petName, setPetName] = useState<string>('');
    const handleOnPetNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      setPetName(ev.target.value);
    }, []);
    const [kind, setKind] = useState<string>('');
    const handleOnKindChange = useCallback((ev: ChangeEvent<HTMLSelectElement>) => {
      setKind(ev.target.value);
    }, []);
    const [age, setAge] = useState<string>('');
    const handleOnAgeChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      setAge(ev.target.value);
    }, []);
    const [healthProblems, setHealthProblems] = useState<boolean>(false);
    const handleOnHealthProblemsChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      setHealthProblems(ev.target.checked);
    }, []);
    const [addedDate, setAddedDate] = useState<string>('');
    const handleOnAddedDateChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
      setAddedDate(ev.target.value);
    }, []);
    const [notes, setNotes] = useState<string>('');
    const handleOnNotesChange = useCallback((ev: ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(ev.target.value);
    }, []);

    const fillForm = useCallback((pet: Pet) => {
      setPetName(pet.petName || '');
      setKind((pet.kind || '').toString());
      setAge((pet.age || '').toString());
      setHealthProblems(Boolean(pet.healthProblems));
      setAddedDate(pet.addedDate || '');
      setNotes(pet.notes || '');
    }, []);

    const readForm = useCallback(
      () => ({
        petName: petName || '',
        kind: Number(kind || '0'),
        age: Number(age || '0'),
        healthProblems: healthProblems,
        addedDate: addedDate || '',
        notes: notes || undefined,
      }),
      [petName, kind, age, healthProblems, addedDate, notes]
    );

    useEffect(() => {
      void (async () => {
        if (petId) {
          try {
            setExistingPetError(false);
            setExistingPetLoading(true);

            const pet = await getPet(petId);
            setExistingPet(pet);
            fillForm(pet);
          } catch (error) {
            console.error(error);

            setExistingPetError(true);
          } finally {
            setExistingPetLoading(false);
          }
        } else {
          fillForm({ addedDate: getCurrentDate() } as Pet);
          setEditingEnabled(true);
        }
      })().catch(console.error);
    }, [petId, fillForm]);

    const handleOnCancelClick = useCallback(() => {
      if (existingPet && editingEnabled) {
        fillForm(existingPet);
        setEditingEnabled(false);
        setSubmitError(false);
      } else {
        onClose?.();
      }
    }, [existingPet, fillForm, editingEnabled, onClose]);

    const handleOnEditClick = useCallback(() => {
      setEditingEnabled(true);
    }, []);

    const formRef = useRef<HTMLFormElement | null>(null);

    const handleOnSaveClick = useCallback(async () => {
      if (formRef.current && formRef.current.reportValidity()) {
        try {
          setSubmitLoading(true);
          setSubmitError(false);

          const petData = readForm();

          let updatedPet;

          if (existingPet) {
            updatedPet = await updatePet(existingPet.petId, petData);
          } else {
            updatedPet = await createPet(petData);
          }

          setExistingPet(updatedPet);
          fillForm(updatedPet);
          setEditingEnabled(false);

          onSaved?.();
        } catch (error) {
          console.error(error);

          setSubmitError(true);
        } finally {
          setSubmitLoading(false);
        }
      }
    }, [formRef, readForm, fillForm, onSaved, existingPet]);

    const [deletePet, setDeletePet] = useState<Pet | undefined>();
    const handleOnDeleteClick = useCallback(() => {
      setDeletePet(existingPet);
    }, [existingPet]);
    const handleOnDeleteModalClose = useCallback(() => {
      setDeletePet(undefined);
    }, []);

    const handleOnClose = useCallback(() => {
      if (!existingPetLoading && !submitLoading) {
        onClose?.();
      }
    }, [onClose, existingPetLoading, submitLoading]);

    const handleOnDeleted = useCallback(() => {
      handleOnClose();
      onDeleted?.();
    }, [onDeleted, handleOnClose]);

    return (
      <Modal className="edit-pet-modal" onClose={handleOnClose}>
        {deletePet && (
          <DeletePetModal
            pet={deletePet}
            onClose={handleOnDeleteModalClose}
            onDeleted={handleOnDeleted}
            petKindsByValue={petKindsByValue}
          />
        )}
        {existingPetLoading && <LoadingIndicator text="Loading pet" />}
        {existingPetError && <ErrorIndicator />}
        {!existingPetLoading && !existingPetError && (
          <form className="pet-form" ref={formRef}>
            <h1 className="form-title">{getFormTitle(existingPet, editingEnabled)}</h1>

            <div className="fields">
              <label htmlFor="petName">
                Name:
                <input
                  type="text"
                  name="petName"
                  id="petName"
                  className="form-input"
                  required
                  minLength={2}
                  maxLength={20}
                  value={petName}
                  onChange={handleOnPetNameChange}
                  disabled={!editingEnabled || submitLoading}
                />
              </label>

              <label htmlFor="kind">
                Kind:
                <select
                  name="kind"
                  id="kind"
                  className="form-input"
                  required
                  value={kind}
                  onChange={handleOnKindChange}
                  disabled={!editingEnabled || Boolean(existingPet) || submitLoading}
                >
                  <option value="" key=""></option>
                  {petKinds.map((kind) => (
                    <option value={kind.value} key={kind.value}>
                      {kind.displayName}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="age">
                Age:
                <input
                  type="number"
                  name="age"
                  id="age"
                  className="form-input"
                  required
                  min="0"
                  value={age}
                  onChange={handleOnAgeChange}
                  disabled={!editingEnabled || submitLoading}
                />
              </label>

              <label htmlFor="healthProblems">
                Health Problems:
                <input
                  type="checkbox"
                  name="healthProblems"
                  id="healthProblems"
                  className="form-input"
                  checked={healthProblems}
                  onChange={handleOnHealthProblemsChange}
                  disabled={!editingEnabled || submitLoading}
                />
              </label>

              <label htmlFor="addedDate">
                Added Date:
                <input
                  type="date"
                  name="addedDate"
                  id="addedDate"
                  className="form-input"
                  required
                  value={addedDate}
                  onChange={handleOnAddedDateChange}
                  disabled={!editingEnabled || Boolean(existingPet) || submitLoading}
                />
              </label>

              <label htmlFor="notes" className="notes-label">
                <span>Notes:</span>
                <textarea
                  name="notes"
                  id="notes"
                  cols={30}
                  rows={10}
                  className="form-input"
                  value={notes}
                  onChange={handleOnNotesChange}
                  disabled={!editingEnabled || submitLoading}
                ></textarea>
              </label>
            </div>

            <div className="indicator-placeholder">
              {submitLoading && <LoadingIndicator text="Saving pet" />}
              {submitError && <ErrorIndicator errorMessage="An error occurred while saving the pet." />}
            </div>

            <div className="button-group">
              {!editingEnabled && existingPet && (
                <>
                  <button type="button" className="custom-button warningButton edit-button" onClick={handleOnEditClick}>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="custom-button errorButton delete-button"
                    onClick={handleOnDeleteClick}
                  >
                    Delete
                  </button>
                </>
              )}

              {editingEnabled && (
                <button
                  type="button"
                  className="custom-button blueButton save-button"
                  onClick={handleOnSaveClick}
                  disabled={submitLoading}
                >
                  Save
                </button>
              )}

              <button
                type="button"
                className="custom-button grayButton cancel-button"
                onClick={handleOnCancelClick}
                disabled={submitLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    );
  }
);
