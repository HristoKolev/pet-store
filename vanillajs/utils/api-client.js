const DEFAULT_FETCH_TIMEOUT = 30 * 1000; // 30 seconds.
const API_URL = 'http://localhost:5150';

const customFetch = async (input, init) => {
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

export const getPetList = async () => {
  const httpResponse = await customFetch(`${API_URL}/pet/all`);
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from GET /pet/all`);
  }
  return await httpResponse.json();
};

export const getPetKinds = async () => {
  const httpResponse = await customFetch(`${API_URL}/pet/kinds`);
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from GET /pet/kinds`);
  }
  return await httpResponse.json();
};

export const getPet = async (petId) => {
  const httpResponse = await customFetch(`${API_URL}/pet/${petId}`);
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from GET /pet/${petId}`);
  }
  return await httpResponse.json();
};

export const deletePet = async (petId) => {
  const httpResponse = await customFetch(`${API_URL}/pet/${petId}`, {
    method: 'DELETE',
  });
  if (!httpResponse.ok) {
    throw new Error(`Non 200 response received from DELETE /pet/${petId}`);
  }
  return await httpResponse.json();
};

export const updatePet = async (petId, petData) => {
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

export const createPet = async (petData) => {
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
