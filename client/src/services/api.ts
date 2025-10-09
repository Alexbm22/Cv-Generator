import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../Store/useAuthStore';
import { TokenClientData } from '../interfaces/auth';
import { useErrorStore } from '../Store';
import { APIError } from '../interfaces/api';
import { ErrorTypes } from '../interfaces/error';
import { AppError } from './Errors';
import { AuthService } from './auth';

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
      this.requestInterceptor,
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      this.responseErrorInterceptor
    );
      
  }

  private async requestInterceptor(config: InternalAxiosRequestConfig) {
    if (config.url?.includes('/auth/refresh_token')) 
      return config

    if(!config.url?.includes('/protected') && !config.url?.includes('/logout'))
      return config

    const { 
      token, 
      isTokenExpired, 
      setIsLoadingAuth, 
      setToken
     } = useAuthStore.getState();

    if(isTokenExpired() || !token){
      try {
        setIsLoadingAuth(true); // Set loading state
        const token =  await this.refreshTokenOnce()

        if (typeof token.accessToken !== 'string' || !token) {
          // to do: improve error handling 
          throw new Error('Invalid token structure received from server');
        }

        setToken(token);

        config.headers.Authorization = `Bearer ${token.accessToken}`;

      } catch (error) {
        this.handleAPIError(error as APIError);
        await AuthService.forceLogout();
        Promise.reject(error);
      }
      finally{
        setIsLoadingAuth(false); // Reset loading state
        this.refreshingPromise = undefined; // Reset the promise after refresh
      }
    } else  {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }

    return config;
  }

  private async responseErrorInterceptor(error: AxiosError) {
    if (!error.config) {
      this.handleAPIError(error as APIError)
      return Promise.reject(error);
    }

    if(error.config.url?.includes('/refresh_token') || error.config.url?.includes('/checkAuth')) {
      this.handleAPIError(error as APIError);
      useAuthStore.getState().clearAuthenticatedUser();
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig;

    // refreshing the tokens if there is an authorization error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // to prevent infinite loops

      const { 
        setIsLoadingAuth,
        setToken
      } = useAuthStore.getState();

      try {
        setIsLoadingAuth(true); // Set loading state

        const token = await this.refreshTokenOnce();

        if (typeof token.accessToken !== 'string' || !token) {
          throw new Error('Invalid token structure received from server');
        }

        setToken(token);

        originalRequest.headers.Authorization = `Bearer ${token.accessToken}`;

        return this.client(originalRequest);
      } catch (refreshError) {
        await AuthService.forceLogout();// Clear auth state on refresh failure
        this.handleAPIError(refreshError as APIError)
      }
      finally{
        setIsLoadingAuth(false); // Reset loading state
        this.refreshingPromise = undefined; // Reset the promise after refresh
      }
    }
    
    this.handleAPIError(error as APIError)
    return Promise.reject(error);
  }

  // Ensure only one token refresh request is in-flight at a time
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

      const response = await refreshClient.get('/auth/refresh_token');

      // Validate response structure
      if (!response.data?.token?.accessToken) {
        throw new Error('Invalid token structure received from server');
      }

      const newToken: TokenClientData = response.data;
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
  
  private handleAPIError (error: APIError) {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || 'An unexpected error occurred';
    const errType = error.response?.data?.errType || ErrorTypes.INTERNAL_ERR;
    const errors = error.response?.data?.errors;

    if(errors){
      errors.forEach((err) => {
        const errorObj = AppError.validation(err.message, err.param, err.formOrigin);
        useErrorStore.getState().addError(errorObj);
      })
    } else {
      const errorObj = new AppError(
        message,
        statusCode,
        errType
      )

      useErrorStore.getState().addError(errorObj);
    }
  
  }

  async get<T, R extends boolean = false>(
    url: string, 
    config?: AxiosRequestConfig<any>, 
    raw?: boolean
  ): Promise<R extends true ? AxiosResponse<T> : T>{
    const response = await this.client.get<T>(url, config);
    return (raw ? response : response.data) as any;
  }

  async post<T, D = any, R extends boolean = false>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig<any>, 
    raw?: boolean
  ): Promise<R extends true ? AxiosResponse<T> : T> {
    const response = await this.client.post<T>(url, data, config);
    return (raw ? response : response.data) as any;
  }

  async patch<T, D = any, R extends boolean = false>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig<any>, 
    raw?: boolean
  ): Promise<R extends true ? AxiosResponse<T> : T> {
    const response = await this.client.patch<T>(url, data, config);
    return (raw ? response : response.data) as any;
  }

  async put<T, D = any, R extends boolean = false>(
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig<any>, 
    raw?: boolean
  ): Promise<R extends true ? AxiosResponse<T> : T> {
    const response = await this.client.put<T>(url, data, config);
    return (raw ? response : response.data) as any;
  }

  async delete<T, R extends boolean = false>(
    url: string, 
    config?: AxiosRequestConfig<any>, 
    raw?: boolean
  ): Promise<R extends true ? AxiosResponse<T> : T> {
    const response = await this.client.delete<T>(url, config);
    return (raw ? response : response.data) as any;
  }
}

// Export singleton instance
export const apiService = new ApiService();
