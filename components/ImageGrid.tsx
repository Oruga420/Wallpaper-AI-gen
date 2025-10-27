import React from 'react';

interface ImageGridProps {
  images: string[];
  isLoading: boolean;
  onImageClick: (index: number) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, isLoading, onImageClick }) => {
  if (isLoading) {
    return (
      <div className="image-grid loading">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="image-container placeholder">
            <div className="spinner"></div>
            <p>Generating...</p>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
        <div className="image-grid empty">
            <p>Your generated wallpapers will appear here.</p>
        </div>
    );
  }

  return (
    <div className="image-grid">
      {images.map((base64Image, index) => (
        <div key={index} className="image-container" onClick={() => onImageClick(index)}>
          <img src={`data:image/png;base64,${base64Image}`} alt={`Generated wallpaper ${index + 1}`} />
          <div className="overlay">Click to Remix</div>
        </div>
      ))}
    </div>
  );
};