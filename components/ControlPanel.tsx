import React, { useRef } from 'react';
import type { ReferenceImage } from '../types';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  referenceImages: (ReferenceImage | null)[];
  onReferenceImageChange: (index: number, image: ReferenceImage | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt,
  setPrompt,
  referenceImages,
  onReferenceImageChange,
  onGenerate,
  isLoading,
}) => {
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        onReferenceImageChange(index, { base64, mimeType: file.type, name: file.name });
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    onReferenceImageChange(index, null);
    if(fileInputRefs[index].current) {
        fileInputRefs[index].current!.value = '';
    }
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs[index].current?.click();
  };

  return (
    <div className="control-panel">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your wallpaper... e.g., 'A tranquil forest scene with a flowing river at sunset'"
        rows={3}
        disabled={isLoading}
      />
      <div className="reference-images">
        <p>Add up to 3 reference images (optional)</p>
        <div className="image-slots">
          {referenceImages.map((image, index) => (
            <div key={index} className="image-slot">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                ref={fileInputRefs[index]}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              {image ? (
                <div className="image-preview-container">
                    <img src={`data:${image.mimeType};base64,${image.base64}`} alt={`Reference ${index + 1}`} className="image-preview" />
                    <button onClick={() => handleRemoveImage(index)} disabled={isLoading} className="remove-image-btn">×</button>
                </div>
              ) : (
                <button onClick={() => triggerFileInput(index)} disabled={isLoading} className="upload-placeholder">
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={onGenerate} disabled={isLoading} className="generate-btn">
        {isLoading ? 'Generating...' : 'Generate Wallpapers'}
      </button>
    </div>
  );
};
