import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageGrid } from './components/ImageGrid';
import { ImageModal } from './components/ImageModal';
import { generateWallpapers, remixImage } from './services/geminiService';
import type { ReferenceImage } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<(ReferenceImage | null)[]>([null, null, null]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixPrompt, setRemixPrompt] = useState('');
  const [useThinkingMode, setUseThinkingMode] = useState(false);

  const handleGenerate = async () => {
    if (!prompt && referenceImages.every(img => img === null)) {
      setError('Please provide a prompt or at least one reference image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const images = await generateWallpapers(prompt, referenceImages);
      setGeneratedImages(images);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemix = async () => {
    if (selectedImageIndex === null || !remixPrompt) {
      setError('Remix prompt cannot be empty.');
      return;
    }
    setIsRemixing(true);
    setError(null);
    try {
      const imageToRemix = generatedImages[selectedImageIndex];
      const remixed = await remixImage(remixPrompt, imageToRemix, useThinkingMode);
      
      const updatedImages = [...generatedImages];
      updatedImages[selectedImageIndex] = remixed;

      setGeneratedImages(updatedImages);
      setRemixPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during remix.');
      console.error(e);
    } finally {
      setIsRemixing(false);
    }
  };
  
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
    setRemixPrompt('');
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prevIndex) => (prevIndex! + 1) % generatedImages.length);
    }
  };

  const handlePrevImage = () => {
      if (selectedImageIndex !== null) {
          setSelectedImageIndex((prevIndex) => (prevIndex! - 1 + generatedImages.length) % generatedImages.length);
      }
  };

  const handleReferenceImageChange = (index: number, image: ReferenceImage | null) => {
    const newImages = [...referenceImages];
    newImages[index] = image;
    setReferenceImages(newImages);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Wallpaper Generator</h1>
        <p>Create unique wallpapers with Gemini. Describe your vision, add up to 3 reference images, and let AI bring it to life.</p>
      </header>
      <main>
        <ControlPanel
          prompt={prompt}
          setPrompt={setPrompt}
          referenceImages={referenceImages}
          onReferenceImageChange={handleReferenceImageChange}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
        {error && <p className="error">{error}</p>}
        <ImageGrid
          images={generatedImages}
          isLoading={isLoading}
          onImageClick={handleSelectImage}
        />
        {selectedImageIndex !== null && (
          <ImageModal
            isOpen={selectedImageIndex !== null}
            onClose={handleCloseModal}
            image={generatedImages[selectedImageIndex]}
            onRemix={handleRemix}
            remixPrompt={remixPrompt}
            setRemixPrompt={setRemixPrompt}
            isRemixing={isRemixing}
            useThinkingMode={useThinkingMode}
            setUseThinkingMode={setUseThinkingMode}
            onNext={handleNextImage}
            onPrev={handlePrevImage}
          />
        )}
      </main>
    </div>
  );
};

export default App;