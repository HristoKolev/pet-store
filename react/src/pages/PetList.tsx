import { memo, MouseEvent, useCallback } from 'react';

import { PetListItem } from '../utils/server-data-model';

import './PetList.css';

interface PetsListProps {
  items: PetListItem[];

  onEdit: (petId: number) => void;

  onDelete: (petId: number) => void;

  petKindsByValue: Map<number, string>;
}

const formatDate = (date: string): string => {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const PetList = memo(({ items, onEdit, onDelete, petKindsByValue }: PetsListProps): JSX.Element => {
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
          {items.map((pet) => (
            <tr className="custom-table-row" key={pet.petId}>
              <th className="custom-table-first-cell" scope="row">
                {pet.petId}
              </th>
              <td className="custom-table-cell">{pet.petName}</td>
              <td className="custom-table-cell">{formatDate(pet.addedDate)}</td>
              <td className="custom-table-cell">{petKindsByValue.get(pet.kind)}</td>
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
      {!items.length && <div className="no-items-label">No items.</div>}
    </div>
  );
});
