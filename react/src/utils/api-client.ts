import { Pet, PetKind, PetListItem } from './server-data-model';

const DEFAULT_FETCH_TIMEOUT = 30 * 1000; // 30 seconds.
const API_URL = 'http://localhost:5150';

const customFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const abortController = new AbortController();
  const handle = setTimeout(() => abortController.abort(), DEFAULT_FETCH_TIMEOUT);

  try {
    return await fetch(input, {
      signal: abortController.signal,
      ...(init || {}),
    });
  } finally {
    clearTimeout(handle);
  }
};

export const getPetList = async (): Promise<PetListItem[]> => {
  const httpResponse = await customFetch(`${API_URL}/pet/all`);
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from GET /pet/all`);
  }
  return await httpResponse.json();
};

export const getPetKinds = async (): Promise<PetKind[]> => {
  const httpResponse = await customFetch(`${API_URL}/pet/kinds`);
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from GET /pet/kinds`);
  }
  return await httpResponse.json();
};

export const getPet = async (petId: number): Promise<Pet> => {
  const httpResponse = await customFetch(`${API_URL}/pet/${petId}`);
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from GET /pet/${petId}`);
  }
  return await httpResponse.json();
};

export const deletePet = async (petId: number): Promise<Pet> => {
  const httpResponse = await customFetch(`${API_URL}/pet/${petId}`, {
    method: 'DELETE',
  });
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from DELETE /pet/${petId}`);
  }
  return await httpResponse.json();
};

export const updatePet = async (petId: number, petData: Omit<Pet, 'petId'>): Promise<Pet> => {
  const httpResponse = await customFetch(`${API_URL}/pet/${petId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(petData),
  });
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from PUT /pet/${petId}`);
  }
  return await httpResponse.json();
};

export const createPet = async (petData: Omit<Pet, 'petId'>): Promise<Pet> => {
  const httpResponse = await customFetch(`${API_URL}/pet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(petData),
  });
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from POST /pet`);
  }
  return await httpResponse.json();
};
