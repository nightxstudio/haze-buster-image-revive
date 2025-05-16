
import React from 'react';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';

interface HeroProps {
  onOpenDialog: () => void;
}

const Hero = ({ onOpenDialog }: HeroProps) => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Clear the Haze with AI
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
          Our advanced AI model removes fog and haze from your images, giving them crystal clear quality.
          Browse our sample images or upload your own.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onOpenDialog}
            size="lg" 
            className="font-medium"
          >
            <Image className="mr-2 h-5 w-5" />
            Browse Sample Images
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="font-medium"
            disabled
          >
            Upload Your Own Image
            <span className="text-xs ml-2">(Coming Soon)</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
