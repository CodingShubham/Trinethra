const fs = require('fs')
const path = require('path')

// Read data files
const contextMd = fs.readFileSync(
  path.join(__dirname, '../data/context.md'), 
  'utf8'
)

const rubricJson = fs.readFileSync(
  path.join(__dirname, '../data/rubric.json'), 
  'utf8'
)

function buildPrompt(transcript) {
  return `
You are a performance analyst at DeepThought company.
Your job is to analyze supervisor feedback transcripts 
about Fellows (consultants) placed in manufacturing companies.

DOMAIN KNOWLEDGE:
${contextMd}

SCORING RUBRIC:
${rubricJson}

IMPORTANT RULES FOR SCORING:
1. Do NOT score based on how happy supervisor sounds
2. Score based on EVIDENCE of systems vs task absorption
3. Ask yourself: "If Fellow left tomorrow, what keeps running?"
4. Watch out for these biases:
   - Helpfulness bias: "Takes things off my plate" = NOT a system
   - Presence bias: "Always on floor" = NOT systems building
   - Laptop bias: "Spends time on computer" = COULD BE systems building
   - Halo effect: One good story does not mean high score overall

TRANSCRIPT TO ANALYZE:
${transcript}

Return ONLY a valid JSON object. 
No explanation before or after.
No markdown. No backticks.
Just pure JSON in exactly this format:

{
  "score": {
    "value": 6,
    "label": "Reliable and Productive",
    "band": "Productivity",
    "justification": "explanation here",
    "confidence": "medium"
  },
  "evidence": [
    {
      "quote": "exact words from transcript",
      "signal": "positive",
      "dimension": "execution",
      "interpretation": "what this means"
    }
  ],
  "kpiMapping": [
    {
      "kpi": "Quality",
      "evidence": "what supervisor said",
      "systemOrPersonal": "personal"
    }
  ],
  "gaps": [
    {
      "dimension": "change_management",
      "detail": "explanation of gap"
    }
  ],
  "followUpQuestions": [
    {
      "question": "question to ask next time",
      "targetGap": "which gap this addresses",
      "lookingFor": "what answer would tell us"
    }
  ]
}
`
}

module.exports = { buildPrompt }