import { describe, it, expect } from 'vitest';
import { parsePath } from '@/router';

describe('parsePath', () => {
  it('parses simple path', () => {
    const { segments, query } = parsePath('/dashboard');
    expect(segments).toEqual(['dashboard']);
    expect(query).toEqual({});
  });

  it('parses path with multiple segments', () => {
    const { segments } = parsePath('/lobby/session-001');
    expect(segments).toEqual(['lobby', 'session-001']);
  });

  it('parses query params', () => {
    const { segments, query } = parsePath('/room/session-001?role=interviewer');
    expect(segments).toEqual(['room', 'session-001']);
    expect(query).toEqual({ role: 'interviewer' });
  });

  it('parses multiple query params', () => {
    const { query } = parsePath('/room/s1?role=candidate&participant=part-001');
    expect(query).toEqual({ role: 'candidate', participant: 'part-001' });
  });

  it('handles root path', () => {
    const { segments } = parsePath('/');
    expect(segments).toEqual([]);
  });

  it('handles join path', () => {
    const { segments } = parsePath('/join/tok-abc123');
    expect(segments).toEqual(['join', 'tok-abc123']);
  });
});
