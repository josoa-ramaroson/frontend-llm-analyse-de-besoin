export interface SendMessageRequest {
  text: string;
}

export interface SendMessageResponse {
  reply: string;
}

export interface UploadFileResponse {
  message: string;
  fileName?: string;
}

class ApiService {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Mock API call with delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reply: `Réponse simulée pour: "${request.text}"`,
        });
      }, 800);
    });
  }

  async uploadFile(file: File): Promise<UploadFileResponse> {
    // Mock file upload with delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'File uploaded successfully',
          fileName: file.name,
        });
      }, 600);
    });
  }
}

export const apiService = new ApiService();
