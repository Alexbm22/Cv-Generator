import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../Store/useAuthStore';
import { TokenClientData } from '../interfaces/auth_interface';
import { useErrorStore, useUserStore } from '../Store';
import { APIError } from '../interfaces/api_interface';

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  headers: {
    Authorization?: string;
    [key: string]: string | undefined;
  };
}

class ApiService {
  private client: AxiosInstance;
  private API_BASE_URL: string;
  
  private DEFAULT_TIMEOUT: number;
  private REFRESH_TOKEN_TIMEOUT: number;

  private refreshingPromise?: Promise<TokenClientData>;

  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_URL;

    this.DEFAULT_TIMEOUT = parseInt(import.meta.env.VITE_API_DEFAULT_TIMEOUT || '5000', 10);
    this.REFRESH_TOKEN_TIMEOUT = parseInt(import.meta.env.VITE_API_REFRESH_TOKEN_TIMEOUT || '5000', 10);

    this.client = axios.create({
      baseURL: this.API_BASE_URL,
      timeout: this.DEFAULT_TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      async (config) => {

        if (config.url?.includes('/auth/refresh_token')) {
          return config
        }

        if(!config.url?.includes('/protected')){
          return config;
        }

        const { token, isTokenExpired, clearAuth } = useAuthStore.getState();

        if(isTokenExpired() || !token){
          try {
            const newToken: TokenClientData =  await this.refreshTokenOnce().finally(() =>{
              this.refreshingPromise = undefined; // Reset the promise after refresh
            });

            if (typeof newToken.accessToken !== 'string' || !newToken) {
              // to implement logging error handling 
              console.error('Invalid token structure received from server');
            }

            const { setAuthState } = useAuthStore.getState();
            setAuthState(newToken);

            config.headers.Authorization = `Bearer ${newToken.accessToken}`;

          } catch (error) {
            const { clearUserData } = useUserStore.getState();
            clearAuth();
            clearUserData()
          }
        } else  {
          config.headers.Authorization = `Bearer ${token.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {

        if (!error.config) {
          return Promise.reject(error);
        }

        if(error.config.url?.includes('/login') || error.config.url?.includes('/signup')) {
          return Promise.reject(error);
        }

        const originalRequest = error.config as RetryableRequestConfig;

        // refreshing the tokens if there is an authorization error
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // to prevent infinite loops

          const { logout } = useAuthStore();
          const { handleAPIError } = useErrorStore.getState();

          try {
            const newToken = await this.refreshTokenOnce().finally(() =>{
              this.refreshingPromise = undefined; // Reset the promise after refresh
            });

            const { setAuthState } = useAuthStore.getState();
            setAuthState(newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken.accessToken}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            logout(); // Clear auth state on refresh failure
            handleAPIError(refreshError as APIError)
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenOnce(): Promise<TokenClientData> {
    if (!this.refreshingPromise) {
      this.refreshingPromise = this.refreshToken();
    }
    return this.refreshingPromise;
  }

  private async refreshToken(): Promise<TokenClientData> {
    try {
      // Create separate instance to avoid interceptor loops
      const refreshClient = axios.create({
        baseURL: this.API_BASE_URL,
        timeout: this.REFRESH_TOKEN_TIMEOUT,
        withCredentials: true,
      });

      const response = await refreshClient.post('/auth/refresh_token', {}, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Validate response structure
      if (!response.data?.token?.accessToken) {
        throw new Error('Invalid token structure received from server');
      }

      const newToken: TokenClientData = response.data.token;
      return newToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific axios errors
        throw new Error(`Failed to refresh token: ${error.message}`);
      }
        // Handle other errors
        throw new Error('An unexpected error occurred while refreshing token');
    }
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await this.client.get<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T, D = any>(url: string, data?: D): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T, D = any>(url: string, data?: D): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
