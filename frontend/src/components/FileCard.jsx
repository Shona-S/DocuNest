import { useState } from "react";
import { downloadFile, deleteFile } from "../services/api";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { usePreview } from '../context/PreviewContext';

const FileCard = ({ file, onDelete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { openPreview } = usePreview();

  const handlePreviewClick = () => openPreview(file);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      let pin = null;
      if (file.requiresPIN) {
        pin = window.prompt("Enter PIN to download this file:");
        if (!pin) {
          setIsDownloading(false);
          return;
        }
      }
      await downloadFile(file.id, file.originalFilename, pin);
      toast.success("File downloaded successfully");
    } catch {
      // handled by API interceptor
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${file.originalFilename}"?`
      )
    )
      return;
    try {
      setIsDeleting(true);
      await deleteFile(file.id);
      toast.success("File deleted successfully");
      onDelete?.(file.id);
    } catch {
      // handled by API interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getCategoryColor = (category) => {
    const colors = {
      Work: "bg-blue-500/20 text-blue-400",
      Education: "bg-green-500/20 text-green-400",
      ID: "bg-yellow-500/20 text-yellow-400",
      Certificate: "bg-purple-500/20 text-purple-400",
      Resume: "bg-pink-500/20 text-pink-400",
      Other: "bg-gray-500/20 text-gray-400",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="card card-hover p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center min-w-0">
            <button
              onClick={handlePreviewClick}
              disabled={isDownloading || isDeleting}
              className="text-base sm:text-lg font-medium text-lavender hover:underline mb-2 text-left disabled:opacity-50 cursor-pointer block"
              title={file.name || file.originalFilename}
              type="button"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '280px',
              }}
            >
              {file.name || file.originalFilename}
            </button>
          </div>

          {/* Category and Tags */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(
                file.category
              )}`}
            >
              {file.category}
            </span>
            {file.tags?.length > 0 &&
              file.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-md text-xs bg-border text-text-secondary"
                >
                  #{tag}
                </span>
              ))}
          </div>

          {/* File Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary">
            <span>{formatFileSize(file.fileSize)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{formatDate(file.uploadedAt)}</span>
            {file.requiresPIN && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-lavender">🔒 PIN Protected</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={isDownloading || isDeleting}
            className="p-2 text-lavender hover:bg-border rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Download"
          >
            {isDownloading ? (
              <Loader size="sm" />
            ) : (
              <svg
                className="w-5 h-5"
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
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={isDownloading || isDeleting}
            className="p-2 text-red-400 hover:bg-border rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Delete"
          >
            {isDeleting ? (
              <Loader size="sm" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Modal is handled by root-level PreviewProvider */}
    </div>
  );
};

export default FileCard;
