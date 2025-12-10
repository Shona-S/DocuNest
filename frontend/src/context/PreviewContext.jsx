import React, { createContext, useContext, useState, useCallback } from 'react';
import PreviewModal from '../components/PreviewModal';
import { downloadFile } from '../services/api';

const PreviewContext = createContext(null);

export const usePreview = () => {
  return useContext(PreviewContext);
};

export const PreviewProvider = ({ children }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = useCallback((file) => {
    setSelectedFile(file);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setSelectedFile(null);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!selectedFile) return;
    try {
      await downloadFile(selectedFile.id, selectedFile.originalFilename);
    } catch (err) {
      // let API interceptor handle toasts
      console.error('Preview download error', err);
    }
  }, [selectedFile]);

  return (
    <PreviewContext.Provider value={{ openPreview, closePreview, selectedFile, isOpen }}>
      {children}
      <PreviewModal file={selectedFile} isOpen={isOpen} onClose={closePreview} onDownload={handleDownload} />
    </PreviewContext.Provider>
  );
};

export default PreviewContext;
