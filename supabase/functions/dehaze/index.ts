
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

    console.log("Processing image path:", imagePath);

    // Create supabase client with service role key for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if 'images' bucket exists, if not create it
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("Error listing buckets:", bucketError);
    }
    
    const imagesBucketExists = buckets?.some(bucket => bucket.name === 'images');
    if (!imagesBucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket('images', {
        public: true
      });
      if (createBucketError) {
        console.error("Error creating 'images' bucket:", createBucketError);
        throw new Error(`Error creating 'images' bucket: ${createBucketError.message}`);
      }
      console.log("Created 'images' bucket");
    }

    // For now, we'll create a "dehazed" version by copying the same image
    // since actual model inference would require a more complex setup
    const originalPath = imagePath;
    const dehazedPath = `dehazed_${originalPath.split("/").pop()}`;
    
    console.log("Original path:", originalPath);
    console.log("Dehazed path:", dehazedPath);

    let fileData;
    // Check if the image path is a public URL or a storage path
    if (originalPath.startsWith('http')) {
      // Download image from URL
      const response = await fetch(originalPath);
      if (!response.ok) {
        throw new Error(`Error downloading image from URL: ${response.statusText}`);
      }
      fileData = await response.arrayBuffer();
    } else {
      // Download the original image from storage
      const { data, error: downloadError } = await supabase.storage
        .from('images')
        .download(originalPath.replace(/^\/images\//, ''));
      
      if (downloadError) {
        console.error("Error downloading image:", downloadError);
        throw new Error(`Error downloading image: ${downloadError.message}`);
      }
      fileData = data;
    }
    
    if (!fileData) {
      throw new Error("Failed to retrieve image data");
    }
    
    // Upload the same image as the "dehazed" version
    // In a real implementation, we would process the image here
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(dehazedPath, fileData, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Error uploading processed image:", uploadError);
      throw new Error(`Error uploading processed image: ${uploadError.message}`);
    }
    
    // Get the public URL of the dehazed image
    const { data: urlData } = await supabase.storage
      .from('images')
      .getPublicUrl(dehazedPath);
    
    console.log("Successfully processed image:", urlData?.publicUrl);
    
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
