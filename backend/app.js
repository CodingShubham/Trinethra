const express = require("express")
const cors = require("cors")
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

    console.log("Building prompt...")
    const prompt = buildPrompt(transcript)
    console.log("Prompt built successfully")

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log("Request timed out after 10 minutes")
    }, 600000) 

    console.log("Sending to Ollama...")

    let ollamaResponse
    try {
      ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "llama3.2",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 1000,
            num_ctx: 4096
          }
        })
      })

      // IMPROVEMENT: Check if Ollama itself returned an error (e.g., 500)
      if (!ollamaResponse.ok) {
        throw new Error(`Ollama Error: ${ollamaResponse.status}`);
      }

    } finally {
      clearTimeout(timeoutId)
    }

    console.log("Got response from Ollama!")

    const ollamaData = await ollamaResponse.json()
    const responseText = ollamaData.response

    console.log("Raw Ollama response:", responseText)

    if (!responseText) {
      return res.status(500).json({
        error: "Ollama returned empty response. Try again."
      })
    }

    // IMPROVEMENT: Extract JSON safely using Regex to avoid the "Unexpected character" error
    // This finds everything from the first '{' to the last '}'
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      console.error("No JSON block found in response text")
      return res.status(500).json({
        error: "AI response did not contain a valid JSON object."
      })
    }

    // Parse JSON safely from the regex match
    let analysis
    try {
      // Use index [0] to get the actual string content from the match array
      analysis = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return res.status(500).json({
        error: "Could not parse AI response. Ensure the prompt is not too long."
      })
    }

    console.log("Analysis complete!")
    res.json(analysis)

  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Request aborted due to timeout")
      return res.status(504).json({
        error: "Request timed out. Ollama took too long. Try again."
      })
    }

    console.error("Full error:", error.message)
    res.status(500).json({
      error: "Something went wrong. Try again.",
      details: error.message
    })
  }
})

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})