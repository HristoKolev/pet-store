export interface Pet {
  petId: number;
  petName: string;
  age: number;
  notes?: string | undefined;
  kind: number;
  healthProblems: boolean;
  addedDate: string;
}

export interface PetListItem {
  petId: number;
  petName: string;
  kind: number;
  addedDate: string;
}

export interface PetKind {
  displayName: string;
  value: number;
}
