import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

// Chaves de armazenamento
const STORAGE_KEYS = {
  USER: '@MedicalApp:user',
  TOKEN: '@MedicalApp:token',
  REGISTERED_USERS: '@MedicalApp:registeredUsers', 
};



// Médicos mockados (DEPRECATED - usar authApiService.getAllDoctors())
const mockDoctors: User[] = [
  // Dados removidos - agora vêm da API
];

// Admin mockado (DEPRECATED - usar authApiService)
const mockAdmin: User = {
  id: 'admin',
  name: 'Administrador',
  email: 'admin@example.com',
  role: 'admin',
  image: '',
};


const API_URL = 'http://localhost:8080/api';

export const authService = {
  // Login via backend
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Email ou senha inválidos');
    }

    const data: AuthResponse = await response.json();

    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

    return data;
  },

  // Registro via backend
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro no registro');
    }

    return response.json();
  },

  // Logout
  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Recuperar usuário armazenado localmente
  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Buscar médicos (mantido apenas para compatibilidade)
  async getAllDoctors(): Promise<User[]> {
    // DEPRECATED: usar authApiService.getAllDoctors()
    return [];
  },

  // Buscar pacientes via backend
  async getPatients(): Promise<User[]> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    const response = await fetch(`${API_URL}/usuarios/pacientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Erro ao carregar pacientes');
    return response.json();
  },
};
