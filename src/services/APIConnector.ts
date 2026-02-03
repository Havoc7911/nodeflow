/**
 * APIConnector.ts
 * Service for making HTTP requests to external APIs
 * Uses axios for robust HTTP client functionality
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface APIConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  auth?: {
    username: string;
    password: string;
  } | {
    bearer: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
}

export class APIConnector {
  private client: AxiosInstance;
  private config: APIConfig;

  constructor(config: APIConfig = {}) {
    this.config = config;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000, // 30 seconds default
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // Add authentication if provided
    if (config.auth) {
      if ('bearer' in config.auth) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${config.auth.bearer}`;
      } else if ('username' in config.auth && 'password' in config.auth) {
        this.client.defaults.auth = {
          username: config.auth.username,
          password: config.auth.password
        };
      }
    }

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[APIConnector] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[APIConnector] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('[APIConnector] Response error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('[APIConnector] No response received');
        } else {
          console.error('[APIConnector] Request setup error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Make a custom request with full config
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return this.formatResponse(response);
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Update headers dynamically
   */
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  /**
   * Remove a header
   */
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }

  /**
   * Update authentication
   */
  setAuth(auth: APIConfig['auth']): void {
    if (!auth) {
      delete this.client.defaults.headers.common['Authorization'];
      delete this.client.defaults.auth;
      return;
    }

    if ('bearer' in auth) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${auth.bearer}`;
    } else if ('username' in auth && 'password' in auth) {
      this.client.defaults.auth = {
        username: auth.username,
        password: auth.password
      };
    }
  }

  /**
   * Format successful response
   */
  private formatResponse<T>(response: AxiosResponse<T>): APIResponse<T> {
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * Format error response
   */
  private formatError(error: any): APIResponse {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create a singleton instance for global API calls
 */
export const apiConnector = new APIConnector();

/**
 * Helper function to create a new API connector with custom config
 */
export function createAPIConnector(config: APIConfig): APIConnector {
  return new APIConnector(config);
}

export default APIConnector;