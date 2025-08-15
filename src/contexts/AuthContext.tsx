import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApiService } from '../services/authApi';  // ← Serviço da API
import { apiClient } from '../services/api';
import { User, LoginCredentials, RegisterData, AuthContextData } from '../types/auth';

// Chaves de armazenamento
const STORAGE_KEYS = {
  USER: '@MedicalApp:user',
  TOKEN: '@MedicalApp:token',
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
    loadRegisteredUsers();
  }, []);

const loadStoredUser = async () => {
  try {
    // Carrega o token salvo
    const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    
    if (storedToken && storedUser) {
      // Configura o token no cliente da API  ← NOVO!
      apiClient.setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
    // Se houver erro, limpa os dados armazenados  ← NOVO!
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } finally {
    setLoading(false);
  }
};

  const loadRegisteredUsers = async () => {
    try {
      await authService.loadRegisteredUsers();
    } catch (error) {
      console.error('Erro ao carregar usuários registrados:', error);
    }
  };

const signIn = async (credentials: LoginCredentials) => {
  try {
    const response = await authApiService.signIn(credentials);  // ← Login real!
    setUser(response.user);
    
    // Salva os dados no AsyncStorage para persistência
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
  } catch (error) {
    throw error;
  }
};

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 