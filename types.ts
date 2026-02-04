
export enum ADRStatus {
  PROPOSED = 'proposed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  DEPRECATED = 'deprecated',
  SUPERSEDED = 'superseded'
}

export interface ADR {
  id: string;
  title: string;
  status: ADRStatus;
  context: string;
  decision: string;
  consequences: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author_email?: string;
}

export interface User {
  id: string;
  email: string;
}
