import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios'; // Imported axios

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly ragEngineUrl = 'http://localhost:8000/process_query'; // RAG engine URL

  async processMessage(message: string): Promise<any> {
    this.logger.log(`Received message: ${message}`);
    
    try {
      this.logger.log(`Forwarding message to RAG engine at ${this.ragEngineUrl}`);
      const response = await axios.post(this.ragEngineUrl, { query: message });
      this.logger.log(`Received response from RAG engine: ${JSON.stringify(response.data)}`);
      return response.data; // Return data from Python service
    } catch (error) {
      this.logger.error(`Error calling RAG engine: ${error.message}`, error.stack);
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`RAG engine responded with status: ${error.response.status} and data: ${JSON.stringify(error.response.data)}`);
        return { 
          error: 'Failed to get response from RAG engine.', 
          details: error.response.data 
        };
      }
      return { 
        error: 'Failed to get response from RAG engine. An unexpected error occurred.',
        details: error.message 
      };
    }
  }
}
