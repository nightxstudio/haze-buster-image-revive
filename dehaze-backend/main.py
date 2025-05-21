from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your frontend domain in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model once on startup
model = tf.keras.models.load_model("aod_net_refined.keras")

def preprocess(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    original_size = img.size  # (width, height)
    img = img.resize((256, 256))
    img_array = np.array(img).astype("float32") / 255.0
    return np.expand_dims(img_array, axis=0), original_size

def postprocess(output, original_size):
    output_img = (output[0] * 255).astype("uint8")
    img = Image.fromarray(output_img)
    img = img.resize(original_size, resample=Image.BICUBIC)
    return img

@app.post("/dehaze")
async def dehaze(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    # Preprocess and get original size
    input_tensor, original_size = preprocess(image_bytes)
    
    # Predict
    output = model.predict(input_tensor)
    
    # Postprocess and resize back to original
    result_image = postprocess(output, original_size)

    # Send back image as response
    buffer = io.BytesIO()
    result_image.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")

