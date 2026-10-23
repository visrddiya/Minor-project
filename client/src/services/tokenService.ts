import api from '../lib/axios';
import { QueueToken, PriorityLevel, TokenStatus } from '../types';

export interface IssueTokenPayload {
  branchId: string;
  departmentId: string;
  priority: PriorityLevel;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export const tokenService = {
  async issueKioskToken(payload: IssueTokenPayload): Promise<QueueToken | null> {
    try {
      const response = await api.post('/tokens/kiosk', payload);
      return response.data.data.token;
    } catch (error) {
      console.warn('[tokenService]: API endpoint offline, using local state token generator');
      return null;
    }
  },

  async callNextToken(counterId: string): Promise<QueueToken | null> {
    try {
      const response = await api.post('/tokens/call-next', { counterId });
      return response.data.data.token;
    } catch (error) {
      return null;
    }
  },

  async updateTokenStatus(tokenId: string, status: TokenStatus): Promise<QueueToken | null> {
    try {
      const response = await api.patch(`/tokens/${tokenId}/status`, { status });
      return response.data.data.token;
    } catch (error) {
      return null;
    }
  },

  async trackToken(tokenNumber: string): Promise<{ token: QueueToken; positionAhead: number } | null> {
    try {
      const response = await api.get(`/tokens/track/${tokenNumber}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async getTokens(params?: { branchId?: string; departmentId?: string; status?: TokenStatus }): Promise<QueueToken[]> {
    try {
      const response = await api.get('/tokens', { params });
      return response.data.data.tokens;
    } catch (error) {
      return [];
    }
  },
};
