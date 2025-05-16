
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imagePath: string) => void;
  loading: boolean;
}

const ImageSelector = ({ isOpen, onClose, onSelectImage, loading }: ImageSelectorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Generate 50 image paths
  const generateImagePaths = () => {
    return Array.from({ length: 50 }, (_, i) => `/images/hazy_${i + 1}.jpg`);
  };
  
  const imagePaths = generateImagePaths();

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  const handleSelectClick = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select a hazy image to process</DialogTitle>
        </DialogHeader>
        <div className="image-grid max-h-[60vh] overflow-y-auto p-1">
          {imagePaths.map((path, index) => (
            <div 
              key={index} 
              className={`image-container cursor-pointer ${selectedImage === path ? 'image-selected' : ''}`}
              onClick={() => handleImageClick(path)}
            >
              <img 
                src={path} 
                alt={`Hazy image ${index + 1}`} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Hazy+Image';
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSelectClick} 
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Select & Process'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageSelector;
