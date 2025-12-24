import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f4f5f7", // Trello-like light gray
    },
  },
  shape: {
    borderRadius: 8,
  },
});
