/**
 * Configuração base da API
 */

// URL base da API do backend
export const API_BASE_URL = 'http://localhost:8080';

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/usuarios/login',
  REGISTER: '/usuarios',
  CURRENT_USER: '/usuarios/me',
  
  // Usuários
  USERS: '/usuarios',
  DOCTORS: '/usuarios/medicos',
  
  // Especialidades
  SPECIALTIES: '/especialidades',
  
  // Consultas
  APPOINTMENTS: '/consultas',
} as const;

/**
 * Classe para fazer requisições HTTP à API
 */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // ... métodos PUT e DELETE similares
}

// Instância global do cliente da API
export const apiClient = new ApiClient();