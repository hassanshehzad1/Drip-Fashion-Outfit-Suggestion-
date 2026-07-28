import * as SecureStore from 'expo-secure-store'

export const storage = {
  set: (key, value) => SecureStore.setItemAsync(key, value),
  get: (key) => SecureStore.getItemAsync(key),
  delete: (key) => SecureStore.deleteItemAsync(key),
  setJSON: (key, value) =>
    SecureStore.setItemAsync(key, JSON.stringify(value)),
  getJSON: async (key) => {
    const val = await SecureStore.getItemAsync(key)
    return val ? JSON.parse(val) : null
  },
}
