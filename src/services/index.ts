import { mockServices } from './mockService';
import type { ApiServices } from './types';

// Centralized services layer — swap mockServices for a real API client later
const services: ApiServices = mockServices;

export default services;
export { mockServices } from './mockService';
export type { ApiServices, AuthService, InterviewService, CanvasService, NotesService } from './types';
