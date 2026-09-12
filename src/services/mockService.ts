import type {
  User,
  InterviewSession,
  SessionParticipant,
  Candidate,
  CanvasComponent,
  CanvasConnection,
  CanvasEvent,
  InterviewerNote,
  CanvasState,
  ComponentType,
} from '@/types';
import type {
  AuthService,
  InterviewService,
  CanvasService,
  NotesService,
  ApiServices,
} from './types';
import {
  mockUsers,
  mockSessions,
  mockCandidates,
  mockParticipants,
  mockComponents,
  mockConnections,
  mockEvents,
  mockNotes,
} from './mockData';

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

function genToken(): string {
  return `tok-${Math.random().toString(36).substring(2, 12)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// In-memory mutable copies so mock mutations persist during a session
const users: User[] = [...mockUsers];
const sessions: InterviewSession[] = [...mockSessions];
const candidates: Candidate[] = [...mockCandidates];
const participants: SessionParticipant[] = [...mockParticipants];
const components: CanvasComponent[] = [...mockComponents];
const connections: CanvasConnection[] = [...mockConnections];
const events: CanvasEvent[] = [...mockEvents];
const notes: InterviewerNote[] = [...mockNotes];

let currentUser: User | null = null;

const authService: AuthService = {
  async register(name, email, _password) {
    await delay();
    const existing = users.find((u) => u.email === email);
    if (existing) throw new Error('Email already registered');
    const user: User = {
      id: genId('user'),
      name,
      email,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    users.push(user);
    currentUser = user;
    return user;
  },
  async login(email, _password) {
    await delay();
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    currentUser = user;
    return user;
  },
  async logout() {
    await delay(100);
    currentUser = null;
  },
  getCurrentUser() {
    return currentUser;
  },
};

const interviewService: InterviewService = {
  async createInterview(title) {
    await delay();
    const user = currentUser;
    if (!user) throw new Error('Not authenticated');
    const session: InterviewSession = {
      id: genId('session'),
      interviewer_id: user.id,
      title,
      status: 'CREATED',
      invite_token: genToken(),
      started_at: null,
      ended_at: null,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    sessions.push(session);
    return session;
  },
  async getInterviews() {
    await delay();
    const user = currentUser;
    if (!user) throw new Error('Not authenticated');
    return sessions.filter((s) => s.interviewer_id === user.id);
  },
  async getInterviewById(id) {
    await delay();
    return sessions.find((s) => s.id === id) ?? null;
  },
  async getInterviewByInviteToken(token) {
    await delay();
    return sessions.find((s) => s.invite_token === token) ?? null;
  },
  async endInterview(id) {
    await delay();
    const session = sessions.find((s) => s.id === id);
    if (!session) throw new Error('Interview not found');
    session.status = 'ENDED';
    session.ended_at = nowISO();
    session.updated_at = nowISO();
    return session;
  },
  async getCandidates(sessionId) {
    await delay();
    return participants.filter((p) => p.session_id === sessionId);
  },
  async approveCandidate(participantId) {
    await delay();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) throw new Error('Participant not found');
    participant.status = 'APPROVED';
    participant.joined_at = nowISO();
    const session = sessions.find((s) => s.id === participant.session_id);
    if (session && session.status === 'CANDIDATE_REQUESTED') {
      session.status = 'APPROVED';
      session.updated_at = nowISO();
    }
    return participant;
  },
  async rejectCandidate(participantId, _message) {
    await delay();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) throw new Error('Participant not found');
    participant.status = 'REJECTED';
    const session = sessions.find((s) => s.id === participant.session_id);
    if (session && session.status === 'CANDIDATE_REQUESTED') {
      session.status = 'REJECTED';
      session.updated_at = nowISO();
    }
    return participant;
  },
  async joinByToken(token, name, email) {
    await delay();
    const session = sessions.find((s) => s.invite_token === token);
    if (!session) throw new Error('Invalid invitation link');
    const candidate: Candidate = {
      id: genId('cand'),
      name,
      email: email ?? null,
      created_at: nowISO(),
    };
    candidates.push(candidate);
    const participant: SessionParticipant = {
      id: genId('part'),
      session_id: session.id,
      candidate_id: candidate.id,
      role: 'candidate',
      status: 'PENDING',
      joined_at: null,
      created_at: nowISO(),
      candidate,
    };
    participants.push(participant);
    if (session.status === 'CREATED') {
      session.status = 'CANDIDATE_REQUESTED';
      session.updated_at = nowISO();
    }
    return participant;
  },
  async getParticipantById(participantId) {
    await delay(100);
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return null;
    const session = sessions.find((s) => s.id === participant.session_id);
    if (!session) return null;
    return { participant, session };
  },
};

function recordEvent(
  sessionId: string,
  userId: string,
  action: CanvasEvent['action'],
  data: Record<string, unknown>
): CanvasEvent {
  const event: CanvasEvent = {
    id: genId('evt'),
    session_id: sessionId,
    user_id: userId,
    action,
    data,
    created_at: nowISO(),
  };
  events.push(event);
  return event;
}

const canvasService: CanvasService = {
  async getCanvasState(sessionId) {
    await delay();
    return {
      components: components.filter((c) => c.session_id === sessionId),
      connections: connections.filter((c) => c.session_id === sessionId),
    };
  },
  async addComponent(sessionId, type, label, x, y, userId) {
    await delay(100);
    const comp: CanvasComponent = {
      id: genId('comp'),
      session_id: sessionId,
      type,
      label,
      x,
      y,
      metadata: {},
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    components.push(comp);
    recordEvent(sessionId, userId, 'ADD_COMPONENT', {
      component_id: comp.id,
      type,
      label,
      x,
      y,
    });
    return comp;
  },
  async updateComponent(sessionId, componentId, updates, userId) {
    await delay(100);
    const comp = components.find(
      (c) => c.id === componentId && c.session_id === sessionId
    );
    if (!comp) throw new Error('Component not found');
    if (updates.label !== undefined) comp.label = updates.label;
    if (updates.metadata !== undefined) comp.metadata = updates.metadata;
    comp.updated_at = nowISO();
    recordEvent(sessionId, userId, 'UPDATE_COMPONENT', {
      component_id: comp.id,
      ...updates,
    });
    return comp;
  },
  async moveComponent(sessionId, componentId, x, y, userId) {
    await delay(50);
    const comp = components.find(
      (c) => c.id === componentId && c.session_id === sessionId
    );
    if (!comp) throw new Error('Component not found');
    comp.x = x;
    comp.y = y;
    comp.updated_at = nowISO();
    recordEvent(sessionId, userId, 'MOVE_COMPONENT', {
      component_id: comp.id,
      x,
      y,
    });
    return comp;
  },
  async deleteComponent(sessionId, componentId, userId) {
    await delay(100);
    const idx = components.findIndex(
      (c) => c.id === componentId && c.session_id === sessionId
    );
    if (idx === -1) return;
    components.splice(idx, 1);
    const connIdxs = connections
      .map((c, i) =>
        (c.source_component_id === componentId || c.target_component_id === componentId) &&
        c.session_id === sessionId
          ? i
          : -1
      )
      .filter((i) => i >= 0)
      .reverse();
    for (const i of connIdxs) connections.splice(i, 1);
    recordEvent(sessionId, userId, 'DELETE_COMPONENT', { component_id: componentId });
  },
  async createConnection(sessionId, sourceId, targetId, userId) {
    await delay(100);
    const conn: CanvasConnection = {
      id: genId('conn'),
      session_id: sessionId,
      source_component_id: sourceId,
      target_component_id: targetId,
      metadata: {},
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    connections.push(conn);
    recordEvent(sessionId, userId, 'CREATE_CONNECTION', {
      connection_id: conn.id,
      source_component_id: sourceId,
      target_component_id: targetId,
    });
    return conn;
  },
  async deleteConnection(sessionId, connectionId, userId) {
    await delay(100);
    const idx = connections.findIndex(
      (c) => c.id === connectionId && c.session_id === sessionId
    );
    if (idx === -1) return;
    connections.splice(idx, 1);
    recordEvent(sessionId, userId, 'DELETE_CONNECTION', { connection_id: connectionId });
  },
  async getEvents(sessionId) {
    await delay();
    return events.filter((e) => e.session_id === sessionId);
  },
};

const notesService: NotesService = {
  async getNotes(sessionId) {
    await delay();
    return notes.filter((n) => n.session_id === sessionId);
  },
  async createNote(sessionId, content) {
    await delay();
    const user = currentUser;
    if (!user) throw new Error('Not authenticated');
    const note: InterviewerNote = {
      id: genId('note'),
      session_id: sessionId,
      interviewer_id: user.id,
      content,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    notes.push(note);
    return note;
  },
  async updateNote(noteId, content) {
    await delay();
    const note = notes.find((n) => n.id === noteId);
    if (!note) throw new Error('Note not found');
    note.content = content;
    note.updated_at = nowISO();
    return note;
  },
  async deleteNote(noteId) {
    await delay();
    const idx = notes.findIndex((n) => n.id === noteId);
    if (idx !== -1) notes.splice(idx, 1);
  },
};

export const mockServices: ApiServices = {
  auth: authService,
  interviews: interviewService,
  canvas: canvasService,
  notes: notesService,
};
