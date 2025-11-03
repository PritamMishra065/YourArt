import React, { useState, useCallback, useRef } from 'react';
import { generateImage, improvePrompt, getPromptVariations, editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { WandSparklesIcon, DownloadIcon, UploadCloudIcon, ImageIcon, PencilIcon } from './icons/Icons';

interface GeneratedImage {
  prompt: string;
  src: string;
}

type Mode = 'generate' | 'edit';

const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');

  // --- Generate State ---
  const [generatePrompt, setGeneratePrompt] = useState<string>('A photorealistic image of a majestic lion wearing a crown, sitting on a throne in a lush jungle.');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // --- Edit State ---
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('Add a retro, vintage film filter');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Common Functions ---
  const handleDownload = (src: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = src;
    const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${filename || 'edited-image'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Generate Mode Functions ---
  const handleImprovePrompt = useCallback(async () => {
    if (!generatePrompt) {
      setGenerateError('Please enter a prompt to improve.');
      return;
    }
    setIsImproving(true);
    setGenerateError(null);
    try {
      const improved = await improvePrompt(generatePrompt);
      setGeneratePrompt(improved);
    } catch (e: any) {
      setGenerateError(e.message);
    } finally {
      setIsImproving(false);
    }
  }, [generatePrompt]);

  const handleGenerate = useCallback(async () => {
    if (!generatePrompt) {
      setGenerateError('Please enter a prompt to generate images.');
      return;
    }
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedImages([]);
    try {
      const prompts = await getPromptVariations(generatePrompt);
      const imagePromises = prompts.map(p => generateImage(p));
      const images = await Promise.all(imagePromises);
      setGeneratedImages(images.map((src, index) => ({ src, prompt: prompts[index] })));
    } catch (e: any) {
      setGenerateError(e.message);
    } finally {
      setIsGenerating(false);
    }
  }, [generatePrompt]);

  // --- Edit Mode Functions ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEditError('Please upload a valid image file (PNG, JPG, etc.).');
        return;
      }
      setOriginalImage({ file, url: URL.createObjectURL(file) });
      setEditedImage(null);
      setEditError(null);
    }
  };

  const handleApplyEdit = useCallback(async () => {
    if (!originalImage) {
      setEditError('Please upload an image first.');
      return;
    }
    if (!editPrompt) {
      setEditError('Please enter an editing prompt.');
      return;
    }
    setIsEditing(true);
    setEditError(null);
    setEditedImage(null);
    try {
      const base64Image = await fileToBase64(originalImage.file);
      const newImageSrc = await editImage(base64Image, originalImage.file.type, editPrompt);
      setEditedImage(newImageSrc);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setIsEditing(false);
    }
  }, [originalImage, editPrompt]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const TabButton: React.FC<{
    currentMode: Mode;
    targetMode: Mode;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ currentMode, targetMode, onClick, children }) => {
    const isActive = currentMode === targetMode;
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
          ${isActive
            ? 'border-indigo-500 text-slate-100'
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
      >
        {children}
      </button>
    );
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex border-b border-slate-700">
        <TabButton currentMode={mode} targetMode="generate" onClick={() => setMode('generate')}>
            <ImageIcon className="h-5 w-5" /> Generate
        </TabButton>
        <TabButton currentMode={mode} targetMode="edit" onClick={() => setMode('edit')}>
            <PencilIcon className="h-5 w-5" /> Edit
        </TabButton>
      </div>

      {mode === 'generate' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="flex flex-col gap-4">
            <label htmlFor="prompt" className="font-medium text-slate-300 text-lg">Start with a creative idea</label>
            <textarea
              id="prompt"
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="e.g., A futuristic city at sunset, with flying cars"
              className="w-full p-3 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleImprovePrompt} disabled={isImproving || isGenerating} className="flex-1">
                {isImproving ? <Spinner size="sm" /> : <WandSparklesIcon className="h-5 w-5" />} Improve Prompt
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating || isImproving} variant="primary" className="flex-1 text-base py-3">
                {isGenerating ? <Spinner size="sm" /> : null} Generate Images
              </Button>
            </div>
          </div>
          {generateError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md border border-red-700">{generateError}</p>}
          {isGenerating && (
            <div className="text-center p-8 flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-slate-400">Generating creative variations... this might take a moment.</p>
            </div>
          )}
          {generatedImages.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold text-slate-200 border-b border-slate-700 pb-2">Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map((image, index) => (
                  <div key={index} className="group relative bg-slate-700/50 rounded-lg overflow-hidden shadow-lg border border-slate-700 flex flex-col">
                    <div className="aspect-square">
                      <img src={image.src} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-sm text-slate-400 font-mono flex-grow mb-4">{image.prompt}</p>
                      <Button onClick={() => handleDownload(image.src, image.prompt)} variant="secondary" className="w-full">
                        <DownloadIcon className="h-5 w-5" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {!originalImage ? (
            <div onClick={triggerFileInput} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-colors">
              <UploadCloudIcon className="h-12 w-12 text-slate-400 mb-4" />
              <span className="font-semibold text-slate-300">Click to upload an image</span>
              <span className="text-sm text-slate-500">PNG, JPG, GIF, WEBP</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <label htmlFor="edit-prompt" className="font-medium text-slate-300">Describe your edit</label>
              <input id="edit-prompt" type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="e.g., Remove the person in the background" className="w-full p-3 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={triggerFileInput} variant="secondary" className="flex-1"><UploadCloudIcon className="h-5 w-5" /> Change Image</Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button onClick={handleApplyEdit} disabled={isEditing} variant="primary" className="flex-1">
                  {isEditing ? <Spinner size="sm" /> : null} Apply Edit
                </Button>
              </div>
            </div>
          )}
          {editError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{editError}</p>}
          {isEditing && (
            <div className="text-center p-8 flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-slate-400">Applying AI magic... please wait.</p>
            </div>
          )}
          {(originalImage || editedImage) && (
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
                   <Button onClick={() => handleDownload(editedImage!, "edited-image")} variant="secondary" className="mt-2">
                        <DownloadIcon className="h-5 w-5" /> Download Edited
                    </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageStudio;