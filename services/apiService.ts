// lib/apiService.ts
import { ERole, Message } from "@/store/useChatStore";
import axios, { AxiosInstance, AxiosError, AxiosProgressEvent } from "axios";

export type TRequestResponse = {
  response: string,
  model_id: string,
  file_url: string,
  uid: string,
  role?: ERole
}

export interface SendMessageRequest {
  message: string;
  model_id?: string;
}

export interface SendMessageResponse {
  reply: string;
  model_id?: string;
}

export interface UploadFileResponse {
  message: string;
  fileName?: string;
  data?: any;
}

/** Erreur riche pour propager status + payload si présents */
export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  private axios: AxiosInstance;

  constructor() {
    const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    // Normaliser l'URL (supprime slash final)
    const baseURL = rawBase.replace(/\/+$/, "");

    this.axios = axios.create({
      baseURL,
      timeout: 900_000, // 900s timeout
      headers: {
        "Accept": "application/json",
      },
    });

    // Interceptor réponse pour logger/transformer si nécessaire
    this.axios.interceptors.response.use(
      (resp: any) => resp,
      (error: any) => {
        // Laisser la gestion d'erreur en place (sera capturée dans chaque méthode)
        return Promise.reject(error);
      }
    );
  }

  private handleAxiosError(err: unknown): never {
    if (axios.isAxiosError(err)) {
      const aErr = err as AxiosError<any>;
      const status = aErr.response?.status;
      const data = aErr.response?.data;

      // Extraire un message utile
      const message =
        (data && (data.error || data.message || JSON.stringify(data))) ||
        aErr.message ||
        "Erreur réseau";

      throw new ApiError(message, status, data);
    }

    if (err instanceof Error) {
      throw new ApiError(err.message);
    }

    throw new ApiError("Erreur inconnue lors de la requête");
  }

  /** Envoi d'un message texte */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const payload = {
        message: request.message,
        model_id: request.model_id,
      };

      const { data } = await this.axios.post<SendMessageResponse>("/v1/chat", payload, {
        headers: { "Content-Type": "application/json" },
      });

      return data;
    } catch (err) {
      this.handleAxiosError(err);
    }
  }

  /**
   * Upload d’un PDF + extraction automatique
   * onUploadProgress (optionnel) : callback pour suivre la progression (browser ProgressEvent)
   */
 async uploadFile(
  modelId: string,
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<UploadFileResponse> {
  try {
    const formData = new FormData();
    formData.append("model_id", modelId);
    formData.append("file", file);

    const { data } = await this.axios.post<any>("/chat/extract_requirements", formData, {
      headers: {},
      onUploadProgress, // <-- maintenant typé correctement
    });

    return {
      message: "Fichier envoyé avec succès",
      
      data,
    };
  } catch (err) {
    this.handleAxiosError(err);
  }
}


  /** Récupération des modèles */
  async getModels(): Promise<string[]> {
    try {
      const { data } = await this.axios.get<{ available_models: string[] }>("/chat/models");
      
      return data?.available_models ?? [];
    } catch (err) {
      this.handleAxiosError(err);
    }
  }

  async getChatHistory(): Promise<TRequestResponse[]> {
    try {
      const { data } = await this.axios.get<TRequestResponse[]>("/chat/history");
      console.log("message history data: ", data)
      return data;
    } catch (err) {
      this.handleAxiosError(err);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
