import { useState, useEffect } from 'react';
import { fetchFileBlob } from '../services/api';
import { toast } from 'react-toastify';
import Loader from './Loader';

/**
 * PreviewModal Component
 * 
 * Displays file preview in a modal:
 * - PDFs in iframe
 * - Images (jpg, jpeg, png, gif) in img tag
 * - Download button for all file types
 * - Close button and click-outside to close
 */
const PreviewModal = ({ file, isOpen, onClose, onDownload }) => {
  const [previewBlob, setPreviewBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setPreviewBlob(null);
      setPreviewUrl(null);
      return;
    }

    const loadPreview = async () => {
      try {
        setIsLoading(true);
        let pin = null;
        if (file.requiresPIN) {
          pin = window.prompt('Enter PIN to preview this file:');
          if (!pin) {
            onClose();
            return;
          }
        }
        const blob = await fetchFileBlob(file.id, pin);
        setPreviewBlob(blob);
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (error) {
        // Error is handled by API interceptor
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, file, onClose]);

  if (!isOpen || !file) {
    return null;
  }

  const fileType = file.originalFilename.split('.').pop().toLowerCase();
  const isPDF = fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
  const canPreview = isPDF || isImage;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

    const handleCloseClick = (e) => {
      e.stopPropagation();
      onClose();
    };

    const handleDownloadClick = (e) => {
      e.stopPropagation();
      // If modal already loaded the blob, download directly from it to avoid
      // relying on parent handler timing. Otherwise call parent handler.
      if (previewBlob) {
        try {
          const url = window.URL.createObjectURL(previewBlob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', file.originalFilename || 'file');
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (err) {
          // fallback to parent handler
          if (onDownload) onDownload();
        }
        return;
      }

      if (onDownload) onDownload();
    };

    return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
        <div className="bg-surface rounded-lg w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h2
                className="text-base sm:text-lg font-semibold text-text"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file.originalFilename}
              </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {canPreview ? 'Preview' : 'Preview not available for this file type'}
            </p>
          </div>
          <button
            onClick={handleCloseClick}
            className="flex-shrink-0 p-2 text-text-secondary hover:text-text hover:bg-border rounded-lg transition-colors relative z-20"
            title="Close"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-background/50 p-4 sm:p-6 relative">
          {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader />
                <p className="text-text-secondary">Loading preview...</p>
              </div>
          ) : canPreview && previewUrl ? (
              <div className="w-full h-full flex items-center justify-center relative">
                {isPDF ? (
                  <iframe
                    src={previewUrl}
                    title={file.originalFilename}
                    className="w-full h-full border-0 rounded bg-white relative z-10"
                    style={{ borderRadius: '6px' }}
                  />
                ) : isImage ? (
                  <img
                    src={previewUrl}
                    alt={file.originalFilename}
                    className="max-w-full max-h-full object-contain rounded relative z-10"
                  />
                ) : null}
                {/* Add an invisible layer to ensure header/footer receive clicks above iframe */}
                <div className="absolute inset-0 pointer-events-none z-0" />
              </div>
          ) : !canPreview ? (
            <div className="text-center py-12 px-4">
              <svg
                className="w-16 h-16 text-text-secondary mx-auto mb-4"
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
              <p className="text-text-secondary">
                Preview not available for {fileType.toUpperCase()} files
              </p>
              <p className="text-xs text-text-secondary mt-2">
                Use the download button to save this file
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 sm:p-6 border-t border-border flex-shrink-0 relative z-20">
          <button
              onClick={handleCloseClick}
            className="px-4 py-2 text-text-secondary hover:bg-border rounded-lg transition-colors text-sm font-medium"
              type="button"
          >
            Close
          </button>
          <button
              onClick={handleDownloadClick}
            className="px-4 py-2 bg-lavender text-white rounded-lg hover:bg-lavender/80 transition-colors text-sm font-medium flex items-center gap-2"
              type="button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
