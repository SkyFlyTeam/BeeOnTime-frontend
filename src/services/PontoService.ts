import axios, { AxiosInstance } from "axios";

// Interface para tipagem dos dados de ponto (mesma usada no componente)
interface PointEntry {
  date: string;
  pointsMorning: string;
  pointsAfternoon: string;
  normalHours: string;
  extraHours: string;
  missingHours: string;
  nightShift: string;
}

// Interface para a resposta do backend (ajuste conforme necessário)
interface PointResponse {
  data: PointEntry[];
  total: number;
}

// Configuração do cliente HTTP
const api: AxiosInstance = axios.create({
  baseURL: "https://api.seu-backend.com", // Substitua pelo URL do seu backend
  timeout: 10000, // Tempo limite de 10 segundos para requisições
  headers: {
    "Content-Type": "application/json",
    // Adicione headers adicionais, como autenticação, se necessário
    // "Authorization": `Bearer ${token}`,
  },
});

const PontoService = {
  // Obter a lista de pontos (GET)
  async getPoints(userId: string, month: string, year: string): Promise<PointResponse> {
    try {
      const response = await api.get<PointResponse>("/points", {
        params: {
          userId,
          month,
          year,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pontos:", error);
      throw error;
    }
  },

  // Obter um ponto específico por ID (GET)
  async getPointById(pointId: string): Promise<PointEntry> {
    try {
      const response = await api.get<PointEntry>(`/points/${pointId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar ponto por ID:", error);
      throw error;
    }
  },

  // Criar um novo ponto (POST)
  async createPoint(pointData: Omit<PointEntry, "id">): Promise<PointEntry> {
    try {
      const response = await api.post<PointEntry>("/points", pointData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar ponto:", error);
      throw error;
    }
  },

  // Atualizar um ponto existente (PUT)
  async updatePoint(pointId: string, pointData: Partial<PointEntry>): Promise<PointEntry> {
    try {
      const response = await api.put<PointEntry>(`/points/${pointId}`, pointData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar ponto:", error);
      throw error;
    }
  },

  // Solicitar ajuste de ponto (POST) - Apenas para USER
  async requestAdjustment(pointId: string, adjustmentData: { reason: string }): Promise<void> {
    try {
      await api.post(`/points/${pointId}/adjustment`, adjustmentData);
    } catch (error) {
      console.error("Erro ao solicitar ajuste:", error);
      throw error;
    }
  },

  // Aprovar ou rejeitar ajuste (PUT) - Apenas para ADM
  async approveAdjustment(pointId: string, approved: boolean): Promise<void> {
    try {
      await api.put(`/points/${pointId}/adjustment/approve`, { approved });
    } catch (error) {
      console.error("Erro ao aprovar/rejeitar ajuste:", error);
      throw error;
    }
  },
};

export default PontoService;