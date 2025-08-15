import { apiClient, API_ENDPOINTS } from './api';

interface ApiSpecialty {
  id: number;
  nome: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export const specialtiesApiService = {
  async getAllSpecialties(): Promise<Specialty[]> {
    try {
      const specialties = await apiClient.get<ApiSpecialty[]>(API_ENDPOINTS.SPECIALTIES);
      return specialties.map(this.mapApiSpecialtyToSpecialty);
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      throw new Error('Erro ao carregar especialidades');
    }
  },

  mapApiSpecialtyToSpecialty(apiSpecialty: ApiSpecialty): Specialty {
    return {
      id: apiSpecialty.id.toString(),
      name: apiSpecialty.nome,
    };
  },
};