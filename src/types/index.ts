export type UserRole = 'interviewer' | 'candidate';

export type InterviewStatus =
  | 'CREATED'
  | 'CANDIDATE_REQUESTED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'ENDED'
  | 'READ_ONLY'
  | 'REJECTED';

export type CandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ComponentType =
  | 'client'
  | 'server'
  | 'database'
  | 'cache'
  | 'queue'
  | 'load_balancer'
  | 'external_service';

export type CanvasActionType =
  | 'ADD_COMPONENT'
  | 'UPDATE_COMPONENT'
  | 'DELETE_COMPONENT'
  | 'MOVE_COMPONENT'
  | 'CREATE_CONNECTION'
  | 'UPDATE_CONNECTION'
  | 'DELETE_CONNECTION';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  interviewer_id: string;
  title: string;
  status: InterviewStatus;
  invite_token: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  candidate_id: string;
  role: UserRole;
  status: CandidateStatus;
  joined_at: string | null;
  created_at: string;
  candidate?: Candidate;
}

export interface CanvasComponent {
  id: string;
  session_id: string;
  type: ComponentType;
  label: string;
  x: number;
  y: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CanvasConnection {
  id: string;
  session_id: string;
  source_component_id: string;
  target_component_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CanvasEvent {
  id: string;
  session_id: string;
  user_id: string;
  action: CanvasActionType;
  data: Record<string, unknown>;
  created_at: string;
}

export interface InterviewerNote {
  id: string;
  session_id: string;
  interviewer_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasState {
  components: CanvasComponent[];
  connections: CanvasConnection[];
}

export interface CanvasEventData {
  type: CanvasActionType;
  user_id: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface TimerState {
  running: boolean;
  elapsed: number;
}
