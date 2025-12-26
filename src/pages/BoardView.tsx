import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getBoard } from "../api/board.api";
import { createList } from "../api/list.api";
import { createCard, moveCard } from "../api/card.api";
import {
  Alert,
  Box,
  Button,
  Card as MUICard,
  CardContent,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type List = { _id: string; title: string; order: number };
type Card = { _id: string; listId: string; title: string; description: string; order: number };
type Board = { _id: string; title: string };

export default function BoardView() {
  const { id } = useParams();
  const boardId = id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [listTitle, setListTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getBoard(boardId);
      setBoard(data.board);
      setLists(data.lists);
      setCards(data.cards);
      
    } 
    
    catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to load board");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const cardsByList = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const l of lists) map.set(l._id, []);
    for (const c of cards) {
      if (!map.has(c.listId)) map.set(c.listId, []);
      map.get(c.listId)!.push(c);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.order - b.order);
      map.set(k, arr);
    }
    return map;
  }, [lists, cards]);

  async function onAddList() {
    const title = listTitle.trim();
    if (!title) return;
    setErr("");
    try {
      await createList(boardId, title);
      setListTitle("");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to add list");
    }
  }

  async function onAddCard(listId: string) {
    const title = window.prompt("Card title?");
    if (!title?.trim()) return;
    setErr("");
    try {
      await createCard(listId, title.trim());
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to add card");
    }
  }

  const [dragCardId, setDragCardId] = useState<string | null>(null);

  function onDragStart(cardId: string) {
    setDragCardId(cardId);
  }

  async function onDrop(listId: string) {
    if (!dragCardId) return;

    const targetCards = cardsByList.get(listId) || [];
    const toIndex = targetCards.length;

    // optimistic UI
    setCards((prev) => {
      const moving = prev.find((c) => c._id === dragCardId);
      if (!moving) return prev;
      const rest = prev.filter((c) => c._id !== dragCardId);
      return [...rest, { ...moving, listId, order: toIndex }];
    });

    try {
      await moveCard({ cardId: dragCardId, toListId: listId, toIndex });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Move failed");
      await load();
    } finally {
      setDragCardId(null);
    }
  }

  if (!board && loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!board) return <Typography sx={{ py: 3 }}>No board found.</Typography>;

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {board.title}
      </Typography>

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {/* Add List */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          label="New list title"
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={onAddList} sx={{ whiteSpace: "nowrap" }}>
          Add list
        </Button>
      </Stack>

      {/* Lists Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 2,
          alignItems: "flex-start",
        }}
      >
        {lists.map((l) => {
          const listCards = cardsByList.get(l._id) || [];

          return (
            <Paper
              key={l._id}
              elevation={2}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(l._id)}
              sx={{
                minWidth: 300,
                maxWidth: 300,
                p: 1.5,
                borderRadius: 3,
                bgcolor: "grey.50",
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography fontWeight={700} noWrap title={l.title}>
                  {l.title}
                </Typography>

                <Tooltip title="Add card">
                  <IconButton size="small" onClick={() => onAddCard(l._id)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                {listCards.map((c) => (
                  <MUICard
                    key={c._id}
                    draggable
                    onDragStart={() => onDragStart(c._id)}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      cursor: "grab",
                      "&:active": { cursor: "grabbing" },
                      userSelect: "none",
                    }}
                    title="Drag me to another list"
                  >
                    <CardContent sx={{ py: 1.2, "&:last-child": { pb: 1.2 } }}>
                      <Typography fontWeight={650}>{c.title}</Typography>
                      {c.description ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {c.description}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </MUICard>
                ))}

                {listCards.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 0.5, py: 1 }}>
                    Drop a card here…
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
