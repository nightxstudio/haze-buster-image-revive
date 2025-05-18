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
    img = img.resize((256, 256))
    img_array = np.array(img).astype("float32") / 255.0
    return np.expand_dims(img_array, axis=0)

def postprocess(output):
    output_img = (output[0] * 255).astype("uint8")
    return Image.fromarray(output_img)

@app.post("/dehaze")
async def dehaze(file: UploadFile = File(...)):
    image_bytes = await file.read()
    input_tensor = preprocess(image_bytes)
    output = model.predict(input_tensor)
    result_image = postprocess(output)

    buffer = io.BytesIO()
    result_image.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")
