// frontend/src/store/types.ts

export type ID = string;

export type Label = {
  color: string;   // e.g. '#22c55e' or 'green'
  name: string;    // short label text
};

export type MemberRef = ID;   // user id

export type Card = {
  _id: ID;
  boardId: ID;
  listId: ID;
  title: string;
  desc?: string;
  labels?: Label[];
  members?: MemberRef[];
  order: number;              // sorting within a list
  createdAt?: string;
  updatedAt?: string;
};

export type List = {
  _id: ID;
  boardId: ID;
  title: string;
  order: number;              // sorting among lists
  createdAt?: string;
  updatedAt?: string;
};

export type Board = {
  _id: ID;
  title: string;
  members?: MemberRef[];
  bg?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Activity = {
  _id: ID;
  boardId: ID;
  type: string;               // e.g. 'create_card' | 'move_card'
  by?: { id: ID; name: string };
  meta?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};
