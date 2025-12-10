import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

/**
 * Register Page
 * 
 * User registration page with:
 * - Name, email, and password inputs
 * - Password validation feedback
 * - Redirect to login on success
 */
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
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

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
    };
  };

  const passwordValidation = formData.password ? validatePassword(formData.password) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordValidation && !passwordValidation.isValid) {
      toast.error('Please fix password requirements');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      // Error is handled by API interceptor
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
              src="/src/assets/icon.svg" 
              alt="DocuNest" 
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Create account</h1>
          <p className="text-sm sm:text-base text-text-secondary">Start securing your documents</p>
        </div>

        {/* Register Card */}
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

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
                minLength={8}
                className="input-field"
                placeholder="••••••••"
              />
              
              {/* Password Requirements */}
              {passwordValidation && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={`flex items-center ${passwordValidation.hasMinLength ? 'text-green-400' : 'text-text-secondary'}`}>
                    <span className="mr-2">{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-400' : 'text-text-secondary'}`}>
                    <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-400' : 'text-text-secondary'}`}>
                    <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-400' : 'text-text-secondary'}`}>
                    <span className="mr-2">{passwordValidation.hasNumber ? '✓' : '○'}</span>
                    One number
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (passwordValidation && !passwordValidation.isValid)}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader size="sm" />
                  <span className="ml-2">Creating account...</span>
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-lavender hover:opacity-90 transition-opacity"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

