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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    if (!selectedImage || !remixPrompt) {
      setError('Remix prompt cannot be empty.');
      return;
    }
    setIsRemixing(true);
    setError(null);
    try {
      const remixed = await remixImage(remixPrompt, selectedImage, useThinkingMode);
      const updatedImages = generatedImages.map(img => img === selectedImage ? remixed : img);
      setGeneratedImages(updatedImages);
      setSelectedImage(remixed); // show the new image in the modal
      setRemixPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during remix.');
      console.error(e);
    } finally {
      setIsRemixing(false);
    }
  };
  
  const handleSelectImage = (base64Image: string) => {
    setSelectedImage(base64Image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setRemixPrompt('');
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
        {selectedImage && (
          <ImageModal
            isOpen={!!selectedImage}
            onClose={handleCloseModal}
            image={selectedImage}
            onRemix={handleRemix}
            remixPrompt={remixPrompt}
            setRemixPrompt={setRemixPrompt}
            isRemixing={isRemixing}
            useThinkingMode={useThinkingMode}
            setUseThinkingMode={setUseThinkingMode}
          />
        )}
      </main>
    </div>
  );
};

export default App;
