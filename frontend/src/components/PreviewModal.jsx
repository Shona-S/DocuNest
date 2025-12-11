import { useState, useEffect } from "react";
import { fetchFileBlob } from "../services/api";
import Loader from "./Loader";

/**
 * PreviewModal
 * A stable version — closes cleanly, no reopening,
 * redirects using window.location.
 */
const PreviewModal = ({ file, isOpen, onClose, onDownload }) => {
  const [previewBlob, setPreviewBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!isOpen || !file) return;

    let cancelled = false;
    const loadPreview = async () => {
      try {
        setIsLoading(true);
        let pin = null;
        
        if (file.requiresPIN) {
          pin = window.prompt("Enter PIN to preview this file:", "");
          
          // User cancelled
          if (pin === null) {
            if (!cancelled) {
              handleClose();
            }
            return;
          }
          
          // PIN is empty
          if (!pin || pin.trim() === "") {
            if (!cancelled) {
              alert("PIN cannot be empty. Preview cancelled.");
              handleClose();
            }
            return;
          }
          
          console.log('[DEBUG] PIN entered, loading preview with PIN');
        }

        const blob = await fetchFileBlob(file.id, pin);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(url);
      } catch (error) {
        console.error('[ERROR] Preview failed:', error);
        if (!cancelled) {
          handleClose();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  /** Close modal without navigation */
  const handleClose = () => {
    // call parent close
    if (onClose) onClose();
    // cleanup local blob/url
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
  };

  /** ⬇️ Download handler */
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (previewBlob) {
      try {
        const url = URL.createObjectURL(previewBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.originalFilename || "file";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download error:", err);
      }
    } else {
      onDownload?.();
    }
    // do not auto-close the modal after download; let the user close it
  };

  const fileType = file.originalFilename.split(".").pop().toLowerCase();
  const isPDF = fileType === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileType);
  const canPreview = isPDF || isImage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#1b1622] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2535] bg-[#1b1622]/95 sticky top-0 z-20">
          <div className="flex-1 min-w-0">
              <h2
                className="text-white text-lg font-semibold truncate max-w-[240px] sm:max-w-[400px]"
                title={file.name || file.originalFilename}
              >
                {file.name || file.originalFilename}
              </h2>
            <p className="text-sm text-gray-400">
              {canPreview ? "Preview" : "No preview available"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2535] rounded-lg transition"
            title="Close"
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

        {/* Content */}
        <div className="flex-1 overflow-auto flex justify-center bg-[#110c18] p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader />
              <p className="text-gray-400">Loading preview...</p>
            </div>
          ) : canPreview && previewUrl ? (
            isPDF ? (
              <iframe
                src={previewUrl}
                title={file.originalFilename}
                className="w-full h-[80vh] border-0 rounded-lg bg-white shadow"
              />
            ) : (
              <img
                src={previewUrl}
                alt={file.originalFilename}
                className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-lg"
              />
            )
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p>No preview available for this file type</p>
              <p className="text-xs mt-2">
                Use the download button to open this file locally
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#2a2535] bg-[#1b1622]/95 sticky bottom-0 z-20">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2a2535] rounded-lg transition text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
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
