import { StateCreator, StoreApi } from 'zustand'

type State = Record<string, any>

export type Middleware<T extends State> = {
  callback: (api: StoreApi<T>) => Promise<void> | void;
  ignoredKeys?: string[];
}

export const triggerOnChange = <T extends State>({ callback, ignoredKeys = [] }: Middleware<T>) => 
  (createState: StateCreator<T>) =>
  (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>): T => {

    // Flag to prevent recursive calls
    let isCallbackExecuting = false
    
    // Debounce mechanism to prevent excessive calls
    let timeoutId: NodeJS.Timeout | null = null
    
    const debouncedCallback = async () => {
      if (isCallbackExecuting) return
      
      isCallbackExecuting = true
      try {
        await callback(api)
      } catch (error) {
        console.error('Middleware callback error:', error)
      } finally {
        isCallbackExecuting = false
      }
    }

    return createState(
      async (args) => {
        const previousState = get();
        set(args);
        const currentState = get();

          // elimină cheile ignorate din comparație
        const filteredPrev = Object.fromEntries(
          Object.entries(previousState).filter(([key]) => !ignoredKeys.includes(key))
        );
        const filteredNext = Object.fromEntries(
          Object.entries(currentState).filter(([key]) => !ignoredKeys.includes(key))
        );

        const hasChanged = Object.keys(filteredPrev).some(
          (key) => JSON.stringify(filteredPrev[key]) !== JSON.stringify(filteredNext[key])
        );

        if (hasChanged) {
            if (timeoutId) {
              clearTimeout(timeoutId)
            }
            
            // Debounce the callback execution
            timeoutId = setTimeout(() => {
              debouncedCallback()
            }, 100) 
        }

      },
      get,
      api
    )
}