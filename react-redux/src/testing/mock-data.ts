let petIdState = 42;
const generateId = () => petIdState++;

export const mockPetList = [
  {
    petId: generateId(),
    petName: 'Gosho',
    age: 2,
    notes: 'White fur, very soft.',
    kind: 1,
    healthProblems: false,
    addedDate: '2022-10-31',
  },
  {
    petId: generateId(),
    petName: 'Pesho',
    age: 5,
    notes: undefined,
    kind: 2,
    healthProblems: false,
    addedDate: '2022-10-25',
  },
  {
    petId: generateId(),
    petName: 'Kenny',
    age: 1,
    notes: "Doesn't speak. Has the sniffles.",
    kind: 3,
    healthProblems: true,
    addedDate: '2022-10-27',
  },
];

export const mockPetKinds = [
  {
    displayName: 'Cat',
    value: 1,
  },
  {
    displayName: 'Dog',
    value: 2,
  },
  {
    displayName: 'Parrot',
    value: 3,
  },
];
