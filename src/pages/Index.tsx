
import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ImageSelector from '@/components/ImageSelector';
import ImageComparison from '@/components/ImageComparison';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';
import { dehazeImage } from '@/services/dehazeService';

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSelectImage = async (imagePath: string) => {
    setLoading(true);
    setOriginalImage(imagePath);
    
    try {
      // For demo purposes, since we don't have a full Python backend yet, 
      // we're simulating the dehaze process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation with a complete backend:
      // 1. Convert the image path to a File object
      // 2. Call the dehazeImage service
      // 3. Set the processed image to the returned URL
      
      // For now, reuse the same image for demo purposes
      setProcessedImage(imagePath);
      
      toast.success("Image successfully dehazed!");
      handleDialogClose();
    } catch (error) {
      toast.error("Error processing image. Please try again.");
      console.error("Error processing image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero onOpenDialog={handleDialogOpen} />
        
        <ImageSelector 
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSelectImage={handleSelectImage}
          loading={loading}
        />
        
        {originalImage && processedImage && (
          <ImageComparison 
            originalImage={originalImage} 
            processedImage={processedImage} 
          />
        )}
        
        <AboutSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
