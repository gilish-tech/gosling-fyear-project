

import Header from "./components/Header"
import { AiOutlineCheckCircle } from "react-icons/ai"
import { RiFileAddLine } from "react-icons/ri"
import React,{ useEffect, useState } from "react"
import  {uploadFile,correctGrammar,getFiletype,checkIfFileIsSuported,extractTextFromDocx} from "./utils"
import {motion} from "framer-motion"
import Toast from "./components/Toast"
import pdfToText from 'react-pdftotext';





function App() {
  
  
  const [text,setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  // const [Er, setIsError] = useState("")
  const [file, setFile] = useState<File | null>(null);
  const [sendButtonName, setSendButtonName] = useState("Correct")
  const [disabled, setDisabled] =  useState(true)
  const [correctedText,setCorrectedText] = useState(false)
  const [wordCount,setWordCount] = useState(0)
  const [charaterCount,setCharaterCount] = useState(0)



  useEffect(()=>{
    const numOfWords = text.split(" ").filter((x)=>x!="")
    // const numOfWordsWithoutWhiteSpace = text.split(" ").length

    const numOfChars = text.length 

    setWordCount(numOfWords.length)
    setCharaterCount(numOfChars)

    

  },[text])




  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setText("")
    const selectedFile = event.target.files?.[0] || null;
    console.log(selectedFile);
    if (selectedFile){
      const name = selectedFile["name"]
      const fileType = getFiletype(name)
      const fileIsSupported = checkIfFileIsSuported(fileType)
      console.log(fileIsSupported)
      if (fileIsSupported){
          setFile(selectedFile);
          setError("")
          setSendButtonName("Correct File")
          setDisabled(false)
          if (fileType === "pdf"){
            console.log("yes it is pdf")
            const extractedText =  await pdfToText(selectedFile);
            console.log(extractedText)
            setText(extractedText);

          }
          else if (fileType === "docx"){
            console.log("yes it is pdf")
            const extractedText =  await extractTextFromDocx(selectedFile);
            console.log(extractedText)
            setText(extractedText);

          }
          
        }else{
          console.log("not supported file")
          const splittedText = text.split(" ") 
          if (splittedText.length < 2){
             setDisabled(true)
            
          }
          setError(`fileType '${fileType}' is not supported only(docx and pdf)`)

      }
    }
  };


  const handleClick  = async()=>{
      setIsLoading(true)
      if (file){
         const res = await uploadFile(file)
         setIsLoading(false)
         console.log(res)

      }else{

        try{
          const data =  await correctGrammar(text)
          setText(data["corrected_text"])
          setCorrectedText(true)
          
        }catch(error){
          alert("unable to fetch")
        }finally{
          setIsLoading(false)
  
        }
        
      }
      
   

  }


  return (
    <div>
       <Header/>
       <div className="w-full ">
        {
          error &&
          <Toast errorMessage={error} key={error}/>

        }

       </div>
      <div className="h-screen flex-col flex font-bold text-center  items-center justify-center gap-4 outline-2 hover:outline-purple-700">
          <h1 className='text-white text-3xl lg:text-5xl mt-[100px] tracking-widest'>Gosling Grammar corrector</h1>
          <p className="text-white/85 text-xl font-semibold tracking-wide">Use Gosling free writing assistant to check your English text for grammar, style, and spelling errors.</p>

          <div className="bg-white-sm shadow-lg h-[500px] w-[80%] bg-white">
            <motion.textarea placeholder="Enter Text Or Paste Text here" 
                value={text}   onChange={(e)=>{
                    setCorrectedText(false)
                    setText(e.target.value)
                    setFile(null)
                    setDisabled(false)
                    setSendButtonName("correct")

                }}
                className={`${correctedText?"text-purple-700" :"text-black"} py-3 pl-4  box-border w-full h-[80%] text-[27px] font-normal text-left border-none outline-none p-0 transition-colors  duration-500  `}/>

            <div className="flex justify-end gap-4 items-center px-7">

                <button className="flex justify-center items-center gap-2  text-2xl  Correct rounded-[30px] min-w-[200px] bg-purple-800 py-3 px-6 text-white/80 
                 hover:bg-purple-600 disabled:bg-gray-600"
                onClick={handleClick}disabled={disabled || isLoading} >
                  {sendButtonName} <AiOutlineCheckCircle className="text-3xl font-bold" />         
                </button>
                <div className="flex items-center" >

                  <label htmlFor="labelfile"><RiFileAddLine className="text-4xl"/></label>
                  <input name="labelfile" id="labelfile"   type="file" onChange={handleFileChange}/>      
                </div>

            </div>

            <div className="flex justify-end items-center px-10 mr-20  gap-4">
                <p className="text-[18px]">Word Count  <span>{wordCount}</span></p>
                <p className="text-[18px]">Character Count: {charaterCount}</p>
            </div>


              
          </div>
          
        
      </div>
      
    
    </div>
  )
}

export default App
