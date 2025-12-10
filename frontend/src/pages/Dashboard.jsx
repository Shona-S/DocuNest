import { useState, useEffect } from 'react';
import { getFiles, searchFiles } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FileCard from '../components/FileCard';
import Loader from '../components/Loader';

/**
 * Dashboard Page
 * 
 * Main page displaying:
 * - User's uploaded documents
 * - File cards with download/delete actions
 * - Category and tag filters
 * - Search functionality
 */
const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [filters]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await getFiles(filters);
      setFiles(response.data.documents || []);
    } catch (error) {
      // Error is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchFiles();
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchFiles({ q: searchQuery, ...filters });
      setFiles(response.data.documents || []);
    } catch (error) {
      // Error is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Work', 'Education', 'ID', 'Certificate', 'Resume', 'Other'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">My Documents</h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {files.length} {files.length === 1 ? 'document' : 'documents'}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="input-field flex-1 text-sm sm:text-base"
            />
            <button type="submit" className="btn-primary whitespace-nowrap text-sm sm:text-base">
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
            <span className="text-text-secondary text-xs sm:text-sm">Category:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilters({ ...filters, category: '' })}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                  filters.category === ''
                    ? 'bg-lavender text-background'
                    : 'bg-surface text-text-secondary hover:bg-border'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilters({ ...filters, category })}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                    filters.category === category
                      ? 'bg-lavender text-background'
                      : 'bg-surface text-text-secondary hover:bg-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Files Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-text-secondary mb-4">
              <svg
                className="w-16 h-16 mx-auto opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-text mb-2">No documents yet</h3>
            <p className="text-text-secondary mb-6">
              Upload your first document to get started
            </p>
            <a
              href="/upload"
              className="btn-primary inline-block"
            >
              Upload Document
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

