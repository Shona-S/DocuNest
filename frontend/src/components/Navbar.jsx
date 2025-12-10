import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import iconSvg from '../assets/icon.svg';
import { getCurrentUser } from '../services/api';

/**
 * Navbar Component
 * 
 * Top navigation bar with:
 * - DocuNest brand name in lavender
 * - Navigation links (Dashboard, Upload)
 * - Mobile hamburger menu
 * - Logout functionality
 * - Clean, minimal design
 */
const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCurrentUser();
        if (mounted) {
          setUser(res.data.user);
        }
      } catch (err) {
        // ignore, handled by interceptor
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <img 
              src={iconSvg} 
              alt="DocuNest" 
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <span className="text-lg sm:text-xl font-semibold text-lavender">
              DocuNest
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-text-secondary hover:text-lavender transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="text-text-secondary hover:text-lavender transition-colors duration-200"
            >
              Upload
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 text-text-secondary hover:text-lavender transition-colors duration-200"
            >
              <div className="w-7 h-7 rounded-full bg-lavender text-white flex items-center justify-center text-xs font-semibold">
                {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
              </div>
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-text-secondary hover:text-red-400 transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-text-secondary hover:text-lavender transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-text-secondary hover:text-lavender hover:bg-border rounded-lg transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-text-secondary hover:text-lavender hover:bg-border rounded-lg transition-colors duration-200"
            >
              Upload
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-text-secondary hover:text-lavender hover:bg-border rounded-lg transition-colors duration-200"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-4 py-2 text-text-secondary hover:text-red-400 hover:bg-border rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

