
import React, { useState, useCallback, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { UploadCloudIcon } from './icons/Icons';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Add a retro, vintage film filter');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, etc.).');
        return;
      }
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImage(null);
      setError(null);
    }
  };

  const handleEdit = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt) {
      setError('Please enter an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const base64Image = await fileToBase64(originalImage.file);
      const newImageSrc = await editImage(base64Image, originalImage.file.type, prompt);
      setEditedImage(newImageSrc);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-100">Image Editor</h2>
      
      {!originalImage && (
        <div 
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-colors"
        >
            <UploadCloudIcon className="h-12 w-12 text-slate-400 mb-4" />
            <span className="font-semibold text-slate-300">Click to upload an image</span>
            <span className="text-sm text-slate-500">PNG, JPG, GIF, WEBP</span>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
      )}

      {originalImage && (
         <div className="flex flex-col gap-4">
            <label htmlFor="edit-prompt" className="font-medium text-slate-300">
                Describe your edit
            </label>
            <input
            id="edit-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Remove the person in the background"
            className="w-full p-3 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <div className="flex flex-col sm:flex-row gap-4">
                 <Button onClick={triggerFileInput} variant="secondary" className="flex-1 w-full sm:w-auto">Change Image</Button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                <Button onClick={handleEdit} disabled={isLoading} variant="primary" className="flex-1 w-full sm:w-auto">
                    {isLoading ? <Spinner size="sm" /> : null}
                    Apply Edit
                </Button>
            </div>
        </div>
      )}

      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
      
      {isLoading && (
        <div className="text-center p-8 flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-slate-400">Applying AI magic... please wait.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {originalImage && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-center text-slate-200">Original</h3>
            <img src={originalImage.url} alt="Original" className="w-full h-auto object-contain rounded-lg bg-slate-700/50" />
          </div>
        )}
        {editedImage && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-center text-slate-200">Edited</h3>
            <img src={editedImage} alt="Edited" className="w-full h-auto object-contain rounded-lg bg-slate-700/50" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
