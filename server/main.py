from fastapi import FastAPI,UploadFile,File
from fastapi.responses import FileResponse
import os
from pydantic import BaseModel
from model.model_loader import ModelLoader
from happytransformer import TTSettings
from utils import correct_word_in_sentence,correct_document, extract_text_from_docx,extract_text_from_pdf,save_text_to_pdf,save_text_to_docx,correct_text
from fastapi.middleware.cors import CORSMiddleware
import nltk
class SentenceRequest(BaseModel):
    text:str


app = FastAPI()


origins = ["http://localhost:3000","http://localhost:5173"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_model():
    # Ensures the model is loaded at startup
    ModelLoader.get_model()
    nltk.download('punkt')
   

@app.post("/correct-pdf/")
async def correct_pdf(file: UploadFile = File(...)):
    input_path = f"temp_{file.filename}"
    output_path = f"corrected_{file.filename}"

    # Save uploaded file
    with open(input_path, "wb") as f:
        f.write(file.file.read())

    # Process the file
    text = extract_text_from_pdf(input_path)
    corrected_text = correct_document(text)
    save_text_to_pdf(corrected_text, output_path)

    # Clean up the temporary input file
    os.remove(input_path)

    # Return the corrected file
    return FileResponse(output_path, media_type="application/pdf", filename=output_path)


@app.post("/correct-docx/")
async def correct_docx(file: UploadFile = File(...)):
    input_path = f"temp_{file.filename}"
    output_path = f"corrected_{file.filename}"

    # Save uploaded file
    with open(input_path, "wb") as f:
        f.write(file.file.read())

    # Process the file
    text = extract_text_from_docx(input_path)
    corrected_text = correct_document(text)
    save_text_to_docx(corrected_text, output_path)

    # Clean up the temporary input file
    os.remove(input_path)

    # Return the corrected file
    return FileResponse(output_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=output_path)




@app.post("/correct-sentence")
async def generate_text(request: SentenceRequest):
    model = ModelLoader.get_model()
    # args = TTSettings(num_beams=5, min_length=1)
    if len(request.text.split(" ")) < 190:
        args = TTSettings(
        min_length=len(request.text.split()),  # Set a minimum length based on input word count
        max_length=len(request.text.split()) + 50,  # Allow some flexibility with max length
        early_stopping=True)
        

        text = correct_word_in_sentence(request.text)

        result = model.generate_text(f"grammar: {text}", args=args)
        ans =  result.text
    else :
        ans = correct_document(request.text)
    return {"corrected_text": ans}

