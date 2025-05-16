
import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ImageSelector from '@/components/ImageSelector';
import ImageComparison from '@/components/ImageComparison';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/sonner';

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
      // In a real application, this would make an API call to the Flask backend
      // For now, we'll simulate the processing with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Temporary solution: Just use the same image as processed
      // In production, this would be the response from the Flask API
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
