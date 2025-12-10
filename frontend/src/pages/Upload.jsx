import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

/**
 * Upload Page
 * 
 * File upload page with:
 * - File input with drag & drop support
 * - Category dropdown
 * - Tags input
 * - PIN protection toggle
 * - Upload progress bar
 */
const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    file: null,
    category: 'Other',
    tags: '',
    requiresPIN: false,
    displayName: '',
    pin: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const categories = ['Work', 'Education', 'ID', 'Certificate', 'Resume', 'Other'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const fileExt = '.' + formData.file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(formData.file.type) && !allowedExtensions.includes(fileExt)) {
      toast.error('Invalid file type. Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.');
      return;
    }

    // Validate file size (50MB)
    if (formData.file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', formData.tags);
      // Optional display name for user-friendly title
      if (formData.displayName && formData.displayName.trim()) {
        uploadFormData.append('name', formData.displayName.trim());
      }
      // Optional per-file PIN
      if (formData.requiresPIN && formData.pin) {
        uploadFormData.append('pin', formData.pin);
      }
      uploadFormData.append('requiresPIN', formData.requiresPIN);

      await uploadFile(uploadFormData, (progress) => {
        setUploadProgress(progress);
      });

      toast.success('File uploaded and encrypted successfully!');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by API interceptor
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Upload Document</h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Securely upload and encrypt your files
          </p>
        </div>

        {/* Upload Form */}
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                File
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? 'border-lavender bg-lavender/10'
                    : 'border-border hover:border-lavender/50'
                }`}
              >
                {formData.file ? (
                  <div className="space-y-2">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-lavender"
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
                    <p className="text-sm sm:text-base text-text font-medium break-words">{formData.file.name}</p>
                    <p className="text-text-secondary text-xs sm:text-sm">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, file: null })}
                      className="text-lavender hover:opacity-90 text-xs sm:text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-xs sm:text-sm text-text-secondary px-2">
                      Drag and drop a file here, or click to select
                    </p>
                    <label className="btn-primary inline-block cursor-pointer text-sm sm:text-base">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.docx"
                      />
                      Choose File
                    </label>
                    <p className="text-text-secondary text-xs mt-2">
                      PDF, PNG, JPG, JPEG, DOCX (max 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Display Name (optional) */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text mb-2">
                Display Name (optional)
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter a friendly name for this file"
              />
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-text mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input-field"
                placeholder="important, contract, personal"
              />
            </div>

            {/* PIN Protection Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresPIN"
                name="requiresPIN"
                checked={formData.requiresPIN}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border bg-surface text-lavender focus:ring-lavender"
              />
              <label htmlFor="requiresPIN" className="ml-2 text-sm text-text">
                Require PIN to access this file
              </label>
            </div>

            {/* PIN Input (shown when requiresPIN) */}
            {formData.requiresPIN && (
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-text mb-2">PIN (4-6 digits)</label>
                <input
                  type="text"
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter a 4-6 digit PIN"
                  maxLength={6}
                />
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Uploading...</span>
                  <span className="text-lavender">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-lavender h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!formData.file || isUploading}
              className="btn-primary w-full"
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <Loader size="sm" />
                  <span className="ml-2">Uploading...</span>
                </span>
              ) : (
                'Upload & Encrypt'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;

