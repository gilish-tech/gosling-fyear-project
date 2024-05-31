import { SiUpwork } from "react-icons/si"
import mammoth from 'mammoth';
import axios from 'axios';
const SUPPORTED_FILES = ["docx","pdf"]


const BACKEND_URL = "http://localhost:8000"
export async function correctGrammar (text:string):Promise<{corrected_text:string}>{
    const data = await fetch(`${BACKEND_URL}/correct-sentence`, {
        method: 'POST', // Specify the request method
        headers: {
          'Content-Type': 'application/json' // Set the request headers, especially the content type
        },
        body: JSON.stringify({"text":text}) // Convert the data to a JSON string and set it as the body of the request
      })

    
    try{
      return data.json()

    }catch(error){
       throw new Error("unable to fetch")
    }

      
}



export const getFiletype =(text:string)=>{
  const splittedText = text.split(".")
  const  extension = splittedText[splittedText.length -  1]
  return extension

}

export const checkIfFileIsSuported = (fileType:string)=>{
  return SUPPORTED_FILES.includes(fileType)
}


export const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};





export async function uploadFile(file:File) {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);

  let endpoint = '';
  if (file.type === 'application/pdf') {
    endpoint = '/correct-pdf/';
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    endpoint = '/correct-docx/';
  } else {
    throw new Error('Unsupported file type');
  }

  try {
    const response = await axios.post(`${BACKEND_URL}${endpoint}`, formData, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = file.name.replace(/\.[^/.]+$/, '') + '_corrected' + (file.type === 'application/pdf' ? '.pdf' : '.docx');
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
