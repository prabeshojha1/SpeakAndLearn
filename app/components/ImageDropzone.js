
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageDropzone({ onFilesChange }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      description: ''
    }));
    
    setFiles(prev => {
        const updatedFiles = [...prev, ...newFiles];
        if (onFilesChange) onFilesChange(updatedFiles);
        return updatedFiles;
    });

  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  const handleDescriptionChange = (index, description) => {
    setFiles(prev => {
        const updatedFiles = [...prev];
        updatedFiles[index].description = description;
        if (onFilesChange) onFilesChange(updatedFiles);
        return updatedFiles;
    });
  };

  const removeImage = (e, index) => {
    e.stopPropagation();
    setFiles(prev => {
        const updatedFiles = [...prev];
        URL.revokeObjectURL(updatedFiles[index].preview); // Clean up memory
        updatedFiles.splice(index, 1);
        if (onFilesChange) onFilesChange(updatedFiles);
        return updatedFiles;
    });
  }

  return (
    <div>
        <div {...getRootProps()} className={`w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer text-gray-400
            ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop images here, or click to select</p>
        </div>
        <div className="mt-4 space-y-4">
            {files.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-2 border rounded-lg bg-gray-50">
                <img src={item.preview} alt={`Preview`} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Description (Correct Answer)</label>
                    <textarea 
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-500" 
                        placeholder="e.g., The seed sprouts from the ground."
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    />
                </div>
                 <button 
                    onClick={(e) => removeImage(e, index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                    title="Remove image"
                >
                    &times;
                </button>
            </div>
            ))}
        </div>
    </div>
  );
}
