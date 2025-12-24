import React from "react";
import { Routes, Route, Navigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Boards from "./pages/Boards";
import BoardView from "./pages/BoardView";

function isAuthed() {
  return !!localStorage.getItem("token");
}

function Protected({ children }: { children: React.ReactNode }) {
  return isAuthed() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const authed = isAuthed();

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/boards"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
            }}
          >
            Trello Clone
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {authed ? (
            <Button
              color="inherit"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              Logout
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                color="inherit"
                sx={{
                  borderColor: "rgba(255,255,255,0.6)",
                  "&:hover": { borderColor: "rgba(255,255,255,0.9)" },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/boards"
            element={
              <Protected>
                <Boards />
              </Protected>
            }
          />
          <Route
            path="/boards/:id"
            element={
              <Protected>
                <BoardView />
              </Protected>
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}
