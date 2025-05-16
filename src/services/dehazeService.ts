
import { supabase } from "@/integrations/supabase/client";

export interface DehazeResult {
  success: boolean;
  message?: string;
  imageUrl?: string;
  error?: string;
}

export const dehazeImage = async (imageFile: File): Promise<DehazeResult> => {
  try {
    // Step 1: Upload the image to Supabase Storage
    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return {
        success: false,
        error: "Failed to upload image"
      };
    }

    // Step 2: Get the uploaded image path
    const { data: urlData } = await supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Could not get uploaded image URL"
      };
    }

    // Step 3: Call the dehaze edge function
    const { data, error } = await supabase.functions.invoke('dehaze', {
      body: JSON.stringify({ 
        imagePath: fileName
      }),
    });

    if (error) {
      console.error("Error calling dehaze function:", error);
      return {
        success: false,
        error: "Failed to process image"
      };
    }

    // In the current implementation, we're just returning the same image
    // In a real implementation, the edge function would return the path to the processed image
    return {
      success: true,
      imageUrl: urlData.publicUrl,
      message: data.message
    };
  } catch (error) {
    console.error("Error in dehazeImage service:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
};
