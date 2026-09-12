import { describe, it, expect, beforeEach } from 'vitest';
import { mockServices } from './mockService';
import { mockSessions, mockComponents, mockConnections } from './mockData';

describe('AuthService', () => {
  it('logs in with existing user', async () => {
    const user = await mockServices.auth.login('alice@example.com', 'password');
    expect(user.email).toBe('alice@example.com');
    expect(user.name).toBe('Alice Chen');
  });

  it('throws on invalid credentials', async () => {
    await expect(mockServices.auth.login('nobody@example.com', 'x')).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('registers a new user', async () => {
    const user = await mockServices.auth.register('Test User', 'test@example.com', 'pass');
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(mockServices.auth.getCurrentUser()).not.toBeNull();
  });

  it('throws on duplicate registration', async () => {
    await mockServices.auth.register('Dup', 'dup@example.com', 'pass');
    await expect(
      mockServices.auth.register('Dup2', 'dup@example.com', 'pass')
    ).rejects.toThrow('Email already registered');
  });

  it('logs out', async () => {
    await mockServices.auth.login('alice@example.com', 'pass');
    expect(mockServices.auth.getCurrentUser()).not.toBeNull();
    await mockServices.auth.logout();
    expect(mockServices.auth.getCurrentUser()).toBeNull();
  });
});

describe('InterviewService', () => {
  beforeEach(async () => {
    await mockServices.auth.login('alice@example.com', 'pass');
  });

  it('lists interviews for the logged-in user', async () => {
    const interviews = await mockServices.interviews.getInterviews();
    expect(interviews.length).toBeGreaterThanOrEqual(2);
    expect(interviews.every((i) => i.interviewer_id === 'user-001')).toBe(true);
  });

  it('gets interview by id', async () => {
    const interview = await mockServices.interviews.getInterviewById('session-001');
    expect(interview).not.toBeNull();
    expect(interview!.title).toBe('Design a URL Shortener');
  });

  it('returns null for non-existent interview', async () => {
    const interview = await mockServices.interviews.getInterviewById('no-such-id');
    expect(interview).toBeNull();
  });

  it('creates a new interview', async () => {
    const session = await mockServices.interviews.createInterview('Test Interview');
    expect(session.title).toBe('Test Interview');
    expect(session.status).toBe('CREATED');
    expect(session.invite_token).toBeTruthy();
  });

  it('finds interview by invite token', async () => {
    const session = await mockServices.interviews.getInterviewByInviteToken('tok-abc123');
    expect(session).not.toBeNull();
    expect(session!.id).toBe('session-001');
  });

  it('ends an interview', async () => {
    const session = await mockServices.interviews.createInterview('To End');
    const ended = await mockServices.interviews.endInterview(session.id);
    expect(ended.status).toBe('ENDED');
    expect(ended.ended_at).not.toBeNull();
  });

  it('gets candidates for a session', async () => {
    const candidates = await mockServices.interviews.getCandidates('session-001');
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].candidate?.name).toBe('John Smith');
  });

  it('approves a candidate', async () => {
    const participant = await mockServices.interviews.approveCandidate('part-002');
    expect(participant.status).toBe('APPROVED');
    expect(participant.joined_at).not.toBeNull();
  });

  it('rejects a candidate', async () => {
    const participant = await mockServices.interviews.rejectCandidate('part-001', 'Not ready');
    expect(participant.status).toBe('REJECTED');
  });

  it('joins via invite token', async () => {
    const participant = await mockServices.interviews.joinByToken(
      'tok-def456',
      'New Candidate',
      'new@example.com'
    );
    expect(participant.candidate?.name).toBe('New Candidate');
    expect(participant.status).toBe('PENDING');
  });
});

describe('CanvasService', () => {
  it('gets canvas state for a session', async () => {
    const state = await mockServices.canvas.getCanvasState('session-001');
    expect(state.components.length).toBeGreaterThanOrEqual(5);
    expect(state.connections.length).toBeGreaterThanOrEqual(4);
  });

  it('adds a component', async () => {
    const comp = await mockServices.canvas.addComponent(
      'session-001',
      'database',
      'New DB',
      100,
      200,
      'user-001'
    );
    expect(comp.type).toBe('database');
    expect(comp.label).toBe('New DB');
    expect(comp.x).toBe(100);
    expect(comp.y).toBe(200);
  });

  it('moves a component', async () => {
    const comp = await mockServices.canvas.moveComponent(
      'session-001',
      'comp-001',
      500,
      300,
      'user-001'
    );
    expect(comp.x).toBe(500);
    expect(comp.y).toBe(300);
  });

  it('updates a component label', async () => {
    const comp = await mockServices.canvas.updateComponent(
      'session-001',
      'comp-002',
      { label: 'Updated Label' },
      'user-001'
    );
    expect(comp.label).toBe('Updated Label');
  });

  it('deletes a component', async () => {
    await mockServices.canvas.deleteComponent('session-001', 'comp-005', 'user-001');
    const state = await mockServices.canvas.getCanvasState('session-001');
    expect(state.components.find((c) => c.id === 'comp-005')).toBeUndefined();
  });

  it('creates a connection', async () => {
    const conn = await mockServices.canvas.createConnection(
      'session-001',
      'comp-001',
      'comp-003',
      'user-001'
    );
    expect(conn.source_component_id).toBe('comp-001');
    expect(conn.target_component_id).toBe('comp-003');
  });

  it('deletes a connection', async () => {
    await mockServices.canvas.deleteConnection('session-001', 'conn-004', 'user-001');
    const state = await mockServices.canvas.getCanvasState('session-001');
    expect(state.connections.find((c) => c.id === 'conn-004')).toBeUndefined();
  });

  it('records events for canvas operations', async () => {
    await mockServices.canvas.addComponent('session-001', 'cache', 'Cache', 50, 50, 'user-001');
    const events = await mockServices.canvas.getEvents('session-001');
    const addEvents = events.filter((e) => e.action === 'ADD_COMPONENT');
    expect(addEvents.length).toBeGreaterThanOrEqual(1);
  expect(addEvents[addEvents.length - 1].data).toHaveProperty('component_id');
  });
});

describe('NotesService', () => {
  beforeEach(async () => {
    await mockServices.auth.login('alice@example.com', 'pass');
  });

  it('gets notes for a session', async () => {
    const notes = await mockServices.notes.getNotes('session-001');
    expect(notes.length).toBeGreaterThanOrEqual(2);
  });

  it('creates a note', async () => {
    const note = await mockServices.notes.createNote('session-001', 'Test note content');
    expect(note.content).toBe('Test note content');
    expect(note.session_id).toBe('session-001');
  });

  it('updates a note', async () => {
    const note = await mockServices.notes.createNote('session-001', 'Original');
    const updated = await mockServices.notes.updateNote(note.id, 'Updated content');
    expect(updated.content).toBe('Updated content');
  });

  it('deletes a note', async () => {
    const note = await mockServices.notes.createNote('session-001', 'To delete');
    await mockServices.notes.deleteNote(note.id);
    const notes = await mockServices.notes.getNotes('session-001');
    expect(notes.find((n) => n.id === note.id)).toBeUndefined();
  });
});
