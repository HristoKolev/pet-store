export const initializeState = () => {
  window.petState = {
    petList: undefined,
    petListById: undefined,
    petKinds: undefined,
    petKindsByValue: undefined,
  };
};

export const getPetState = () => {
  if (!window.petState) {
    throw new Error('Store not initialized.');
  }

  return window.petState;
};

export const setPetList = (petList) => {
  const state = getPetState();

  const map = new Map();
  for (const pet of petList) {
    map.set(pet.petId, pet);
  }

  state.petList = petList;
  state.petListById = map;
};

export const setPetKinds = (petKinds) => {
  const state = getPetState();

  const map = new Map();
  for (const kind of petKinds) {
    map.set(kind.value, kind.displayName);
  }

  state.petKinds = petKinds;
  state.petKindsByValue = map;
};
