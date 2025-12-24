import { http } from "./http";

export const createList = (boardId: string, title: string) =>
  http.post("/lists", { boardId, title }).then((r) => r.data );
