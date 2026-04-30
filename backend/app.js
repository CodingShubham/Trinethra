const express=require("express");
const app=express();
const cors=require("cors")

const port=2000;
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Trinethra backend is running!' })
})

app.listen(port,()=>{
    console.log(`server listening on port ${port}`)
})

