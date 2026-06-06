import { describe, it, expect } from 'vitest';
import { parseMessage } from '../src/utils/parser';

const mockMsg = (overrides = {}) => ({
  message_id: 123,
  date: 1700000000,
  chat: { id: -1001234567890, type: 'channel', username: 'testchannel' },
  text: 'Hello world',
  ...overrides,
});

describe('parseMessage', () => {
  it('parses text message correctly', () => {
    const result = parseMessage(mockMsg() as any, '@testchannel');
    expect(result.telegramMessageId).toBe(123);
    expect(result.content).toBe('Hello world');
    expect(result.mediaType).toBeNull();
    expect(result.channelUsername).toBe('testchannel');
  });

  it('parses photo message', () => {
    const msg = mockMsg({
      text: undefined,
      caption: 'Caption foto',
      photo: [{ file_id: 'abc123', file_unique_id: 'u1', width: 100, height: 100, file_size: 1000 }],
    });
    const result = parseMessage(msg as any, '@testchannel');
    expect(result.mediaType).toBe('photo');
    expect(result.mediaUrl).toBe('abc123');
    expect(result.content).toBe('Caption foto');
  });

  it('handles forwarded message', () => {
    const msg = mockMsg({
      forward_from_chat: { title: 'Source Channel', id: -999, type: 'channel' },
    });
    const result = parseMessage(msg as any, '@testchannel');
    expect(result.forwardedFrom).toBe('Source Channel');
  });

  it('converts unix timestamp to Date', () => {
    const result = parseMessage(mockMsg() as any, '@testchannel');
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(result.publishedAt.getTime()).toBe(1700000000 * 1000);
  });
});
