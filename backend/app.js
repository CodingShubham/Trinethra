const express = require("express")
const cors = require("cors")
const ollama = require("ollama")
const { buildPrompt } = require("./prompt")

const app = express()
const port = 2000

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Trinethra backend is running!" })
})

app.post("/analyze", async (req, res) => {
  try {
    const { transcript } = req.body

    if (!transcript) {
      return res.status(400).json({ 
        error: "Transcript is required" 
      })
    }

    const prompt = buildPrompt(transcript)

    // Using ollama npm package instead of fetch
    const response = await ollama.default.generate({
      model: "llama3.2",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 800,
      }
    })

    const responseText = response.response

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ 
        error: "AI response was not valid. Try again." 
      })
    }

    const analysis = JSON.parse(jsonMatch[0])
    res.json(analysis)

  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ 
      error: "Something went wrong. Try again." 
    })
  }
})

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})