"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageDropzone({ onFilesChange, single = false }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    if (single) {
        const file = acceptedFiles[0];
        if (file) {
            const newFile = {
                file,
                preview: URL.createObjectURL(file),
            };
            setFiles([newFile]);
            if (onFilesChange) onFilesChange(newFile);
        }
        return;
    }

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

  }, [onFilesChange, single]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: !single
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
        URL.revokeObjectURL(updatedFiles[index].preview);
        updatedFiles.splice(index, 1);
        if (onFilesChange) {
            if(single) {
                onFilesChange(null)
            } else {
                onFilesChange(updatedFiles)
            }
        }
        return updatedFiles;
    });
  }

  return (
    <div>
        <div {...getRootProps()} className={`w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer text-gray-400 ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            {single && files.length > 0 ? (
                 <div className="relative inline-block">
                    <img src={files[0].preview} alt="Preview" className="max-h-48 object-contain rounded-lg" />
                     <button 
                        onClick={(e) => removeImage(e, 0)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none text-xs h-6 w-6 flex items-center justify-center"
                        title="Remove image"
                    >
                        &times;
                    </button>
                </div>
            ) : (
                <p>{single ? "Drag 'n' drop a single image here, or click to select" : "Drag 'n' drop images here, or click to select"}</p>
            )}
        </div>
        {!single && (
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
        )}
    </div>
  );
}
