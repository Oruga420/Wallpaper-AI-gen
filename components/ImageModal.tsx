import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  onRemix: () => void;
  remixPrompt: string;
  setRemixPrompt: (prompt: string) => void;
  isRemixing: boolean;
  useThinkingMode: boolean;
  setUseThinkingMode: (use: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  image,
  onRemix,
  remixPrompt,
  setRemixPrompt,
  isRemixing,
  useThinkingMode,
  setUseThinkingMode,
  onNext,
  onPrev,
}) => {
  if (!isOpen) {
    return null;
  }
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image}`;
    link.download = 'wallpaper.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="modal-image-container">
          {isRemixing && <div className="remix-spinner-overlay"><div className="spinner"></div><p>Remixing...</p></div>}
          
          <button className="nav-arrow prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous image">‹</button>
          <img src={`data:image/png;base64,${image}`} alt="Selected wallpaper" />
          <button className="nav-arrow next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next image">›</button>

        </div>
        <div className="modal-controls">
          <h2>Remix Image</h2>
          <p>Describe the changes you'd like to make.</p>
          <textarea
            value={remixPrompt}
            onChange={(e) => setRemixPrompt(e.target.value)}
            placeholder="e.g., 'Add a shooting star in the sky'"
            rows={2}
            disabled={isRemixing}
          />
           <div className="thinking-mode-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={useThinkingMode}
                  onChange={(e) => setUseThinkingMode(e.target.checked)}
                  disabled={isRemixing}
                />
                <span />
                Enable Thinking Mode (for complex edits)
              </label>
            </div>
          <div className="modal-buttons">
            <button onClick={onRemix} disabled={isRemixing || !remixPrompt} className="remix-btn">
              {isRemixing ? 'Remixing...' : 'Remix'}
            </button>
            <button onClick={handleDownload} disabled={isRemixing} className="download-btn">
                Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};