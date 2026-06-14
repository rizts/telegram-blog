export interface Post {
  id: number;
  telegramMessageId: number;
  channelUsername: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: 'photo' | 'video' | 'document' | null;
  forwardedFrom: string | null;
  publishedAt: string;
  createdAt: string;
  isSticky: boolean;
}

export interface PaginatedResponse {
  sticky: Post[];           // selalu ada, bisa array kosong
  data: Post[];             // regular posts dengan paginasi
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
