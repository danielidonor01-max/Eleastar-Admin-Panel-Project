import { type StateStorage, createJSONStorage, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';



const userStorage: StateStorage = {
  setItem: (name, value) => {
    return sessionStorage.setItem(name, value);
  },
  getItem: (name) => {
    const value = sessionStorage.getItem(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return sessionStorage.removeItem(name);
  },
};

export const createPersistedStore = <T extends object>(
  name: string,
  store: StateCreator<T, [], []>
) => {
  return persist(store, {
    name,
    storage: createJSONStorage(() => userStorage),
  });
}; 