const express=require("express");
const app=express();
const cors=require("cors")
const {buildPrompt}=require("./prompt")

const port=2000;
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Trinethra backend is running!' })
})


app.post("/analyze",async(req,res)=>{

    try{

      const {transcript}=req.body;

      if(!transcript){
        return res.status(400).json({error: 'Transcript is required' })
      }

      const prompt=buildPrompt(transcript);

      const ollamaResponse=await fetch("http://localhost:11434/api/generate",{

        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'llama3.2',
          prompt:prompt,
          stream:false
        })

      })

      const ollamaData =await ollamaResponse.json();
      const responseText = ollamaData.response
      
      const jsonMatch=responseText.match(/\{[\s\S]*\}/);

         if (!jsonMatch) {
      return res.status(500).json({ 
        error: 'AI response was not valid. Try again.' 
      })
    }


    const analysis = JSON.parse(jsonMatch[0])
    res.json(analysis)

    }

    catch(error){

       console.error('Error:', error)

       res.status(500).json({ 
      error: 'Something went wrong. Try again.' 
    })

    }


})


app.listen(port,()=>{
    console.log(`server listening on port ${port}`)
})

