import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Divider,
  InputAdornment,
  IconButton,
  Link,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Linkedin, Github } from "lucide-react";
import { login } from "../api/auth.api";
import { Link as RouterLink, useNavigate } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const nav = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // --- Validation ---
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    return undefined;
  };

  const validateField = (field: keyof FormData, value: string) => {
    let error: string | undefined;
    switch (field) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const isFormValid = (): boolean => {
    return (
      formData.email !== "" &&
      formData.password !== "" &&
      !errors.email &&
      !errors.password &&
      validateEmail(formData.email) === undefined &&
      validatePassword(formData.password) === undefined
    );
  };

  // --- Handlers ---
  const handleChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "rememberMe" ? event.target.checked : event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field] && field !== "rememberMe") {
        validateField(field, value as string);
      }
    };

  const handleBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field !== "rememberMe") validateField(field, formData[field] as string);
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const newErrors: FormErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((x) => x !== undefined);
    if (hasErrors) return;

    setIsLoading(true);
    try {
      const data = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      sessionStorage.setItem("token", data.token);

      setSnackbar({
        open: true,
        message: "Login successful! Welcome back.",
        severity: "success",
      });

      // ✅ replace prevents going back to /login
      nav("/boards", { replace: true });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Login failed";

      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Optional (still stubbed — you can wire these later)
  const handleSocialLogin = (provider: string) => {
    setSnackbar({
      open: true,
      message: `${provider} login not wired yet.`,
      severity: "error",
    });
  };

  const handleForgotPassword = () => {
    setSnackbar({
      open: true,
      message: "Forgot password flow not wired yet.",
      severity: "error",
    });
  };

  return (
    <>
      <Container maxWidth="sm">
        <Card elevation={2} sx={{ maxWidth: 480, mx: "auto", borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h5" component="h1" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue to your account
              </Typography>
            </Box>

            {/* Social Login Buttons */}
            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Linkedin size={20} />}
                onClick={() => handleSocialLogin("Google")}
                sx={{ mb: 1.5, textTransform: "none" }}
              >
                Continue with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Github size={20} />}
                onClick={() => handleSocialLogin("GitHub")}
                sx={{ textTransform: "none" }}
              >
                Continue with GitHub
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{ mb: 2.5 }}
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={formData.password}
                onChange={handleChange("password")}
                onBlur={handleBlur("password")}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{ mb: 2 }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={handleChange("rememberMe")}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={handleForgotPassword}
                  sx={{ textTransform: "none" }}
                >
                  Forgot password?
                </Button>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={!isFormValid() || isLoading}
                sx={{ mb: 2, textTransform: "none", py: 1.5 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={20}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{" "}
                  <Link component={RouterLink} to="/register">
                    Register
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
