import api from '../lib/axios';
import { Branch, Department, ServiceCounter } from '../types';

export const branchService = {
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await api.get('/branches');
      return response.data.data.branches;
    } catch (error) {
      console.warn('[branchService]: Falling back to local state mock data');
      return [];
    }
  },

  async getBranchById(id: string): Promise<{ branch: Branch; departments: Department[]; counters: ServiceCounter[] } | null> {
    try {
      const response = await api.get(`/branches/${id}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async createBranch(branchData: Partial<Branch>): Promise<Branch | null> {
    try {
      const response = await api.post('/branches', branchData);
      return response.data.data.branch;
    } catch (error) {
      return null;
    }
  },
};
