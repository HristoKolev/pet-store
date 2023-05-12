import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { RequestHandler, rest } from 'msw';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { createReduxStore, ReduxStoreType } from '../redux/createReduxStore';

import { API_URL } from '../utils/api-client';
import { mockPetKinds, mockPetList } from './mock-data';

type ExtendedRenderOptions = Omit<RenderOptions, 'queries'> & { store?: ReduxStoreType };

export const renderWithProviders = (ui: ReactElement, options?: ExtendedRenderOptions): RenderResult => {
  const store = options?.store || createReduxStore();
  let restOptions = undefined;
  if (options) {
    const { store, ...rest } = options;
    restOptions = rest;
  }
  return render(<Provider store={store}>{ui}</Provider>, restOptions);
};

export const defaultHandlers: RequestHandler[] = [
  rest.get(`${API_URL}/pet/all`, async (_req, res, ctx) =>
    res(
      ctx.json(
        mockPetList.map((pet) => ({
          petId: pet.petId,
          petName: pet.petName,
          addedDate: pet.addedDate,
          kind: pet.kind,
        }))
      )
    )
  ),
  rest.get(`${API_URL}/pet/kinds`, async (_req, res, ctx) => res(ctx.json(mockPetKinds))),
  rest.get(`${API_URL}/pet/:petId`, async (req, res, ctx) => {
    const petId = Number(req.params.petId);
    return res(ctx.json(mockPetList.find((x) => x.petId === petId)));
  }),
  rest.delete(`${API_URL}/pet/:petId`, async (req, res, ctx) => {
    const petId = Number(req.params.petId);
    return res(ctx.json(mockPetList.find((x) => x.petId === petId)));
  }),
  rest.put(`${API_URL}/pet/:petId`, async (req, res, ctx) => {
    const petId = Number(req.params.petId);
    const body = await req.json();
    return res(ctx.json({ ...body, petId }));
  }),
  rest.post(`${API_URL}/pet`, async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({ ...body, petId: 43 }));
  }),
];
