// Mirrors AssigneeSummary so `Avatar` can consume it directly.
export interface CommentAuthor {
  userId: string;
  name?: string;
  avatarInitials?: string;
  avatarUrl?: string;
}

// Matches CommentResponseDto — field names for the embedded author are
// unconfirmed against a live sample response, so callers must treat
// `author` defensively (optional chaining + fallbacks), same posture as
// `AssigneeSummary` in tasks.types.ts.
export interface ApiComment {
  id: string;
  taskId: string;
  authorId: string;
  author?: CommentAuthor;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  body: string;
}

export type UpdateCommentPayload = CreateCommentPayload;
