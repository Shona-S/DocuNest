import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Icon from '../assets/icon.svg';

/**
 * Login Page
 * 
 * User authentication page with:
 * - Email and password inputs
 * - Dark theme with centered card
 * - JWT token storage on success
 * - Redirect to dashboard after login
 */
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(formData);
      
      if (!response.data || !response.data.token) {
        toast.error('Invalid response from server');
        return;
      }
      
      // Store JWT token
      localStorage.setItem('token', response.data.token);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by API interceptor, but we can add extra logging
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-background py-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <img
              src={Icon}
              alt="DocuNest"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Welcome back</h1>
          <p className="text-sm sm:text-base text-text-secondary">Sign in to your DocuNest account</p>
        </div>

        {/* Login Card */}
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader size="sm" />
                  <span className="ml-2">Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-lavender hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

