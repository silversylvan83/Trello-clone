import { http } from "./http";

export const createCard = (listId: string, title: string) =>
  http.post("/cards", { listId, title }).then((r) => r.data );

export const moveCard = (payload: { cardId: string; toListId: string; toIndex: number }) =>
  http.patch("/cards/move", payload).then((r) => r.data );
