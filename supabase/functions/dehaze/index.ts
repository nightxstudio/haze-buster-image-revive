
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("Dehazing function loaded");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imagePath } = await req.json();
    
    if (!imagePath) {
      throw new Error("Image path is required");
    }

    // Create supabase client with service role key for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // For now, simulate model processing with a delay
    // In a production environment, this is where we would:
    // 1. Download the image from the 'images' bucket
    // 2. Call an external ML service API that runs the Keras model
    // 3. Upload the processed image back to Supabase storage
    // 4. Return the URL of the processed image
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For the demo, we'll create a "dehazed" version by just copying the same image
    // to a different location with a "dehazed_" prefix
    const originalPath = imagePath;
    const dehazedPath = `dehazed_${originalPath.split("/").pop()}`;
    
    // Download the original image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('images')
      .download(originalPath);
      
    if (downloadError) {
      throw new Error(`Error downloading image: ${downloadError.message}`);
    }
    
    // Upload the same image as the "dehazed" version
    // In a real implementation, we would process the image before uploading
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(dehazedPath, fileData, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (uploadError) {
      throw new Error(`Error uploading processed image: ${uploadError.message}`);
    }
    
    // Get the public URL of the dehazed image
    const { data: urlData } = await supabase.storage
      .from('images')
      .getPublicUrl(dehazedPath);
    
    return new Response(
      JSON.stringify({
        message: "Image dehazing completed",
        success: true,
        originalPath: imagePath,
        processedPath: dehazedPath,
        processedImageUrl: urlData?.publicUrl || ""
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in dehazing function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
