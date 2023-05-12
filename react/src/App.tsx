import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { getPetKinds, getPetList } from './utils/api-client';
import { PetKind, PetListItem } from './utils/server-data-model';
import { ErrorIndicator } from './shared/ErrorIndicator';
import { LoadingIndicator } from './shared/LoadingIndicator';
import { DeletePetModal } from './pages/DeletePetModal';
import { EditPetModal } from './pages/EditPetModal';
import { PetList } from './pages/PetList';

import './App.css';

export const App = memo((): JSX.Element => {
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [petList, setPetList] = useState<PetListItem[] | undefined>();
  const [petKinds, setPetKinds] = useState<PetKind[] | undefined>();
  const [petKindsByValue, setPetKindsByValue] = useState<Map<number, string> | undefined>();
  const [petListById, setPetListById] = useState<Map<number, PetListItem> | undefined>();
  const petKindsFetchedRef = useRef<boolean>(false);

  const fetchListData = useCallback(async () => {
    setFetchError(false);
    setFetchLoading(true);

    try {
      const petListPromise = getPetList();

      if (!petKindsFetchedRef.current) {
        const kinds = await getPetKinds();
        const kindsByValue = new Map();
        for (const kind of kinds) {
          kindsByValue.set(kind.value, kind.displayName);
        }
        setPetKinds(kinds);
        setPetKindsByValue(kindsByValue);
        petKindsFetchedRef.current = true;
      }

      const petItems = await petListPromise;
      const listById = new Map();
      for (const pet of petItems) {
        listById.set(pet.petId, pet);
      }
      setPetList(petItems);
      setPetListById(listById);
    } catch (error) {
      console.error(error);

      setFetchError(true);
    } finally {
      setFetchLoading(false);
    }
  }, [petKindsFetchedRef]);

  useEffect(() => {
    fetchListData().catch(console.error);
  }, [fetchListData]);

  const [deletePet, setDeletePet] = useState<PetListItem | undefined>();
  const handleOnDeleteClick = useCallback(
    (petId: number) => setDeletePet(petListById?.get(petId) as PetListItem),
    [petListById]
  );
  const handleOnDeleteModalClose = useCallback(() => setDeletePet(undefined), []);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editPetId, setEditPetId] = useState<number | undefined>();
  const handleOnEditClick = useCallback((petId: number) => {
    setEditPetId(petId);
    setShowEditModal(true);
  }, []);
  const handleOnEditModalClose = useCallback(() => {
    setEditPetId(undefined);
    setShowEditModal(false);
  }, []);

  const handleOnAddClick = useCallback(() => {
    setEditPetId(undefined);
    setShowEditModal(true);
  }, []);

  return (
    <main>
      <div className="pet-list-page-header">
        <h2>Pet Store</h2>

        {petKinds && (
          <button className="custom-button success-button add-pet-button" onClick={handleOnAddClick}>
            Add Pet
          </button>
        )}
      </div>

      <hr />

      <div className="pet-list-page-content">
        {fetchError && <ErrorIndicator />}
        {fetchLoading && <LoadingIndicator />}

        {petList && petKindsByValue && petKinds && (
          <>
            {!fetchLoading && !fetchError && (
              <PetList
                items={petList}
                onEdit={handleOnEditClick}
                onDelete={handleOnDeleteClick}
                petKindsByValue={petKindsByValue}
              />
            )}

            {deletePet && (
              <DeletePetModal
                pet={deletePet}
                onClose={handleOnDeleteModalClose}
                onDeleted={fetchListData}
                petKindsByValue={petKindsByValue}
              />
            )}

            {showEditModal && (
              <EditPetModal
                petId={editPetId}
                onClose={handleOnEditModalClose}
                onSaved={fetchListData}
                onDeleted={fetchListData}
                petKindsByValue={petKindsByValue}
                petKinds={petKinds}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
});
