import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { Pet, PetKind, PetListItem } from '../utils/server-data-model';
import { createPet, deletePet, getPet, getPetKinds, getPetList, updatePet } from '../utils/api-client';
import { ReduxState } from './createReduxStore';
import { reportError } from '../utils/reportError';

interface GlobalState {
  petList: PetListItem[] | undefined;
  petListById: Record<number, PetListItem | undefined> | undefined;
  petKinds: PetKind[] | undefined;
  petKindsByValue: Record<number, PetKind | undefined> | undefined;
  isLoading: boolean;
  isError: boolean;

  deleteLoading: boolean;
  deleteError: boolean;

  selectedPet: Pet | undefined;
  selectedPetLoading: boolean;
  selectedPetError: boolean;

  savePetLoading: boolean;

  savePetError: boolean;
}

const initialState: GlobalState = {
  petList: undefined,
  petListById: undefined,
  petKinds: undefined,
  petKindsByValue: undefined,
  isError: false,
  isLoading: false,

  deleteError: false,
  deleteLoading: false,

  selectedPet: undefined,
  selectedPetError: false,
  selectedPetLoading: false,

  savePetError: false,
  savePetLoading: false,
};

interface FetchedPetsData {
  petList: PetListItem[];
  petKinds: PetKind[] | undefined;
}

export const fetchPetsData = createAsyncThunk<FetchedPetsData>('global/fetchPetsData', async (_, { getState }) => {
  const state = getState() as { global: GlobalState };
  const petKinds = state.global.petKinds;

  try {
    let petKindsPromise;

    if (!petKinds) {
      petKindsPromise = getPetKinds();
    }

    const petListPromise = getPetList();

    return {
      petList: await petListPromise,
      petKinds: await petKindsPromise,
    };
  } catch (error) {
    reportError(error);
    throw error;
  }
});

export const deletePetThunk = createAsyncThunk<unknown, number>('global/deletePetThunk', async (petId) => {
  try {
    await deletePet(petId);
  } catch (error) {
    reportError(error);
    throw error;
  }
});

export const getPetThunk = createAsyncThunk<Pet, number>('global/getPetThunk', async (petId) => {
  try {
    return await getPet(petId);
  } catch (error) {
    reportError(error);
    throw error;
  }
});

export const savePetThunk = createAsyncThunk<Pet, Omit<Pet, 'petId'>>(
  'global/savePetThunk',
  async (petData, { getState }) => {
    const state = getState() as { global: GlobalState };
    const selectedPet = state.global.selectedPet;

    try {
      let updatedPet;

      if (selectedPet) {
        updatedPet = await updatePet(selectedPet.petId, petData);
      } else {
        updatedPet = await createPet(petData);
      }

      return updatedPet;
    } catch (error) {
      reportError(error);
      throw error;
    }
  }
);

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    discardSaveError(state) {
      state.savePetError = false;
    },
    clearSelectedPet(state) {
      state.selectedPet = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPetsData.pending, (state) => {
      state.petKindsByValue = undefined;
      state.isLoading = true;
      state.isError = false;
    });

    builder.addCase(fetchPetsData.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    });

    builder.addCase(fetchPetsData.fulfilled, (state, action) => {
      const { petList, petKinds } = action.payload;

      state.isLoading = false;
      state.petList = petList;

      const petListById: Record<number, PetListItem | undefined> = {};
      for (const item of petList) {
        petListById[item.petId] = item;
      }

      state.petListById = petListById;

      if (petKinds) {
        state.petKinds = petKinds;

        const petKindsByValue: Record<number, PetKind | undefined> = {};
        for (const kind of petKinds) {
          petKindsByValue[kind.value] = kind;
        }

        state.petKindsByValue = petKindsByValue;
      }
    });

    builder.addCase(deletePetThunk.pending, (state) => {
      state.deleteError = false;
      state.deleteLoading = true;
    });

    builder.addCase(deletePetThunk.rejected, (state) => {
      state.deleteError = true;
      state.deleteLoading = false;
    });

    builder.addCase(deletePetThunk.fulfilled, (state) => {
      state.deleteError = false;
      state.deleteLoading = false;
    });

    builder.addCase(getPetThunk.pending, (state) => {
      state.selectedPet = undefined;
      state.selectedPetLoading = true;
      state.selectedPetError = false;
    });

    builder.addCase(getPetThunk.fulfilled, (state, action) => {
      state.selectedPet = action.payload;
      state.selectedPetLoading = false;
    });

    builder.addCase(getPetThunk.rejected, (state) => {
      state.selectedPetLoading = false;
      state.selectedPetError = true;
    });

    builder.addCase(savePetThunk.pending, (state) => {
      state.savePetLoading = true;
      state.savePetError = false;
    });

    builder.addCase(savePetThunk.rejected, (state) => {
      state.savePetLoading = false;
      state.savePetError = true;
    });

    builder.addCase(savePetThunk.fulfilled, (state, action) => {
      state.savePetLoading = false;
      state.selectedPet = action.payload;
    });
  },
});

export const globalActions = globalSlice.actions;

export const globalSelector = (state: ReduxState) => state[globalSlice.name];

export const deletePetStateSelector = createSelector(globalSelector, (state) => ({
  deleteError: state.deleteError,
  deleteLoading: state.deleteLoading,
}));

export const selectedPetSelector = createSelector(globalSelector, (state) => ({
  selectedPet: state.selectedPet,
  selectedPetLoading: state.selectedPetLoading,
  selectedPetError: state.selectedPetError,
  savePetLoading: state.savePetLoading,
  savePetError: state.savePetError,
}));
