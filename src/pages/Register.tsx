import React, { useState } from 'react';
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
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Github, Linkedin } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register } from '../api/auth.api';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const nav = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return undefined;
  };

  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'agreeToTerms' ? (event.target ).checked : event.target.value;

    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      validateField(field, value as string);
    }
  };

  const handleBlur = (field: keyof FormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field !== 'agreeToTerms') {
      validateField(field, formData[field] as string);
    }
  };

  const validateField = (field: keyof FormData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        if (touched.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = (): boolean => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email !== '' &&
      formData.password !== '' &&
      formData.confirmPassword !== '' &&
      formData.agreeToTerms &&
      !errors.fullName &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword &&
      validateFullName(formData.fullName) === undefined &&
      validateEmail(formData.email) === undefined &&
      validatePassword(formData.password) === undefined &&
      validateConfirmPassword(formData.confirmPassword, formData.password) === undefined
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSubmitSuccess(false);

    // mark touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    });

    // validate all
    const newErrors: FormErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(v => v !== undefined);
    if (hasErrors || !formData.agreeToTerms) return;

    setLoading(true);
    try {
      const data = await register({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // adjust key if your API returns something else
      localStorage.setItem('token', data.token);

      setSubmitSuccess(true);
      nav('/boards');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`Sign up with ${provider}`);
  };

  return (
    // <Box
    //   sx={{
    //     minHeight: '100vh',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     bgcolor: 'grey.50',
    //     py: { xs: 2, sm: 4 },
    //   }}
    // >
      <Container maxWidth="sm">
        <Card elevation={2} sx={{ maxWidth: 480, mx: 'auto', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign up to get started with your account
              </Typography>
            </Box>

            {err && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {err}
              </Alert>
            )}

            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Account created successfully! Welcome aboard.
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Linkedin size={20} />}
                onClick={() => handleSocialSignUp('Google')}
                sx={{ mb: 1.5, textTransform: 'none' }}
              >
                Continue with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Github size={20} />}
                onClick={() => handleSocialSignUp('GitHub')}
                sx={{ textTransform: 'none' }}
              >
                Continue with GitHub
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
                sx={{ mb: 2.5 }}
                autoComplete="name"
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{ mb: 2.5 }}
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && Boolean(errors.password)}
                helperText={
                  touched.password && errors.password
                    ? errors.password
                    : 'Must be 8+ characters with uppercase, lowercase, and number'
                }
                sx={{ mb: 2.5 }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(s => !s)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                sx={{ mb: 2.5 }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(s => !s)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={handleChange('agreeToTerms')}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="#" underline="hover">
                      Terms & Conditions
                    </Link>
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={!isFormValid() || loading}
                sx={{ mb: 2, textTransform: 'none', py: 1.5 }}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" underline="hover">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    // </Box>
  );
}
