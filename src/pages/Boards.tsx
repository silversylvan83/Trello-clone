import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Alert,
  Skeleton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createBoard, getBoards, type Board as ApiBoard } from "../api/board.api";

// If your API Board already matches { id, title, updatedAt } you can skip this.
// This keeps the UI consistent even if API uses _id or updated_at etc.
type BoardUI = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function Boards() {
  const nav = useNavigate();

  const [boards, setBoards] = useState<BoardUI[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Map API response -> UI shape (adjust if your backend fields differ)
  const normalizeBoards = (apiBoards: ApiBoard[] | any[]): BoardUI[] => {
    return (apiBoards || []).map((b: any) => ({
      id: b.id ?? b._id, // support both
      title: b.title ?? b.name ?? "",
      updatedAt: b.updatedAt ?? b.updated_at ?? new Date().toISOString(),
    }));
  };

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getBoards();
      setBoards(normalizeBoards(data.boards));
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to load boards");
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    setErr("");
    setCreating(true);
    try {
      const created = await createBoard(t);

      // Optimistic UI: add created board if returned, else reload.
      // Adjust based on what your createBoard returns.
      if (created?.board) {
        setBoards((prev) => [normalizeBoards([created.board])[0], ...prev]);
      } else {
        await load();
      }

      setTitle("");

      // Optional: navigate directly to the new board if backend returns id
      const newId = created?.board?.id ?? created?.board?._id;
      if (newId) nav(`/boards/${newId}`);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Failed to create board");
    } finally {
      setCreating(false);
    }
  }

  const handleBoardClick = (boardId: string) => {
    nav(`/boards/${boardId}`);
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const showEmpty = !loading && boards.length === 0;

  return (
    <>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Boards
      </Typography>

      {/* Create Board */}
      <Box component="form" onSubmit={onCreate} sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            variant="outlined"
            label="New board title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creating}
            sx={{ maxWidth: { sm: 400 } }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!title.trim() || creating}
            sx={{ textTransform: "none", minWidth: 120 }}
          >
            {creating ? (
              <>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </Stack>

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}
      </Box>

      {/* Loading */}
      {loading && (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Loaded */}
      {!loading && boards.length > 0 && (
        <Grid container spacing={2}>
          {boards.map((board) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { borderColor: "primary.main", boxShadow: 2 },
                }}
              >
                <CardActionArea onClick={() => handleBoardClick(board.id)} sx={{ height: "100%" }}>
                  <CardContent>
                    <Tooltip title={board.title} placement="top" arrow>
                      <Typography
                        variant="body1"
                        component="h2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 1,
                        }}
                      >
                        {board.title}
                      </Typography>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">
                      Updated: {formatDateTime(board.updatedAt)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty */}
      {showEmpty && (
        <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
          <FolderOpen size={64} strokeWidth={1} style={{ color: "rgba(0, 0, 0, 0.26)", marginBottom: 16 }} />
          <Typography variant="body2" color="text.secondary">
            No boards yet. Create one to get started.
          </Typography>
        </Box>
      )}
    </>
  );
}
