# Trinethra — Supervisor Feedback Analyzer
DeepThought Software Developer Internship Assignment

---

## What is this?

DeepThought places young consultants called Fellows inside small manufacturing companies for 3-6 months. Every few weeks, someone from DeepThought calls the factory owner or manager and asks how the Fellow is doing. That call gets recorded and converted to text.

Right now a psychology intern reads that transcript manually and writes a performance report. It takes 45-60 minutes per transcript.

This tool brings it down to under 10 minutes.

You paste the transcript, click Run Analysis, and the AI gives you a draft report. The intern then reviews it, edits anything that looks wrong, and finalizes it. The AI does the heavy lifting. The intern makes the final call.

---

## Before You Start

You need three things installed on your machine.

**Node.js**
Download from nodejs.org and install it.
Check it works: node --version

**Ollama**
Download from ollama.com and install it.
Check it works: ollama --version

**The AI model**
Open terminal and run:

ollama pull llama3.2

This downloads about 2GB. Takes 10-15 minutes depending on internet speed.

Test it works:

ollama run llama3.2 "say hello"

If it responds you are good to go.

---

## How to Run

You need three terminals open at the same time.

**Terminal 1 — Start Ollama**

ollama serve

**Terminal 2 — Start Backend**

cd backend
npm install
node app.js

You should see: server listening on port 2000

**Terminal 3 — Start Frontend**

cd frontend
npm install
npm run dev

You should see: Local: http://localhost:5173

Now open your browser and go to http://localhost:5173

---

## How to Use

1. Open data/sample-transcripts.json
2. Copy the text inside the "transcript" field
3. Paste it into the textarea in the app
4. Click Run Analysis
5. Wait 2-3 minutes (local AI takes time)
6. Review the output and edit any field that looks wrong

---

## Project Structure

## Project Structure

```
trinethra/
├── backend/
│   ├── app.js            → Express server, Ollama connection, error handling
│   ├── prompt.js         → Builds the instruction sent to Ollama
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx       → Main UI with editable fields
│   │   └── main.jsx
│   └── package.json
├── data/
│   ├── context.md        → Domain knowledge about Fellows and KPIs
│   ├── rubric.json       → 1-10 scoring criteria
│   └── sample-transcripts.json → 3 test transcripts
└── README.md
```

---

## Model Choice

I used llama3.2 (3 billion parameters).

Why this model:
- Runs completely on your laptop, no internet needed after download
- Free, no API key required
- Small enough to run on most machines with 8GB RAM
- Fast enough for this use case

The tradeoff is that it is a small model. It sometimes leaves fields empty or gets the score slightly wrong. I handled this by making every field in the UI editable so the intern can correct anything the AI got wrong.

---

## Architecture

Intern pastes transcript in browser
            ↓
     React Frontend (port 5173)
            ↓
    POST request to /analyze
            ↓
    Express Backend (port 2000)
            ↓
     prompt.js builds instruction
     (scoring rules + transcript)
            ↓
     Ollama API (port 11434)
     llama3.2 model analyzes it
            ↓
     Returns JSON response
            ↓
    Backend extracts and parses JSON
            ↓
    Frontend displays editable results
            ↓
         Intern reviews

---

## Design Challenges I Tackled

**Challenge 1: Structured Output Reliability**

Ollama does not always return clean JSON. Sometimes it adds commentary before or after the JSON block. I used a regex pattern to extract only the JSON part from whatever Ollama returns and wrapped JSON.parse in a try/catch so the app never crashes on a bad response.

**Challenge 2: Timeout Handling**

llama3.2 takes 2-5 minutes to process a long prompt. Node.js default fetch timeout is 30 seconds which caused the app to crash every time. I used AbortController with a 10 minute timeout to give Ollama enough time to respond. I also added specific error handling for AbortError so the intern sees a clear message instead of a generic crash.

**Challenge 3: Showing Uncertainty**

The AI might be wrong. I did not want the intern to blindly trust the output. So every field in the results section is editable. Empty fields show a warning. There is a disclaimer at the top reminding the intern this is a draft. The confidence field tells the intern how certain the AI is about the score.

**Challenge 4: Gap Detection**

Finding what the transcript does NOT say is harder than finding what it does say. I explicitly told the AI to check all four assessment dimensions and flag any that are missing as gaps. This gives the intern specific follow-up questions to ask in the next call.

---

## Guardrails Against AI Hallucination

- Regex extracts only JSON from Ollama response
- try/catch around JSON.parse prevents crashes
- Empty fields show warnings instead of breaking the UI
- Every field is editable so intern can fix wrong output
- Confidence level tells intern when to be careful
- AbortController prevents hanging forever on slow responses
- Ollama HTTP status check catches server errors early

---

## Sample Transcripts

Three transcripts are in data/sample-transcripts.json. Each one has a trap that tests whether the AI reads evidence or just supervisor tone.

Fellow | Location | Expected Score | The Trap
Karthik | Pune auto factory | 6-7 | Warm supervisor. Mostly task execution with one system signal
Meena | Tirupur textile factory | 7-8 | Critical supervisor. Real systems building hidden behind laptop bias
Anil | Nashik dairy factory | 5-6 | Glowing supervisor. Fellow absorbed founder's work, no real systems

---

## What I Would Improve With More Time

**Use a larger model**
llama3.2 at 3B parameters struggles with nuanced reasoning. A model like mistral:7b or llama3.1:70b would give much more accurate scores and fewer empty fields.

**Split into multiple prompts**
Right now one big prompt does everything. Breaking it into separate prompts for evidence extraction, scoring, and gap analysis would improve accuracy and reduce response time.

**Side by side view**
Show the original transcript on the left and the analysis on the right so the intern can verify quotes against the source without switching back and forth.

**Export to PDF**
Let the intern download the finalized analysis as a PDF to share with the DeepThought team.

**Save past analyses**
Right now nothing is saved. Adding local storage or a simple database would let the intern track Fellow progress across multiple calls over time.

---

## Known Limitations

- Response time is 2-5 minutes because llama3.2 runs on laptop hardware
- Score accuracy is around 60-70% and needs intern review
- Some fields may be empty due to model size constraints
- All of this is handled by editable fields and warnings in the UI

---

## Assumptions

- The transcript has already been converted from audio to text
- The machine running this has at least 8GB RAM
- Node.js and npm are already installed

---

Built for DeepThought Software Developer Internship
Trinethra Module — PDGMS AI Platform