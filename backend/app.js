const express=require("express");
const app=express();
const cors=require("cors")

const port=2000;
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Trinethra backend is running!' })
})


app.get("/olama-test",async(req,res)=>{

    try{

      const response=await fetch("http://localhost:11434/api/generate",{

        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'llama3.2',
          prompt:'Who is prime minister of India in 2003',
          stream:false
        })

      })

      const data=await response.json();
      res.json({ollama_response: data.response})

    }

    catch(error){

         res.json({ error: 'Ollama not working' })

    }


})


app.listen(port,()=>{
    console.log(`server listening on port ${port}`)
})

