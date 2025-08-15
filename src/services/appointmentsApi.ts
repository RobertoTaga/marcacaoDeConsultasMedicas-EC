import { apiClient, API_ENDPOINTS } from './api';

interface ApiAppointment {
  id: number;
  dataHora: string;
  especialidade: string;
  usuarioId: number;
  medicoId: number;
  observacao: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'REALIZADA';
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  specialty: string;
  patientId: string;
  doctorId: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

export const appointmentsApiService = {
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const appointment = await apiClient.post<ApiAppointment>(
        API_ENDPOINTS.APPOINTMENTS,
        { ...data, status: 'AGENDADA' }
      );
      return this.mapApiAppointmentToAppointment(appointment);
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      throw new Error('Erro ao agendar consulta');
    }
  },

  mapApiAppointmentToAppointment(apiAppointment: ApiAppointment): Appointment {
    // Divide data e hora
    const dateTime = new Date(apiAppointment.dataHora);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().slice(0, 5);

    // Mapeia o status
    let status: Appointment['status'];
    switch (apiAppointment.status) {
      case 'AGENDADA': status = 'scheduled'; break;
      case 'CONFIRMADA': status = 'confirmed'; break;
      case 'CANCELADA': status = 'cancelled'; break;
      case 'REALIZADA': status = 'completed'; break;
      default: status = 'scheduled';
    }

    return {
      id: apiAppointment.id.toString(),
      date, time,
      specialty: apiAppointment.especialidade,
      patientId: apiAppointment.usuarioId.toString(),
      doctorId: apiAppointment.medicoId.toString(),
      notes: apiAppointment.observacao,
      status,
    };
  },
};