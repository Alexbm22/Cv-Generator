import { StateCreator, StoreApi } from 'zustand'

type State = Record<string, any>

export function withFunctionCallExcept<T extends State>(
  callback: (api: StoreApi<T>) => Promise<void> | void,
  excludedActionNames: string[]
) {
  return (createState: StateCreator<T>) =>
    (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>): T => {
      const originalState = createState(set, get, api)
      
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

      const wrappedState = Object.fromEntries(
        Object.entries(originalState).map(([key, value]) => {
          if (typeof value === 'function') {
            const wrappedFunction = (...args: any[]) => {
              const result = (value as Function)(...args)
              
              if (!excludedActionNames.includes(key) && !isCallbackExecuting) {
                if (timeoutId) {
                  clearTimeout(timeoutId)
                }
                
                // Debounce the callback execution
                timeoutId = setTimeout(() => {
                  debouncedCallback()
                }, 100) 
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
