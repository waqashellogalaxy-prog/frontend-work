import type {
  User,
  InterviewSession,
  Candidate,
  SessionParticipant,
  CanvasComponent,
  CanvasConnection,
  CanvasEvent,
  InterviewerNote,
  CanvasState,
  CanvasActionType,
  ComponentType,
} from '@/types';

export interface AuthService {
  register(name: string, email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}

export interface InterviewService {
  createInterview(title: string): Promise<InterviewSession>;
  getInterviews(): Promise<InterviewSession[]>;
  getInterviewById(id: string): Promise<InterviewSession | null>;
  getInterviewByInviteToken(token: string): Promise<InterviewSession | null>;
  endInterview(id: string): Promise<InterviewSession>;
  getCandidates(sessionId: string): Promise<SessionParticipant[]>;
  approveCandidate(participantId: string): Promise<SessionParticipant>;
  rejectCandidate(participantId: string, message?: string): Promise<SessionParticipant>;
  joinByToken(token: string, name: string, email?: string): Promise<SessionParticipant>;
  getParticipantById(participantId: string): Promise<{ participant: SessionParticipant; session: InterviewSession } | null>;
}

export interface CanvasService {
  getCanvasState(sessionId: string): Promise<CanvasState>;
  addComponent(
    sessionId: string,
    type: ComponentType,
    label: string,
    x: number,
    y: number,
    userId: string
  ): Promise<CanvasComponent>;
  updateComponent(
    sessionId: string,
    componentId: string,
    updates: Partial<Pick<CanvasComponent, 'label' | 'metadata'>>,
    userId: string
  ): Promise<CanvasComponent>;
  moveComponent(
    sessionId: string,
    componentId: string,
    x: number,
    y: number,
    userId: string
  ): Promise<CanvasComponent>;
  deleteComponent(sessionId: string, componentId: string, userId: string): Promise<void>;
  createConnection(
    sessionId: string,
    sourceId: string,
    targetId: string,
    userId: string
  ): Promise<CanvasConnection>;
  deleteConnection(sessionId: string, connectionId: string, userId: string): Promise<void>;
  getEvents(sessionId: string): Promise<CanvasEvent[]>;
}

export interface NotesService {
  getNotes(sessionId: string): Promise<InterviewerNote[]>;
  createNote(sessionId: string, content: string): Promise<InterviewerNote>;
  updateNote(noteId: string, content: string): Promise<InterviewerNote>;
  deleteNote(noteId: string): Promise<void>;
}

export interface ApiServices {
  auth: AuthService;
  interviews: InterviewService;
  canvas: CanvasService;
  notes: NotesService;
}
