import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { authApiService, ApiUser } from '../services/authApi';

// Chaves de armazenamento
const STORAGE_KEYS = {
  USER: '@MedicalApp:user',
  TOKEN: '@MedicalApp:token',
  REGISTERED_USERS: '@MedicalApp:registeredUsers',
};

// Admin mockado (DEPRECATED - usar authApiService)
const mockAdmin: User = {
  id: 'admin',
  name: 'Administrador',
  email: 'admin@example.com',
  role: 'admin',
  image: 'https://randomuser.me/api/portraits/men/3.jpg',
};

// Lista de usuários cadastrados (pacientes)
let registeredUsers: (User & { password: string })[] = [];

export const authService = {
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    if (credentials.email === mockAdmin.email && credentials.password === '123456') {
      return { user: mockAdmin, token: 'admin-token' };
    }

    // Verifica médicos via API (compatibilidade)
    const doctors = await this.getAllDoctors();
    const doctor = doctors.find(
      (d) => d.email === credentials.email && credentials.password === '123456'
    );
    if (doctor) return { user: doctor, token: `doctor-token-${doctor.id}` };

    const patient = registeredUsers.find((p) => p.email === credentials.email);
    if (patient && patient.password === credentials.password) {
      const { password, ...patientWithoutPassword } = patient;
      return { user: patientWithoutPassword, token: `patient-token-${patient.id}` };
    }

    throw new Error('Email ou senha inválidos');
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    if (
      (await this.getAllDoctors()).some((d) => d.email === data.email) ||
      mockAdmin.email === data.email ||
      registeredUsers.some((u) => u.email === data.email)
    ) {
      throw new Error('Email já está em uso');
    }

    const newPatient: User & { password: string } = {
      id: `patient-${registeredUsers.length + 1}`,
      name: data.name,
      email: data.email,
      role: 'patient',
      image: `https://randomuser.me/api/portraits/${
        registeredUsers.length % 2 === 0 ? 'men' : 'women'
      }/${registeredUsers.length + 1}.jpg`,
      password: data.password,
    };

    registeredUsers.push(newPatient);
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));

    const { password, ...patientWithoutPassword } = newPatient;
    return { user: patientWithoutPassword, token: `patient-token-${newPatient.id}` };
  },

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erro ao obter usuário armazenado:', error);
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    const doctors = await this.getAllDoctors();
    return [...doctors, ...registeredUsers];
  },

  // MÉTODOS REAIS DE MÉDICOS (API)
  async getAllDoctors(): Promise<User[]> {
    try {
      const doctors = await authApiService.getAllDoctors();
      return doctors.map(this.mapApiUserToUser);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
      return [];
    }
  },

  async getDoctorsBySpecialty(specialty: string): Promise<User[]> {
    try {
      const doctors = await authApiService.getDoctorsBySpecialty(specialty);
      return doctors.map(this.mapApiUserToUser);
    } catch (error) {
      console.error('Erro ao buscar médicos por especialidade:', error);
      return [];
    }
  },

  mapApiUserToUser(apiUser: ApiUser): User {
    let image: string;
    if (apiUser.tipo === 'ADMIN') {
      // Ícone SVG genérico para admin
      image =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aG10ZSIvPgo8cGF0aCBkPSJNNTAgNjVDMzUgNjUgMjUgNzUgMjUgODVWOTVINZVWODVDNzUgNzUgNjUgNjUgNTAgNjVaIiBmaWxsPSJ3aG10ZSIvPgo8L3N2Zz4K';
    } else {
      // Fotos aleatórias para médicos e pacientes
      image = `https://randomuser.me/api/portraits/${
        apiUser.id % 2 === 0 ? 'men' : 'women'
      }/${(apiUser.id % 10) + 1}.jpg`;
    }

    const baseUser = {
      id: apiUser.id,
      name: apiUser.nome,
      email: apiUser.email,
      image,
    };

    switch (apiUser.tipo) {
      case 'MEDICO':
        return { ...baseUser, role: 'doctor', specialty: apiUser.especialidade || 'Especialidade não informada' };
      case 'ADMIN':
        return { ...baseUser, role: 'admin' };
      case 'PACIENTE':
        return { ...baseUser, role: 'patient' };
      default:
        return { ...baseUser, role: 'patient' };
    }
  },

  async getPatients(): Promise<User[]> {
    return registeredUsers;
  },

  async loadRegisteredUsers(): Promise<void> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (usersJson) registeredUsers = JSON.parse(usersJson);
    } catch (error) {
      console.error('Erro ao carregar usuários registrados:', error);
    }
  }
}