import { StateCreator, StoreApi } from 'zustand'

type State = Record<string, any>

export function withFunctionCallExcept<T extends State>(
  callback: (api: StoreApi<T>) => void,
  excludedActionNames: string[]
) {
  return (createState: StateCreator<T>) =>
    (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>): T => {
      const originalState = createState(set, get, api)

      const wrappedState = Object.fromEntries(
        Object.entries(originalState).map(([key, value]) => {
          if (typeof value === 'function') {
            const wrappedFunction = (...args: any[]) => {
              const result = (value as Function)(...args)
              if (!excludedActionNames.includes(key)) {
                callback(api)
              }
              return result
            }
            return [key, wrappedFunction]
          }
          return [key, value]
        })
      ) as T

      return wrappedState
    }
}
