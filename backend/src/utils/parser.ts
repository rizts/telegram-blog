import type { Message } from 'node-telegram-bot-api';
import type { NewPost } from '../db/schema';

export function parseMessage(msg: Message, channelUsername: string): NewPost {
  let mediaUrl: string | null = null;
  let mediaType: string | null = null;

  if (msg.photo) {
    const largest = msg.photo[msg.photo.length - 1];
    mediaUrl = largest.file_id;
    mediaType = 'photo';
  } else if (msg.video) {
    mediaUrl = msg.video.file_id;
    mediaType = 'video';
  } else if (msg.document) {
    mediaUrl = msg.document.file_id;
    mediaType = 'document';
  }

  return {
    telegramMessageId: msg.forward_from_message_id ?? msg.message_id,
    channelUsername: channelUsername.replace('@', ''),
    content: msg.text ?? msg.caption ?? null,
    mediaUrl,
    mediaType,
    forwardedFrom: msg.forward_from_chat?.title ?? null,
    publishedAt: msg.forward_date ? new Date(msg.forward_date * 1000) : new Date(msg.date * 1000),
  };
}
