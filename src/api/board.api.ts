import { http } from "./http";

export type Board = { _id: string; title: string; updatedAt: string };

export const getBoards = () =>
  http.get<{ boards: Board[] }>("/boards").then((r) => r.data);

export const createBoard = (title: string) =>
  http.post<{ board: Board }>("/boards", { title }).then((r) => r.data);

export const getBoard = (boardId: string) =>
  http.get(`/boards/${boardId}`).then((r) => r.data );
