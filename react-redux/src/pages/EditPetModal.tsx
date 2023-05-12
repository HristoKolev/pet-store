import { ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react';

import { Modal } from '../shared/Modal';
import { Pet } from '../utils/server-data-model';
import { LoadingIndicator } from '../shared/LoadingIndicator';
import { ErrorIndicator } from '../shared/ErrorIndicator';
import { DeletePetModal } from './DeletePetModal';
import { reportError } from '../utils/reportError';
import { useAppDispatch, useAppSelector } from '../redux/createReduxStore';
import { getPetThunk, globalActions, globalSelector, savePetThunk, selectedPetSelector } from '../redux/globalSlice';

import './EditPetModal.css';

export interface EditPetModalProps {
  onClose?: () => void;

  petId: number | undefined;

  onSaved?: () => void;

  onDeleted?: () => void;
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

export const EditPetModal = memo(({ petId, onSaved, onDeleted, onClose }: EditPetModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { petKinds } = useAppSelector(globalSelector);
  const { selectedPet, selectedPetError, selectedPetLoading, savePetLoading, savePetError } =
    useAppSelector(selectedPetSelector);

  const [editingEnabled, setEditingEnabled] = useState<boolean>(false);

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
          const pet = (await dispatch(getPetThunk(petId)).unwrap()) as Pet;
          fillForm(pet);
        } catch (error) {
          reportError(error);
        }
      } else {
        fillForm({ addedDate: getCurrentDate() } as Pet);
        setEditingEnabled(true);
      }
    })().catch(reportError);
  }, [petId, fillForm, dispatch]);

  const handleOnCancelClick = useCallback(() => {
    if (selectedPet && editingEnabled) {
      fillForm(selectedPet);
      setEditingEnabled(false);
      dispatch(globalActions.discardSaveError());
    } else {
      onClose?.();
    }
  }, [selectedPet, fillForm, editingEnabled, onClose, dispatch]);

  const handleOnEditClick = useCallback(() => {
    setEditingEnabled(true);
  }, []);

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleOnSaveClick = useCallback(async () => {
    if (formRef.current?.reportValidity()) {
      try {
        const petData = readForm();
        const updatedPet = (await dispatch(savePetThunk(petData)).unwrap()) as Pet;
        fillForm(updatedPet);
        setEditingEnabled(false);
        onSaved?.();
      } catch (error) {
        reportError(error);
      }
    }
  }, [formRef, readForm, fillForm, onSaved, dispatch]);

  const [deletePet, setDeletePet] = useState<Pet | undefined>();
  const handleOnDeleteClick = useCallback(() => {
    setDeletePet(selectedPet);
  }, [selectedPet]);
  const handleOnDeleteModalClose = useCallback(() => {
    setDeletePet(undefined);
  }, []);

  const handleOnClose = useCallback(() => {
    if (!selectedPetLoading && !savePetLoading) {
      onClose?.();
    }
  }, [onClose, selectedPetLoading, savePetLoading]);

  const handleOnDeleted = useCallback(() => {
    handleOnClose();
    onDeleted?.();
  }, [onDeleted, handleOnClose]);

  return (
    <Modal
      className="edit-pet-modal"
      onClose={handleOnClose}
      ariaLabel={selectedPet ? 'View / Edit pet modal' : 'Add pet modal'}
    >
      {deletePet && <DeletePetModal pet={deletePet} onClose={handleOnDeleteModalClose} onDeleted={handleOnDeleted} />}
      {selectedPetLoading && <LoadingIndicator text="Loading pet" />}
      {selectedPetError && <ErrorIndicator />}
      {!selectedPetLoading && !selectedPetError && (
        <form className="pet-form" ref={formRef}>
          <h1 className="form-title">{getFormTitle(selectedPet, editingEnabled)}</h1>

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
                disabled={!editingEnabled || savePetLoading}
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
                disabled={!editingEnabled || Boolean(selectedPet) || savePetLoading}
              >
                <option value="" key=""></option>
                {petKinds?.map((kind) => (
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
                disabled={!editingEnabled || savePetLoading}
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
                disabled={!editingEnabled || savePetLoading}
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
                disabled={!editingEnabled || Boolean(selectedPet) || savePetLoading}
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
                disabled={!editingEnabled || savePetLoading}
              ></textarea>
            </label>
          </div>

          <div className="indicator-placeholder">
            {savePetLoading && <LoadingIndicator text="Saving pet" />}
            {savePetError && <ErrorIndicator errorMessage="An error occurred while saving the pet." />}
          </div>

          <div className="button-group">
            {!editingEnabled && selectedPet && (
              <>
                <button type="button" className="custom-button warningButton edit-button" onClick={handleOnEditClick}>
                  Edit
                </button>

                <button type="button" className="custom-button errorButton delete-button" onClick={handleOnDeleteClick}>
                  Delete
                </button>
              </>
            )}

            {editingEnabled && (
              <button
                type="button"
                className="custom-button blueButton save-button"
                onClick={handleOnSaveClick}
                disabled={savePetLoading}
              >
                Save
              </button>
            )}

            <button
              type="button"
              className="custom-button grayButton cancel-button"
              onClick={handleOnCancelClick}
              disabled={savePetLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
});
