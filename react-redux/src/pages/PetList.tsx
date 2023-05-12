import { memo, MouseEvent, useCallback } from 'react';

import { useAppSelector } from '../redux/createReduxStore';
import { globalSelector } from '../redux/globalSlice';

import './PetList.css';

interface PetsListProps {
  onEdit: (petId: number) => void;

  onDelete: (petId: number) => void;
}

const formatDate = (date: string): string => {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const PetList = memo(({ onEdit, onDelete }: PetsListProps): JSX.Element => {
  const { petList, petKindsByValue } = useAppSelector(globalSelector);

  const handleOnDeleteClick = useCallback(
    (ev: MouseEvent) => {
      const button = ev.target as HTMLButtonElement;
      const petId = Number(button.getAttribute('data-pet-id'));
      onDelete?.(petId);
    },
    [onDelete]
  );

  const handleOnEditClick = useCallback(
    (ev: MouseEvent) => {
      const button = ev.target as HTMLButtonElement;
      const petId = Number(button.getAttribute('data-pet-id'));
      onEdit?.(petId);
    },
    [onEdit]
  );

  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead className="custom-table-header">
          <tr className="custom-table-header-row">
            <th className="custom-table-header-first-cell" scope="col">
              #
            </th>
            <th className="custom-table-header-cell" scope="col">
              Pet Name
            </th>
            <th className="custom-table-header-cell" scope="col">
              Added
            </th>
            <th className="custom-table-header-cell" scope="col">
              Kind
            </th>
            <th className="custom-table-header-cell edit-row-header" scope="col"></th>
            <th className="custom-table-header-cell delete-row-header" scope="col"></th>
          </tr>
        </thead>
        <tbody className="custom-table-body">
          {petList?.map((pet) => (
            <tr className="custom-table-row" key={pet.petId} aria-label="Pet">
              <th className="custom-table-first-cell" scope="row" data-testid="col_petId">
                {pet.petId}
              </th>
              <td className="custom-table-cell" data-testid="col_petName">
                {pet.petName}
              </td>
              <td className="custom-table-cell" data-testid="col_addedDate">
                {formatDate(pet.addedDate)}
              </td>
              <td className="custom-table-cell" data-testid="col_petKind">
                {petKindsByValue?.[pet.kind]?.displayName}
              </td>
              <td className="custom-table-cell">
                <button
                  className="custom-button warningButton edit-button"
                  data-pet-id={pet.petId}
                  onClick={handleOnEditClick}
                >
                  View / Edit
                </button>
              </td>
              <td className="custom-table-cell">
                <button
                  className="custom-button errorButton delete-button"
                  onClick={handleOnDeleteClick}
                  data-pet-id={pet.petId}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!petList?.length && <div className="no-items-label">No items.</div>}
    </div>
  );
});
