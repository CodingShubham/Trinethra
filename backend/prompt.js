function buildPrompt(transcript) {
  return `
You are analyzing a supervisor's feedback about a consultant Fellow in a factory.

SCORING (1-10):
1-3 = Not productive or disciplined
4-5 = Does tasks but needs supervision  
6 = Reliable, trusted, but everything depends on Fellow personally
7 = Found problems nobody asked about, built something others use
8 = Built multiple solutions that work without Fellow
9-10 = Exceptional systems builder

KEY RULE:
Ask: If Fellow left tomorrow, what keeps running?
NOTHING = score 6 max
SOMETHING = score 7+

BIASES:
"My right hand" = score 5-6 not 9
"Takes my calls" = score 6 not 8
"Always on floor" = score 6 not 8

KPIs:
TAT = time saved, faster, less delays
Quality = fewer defects, rejections
NPS = happier customers
PAT = costs down, money saved

TRANSCRIPT:
${transcript}

Return ONLY this JSON with values from transcript:
{
  "score": {
    "value": 0,
    "label": "",
    "band": "",
    "justification": "",
    "confidence": ""
  },
  "evidence": [
    {
      "quote": "",
      "signal": "",
      "dimension": "",
      "interpretation": ""
    }
  ],
  "kpiMapping": [
    {
      "kpi": "",
      "evidence": "",
      "systemOrPersonal": ""
    }
  ],
  "gaps": [
    {
      "dimension": "",
      "detail": ""
    }
  ],
  "followUpQuestions": [
    {
      "question": "",
      "targetGap": "",
      "lookingFor": ""
    }
  ]
}

RULES:
- quotes = exact supervisor words from transcript only
- never invent quotes not in transcript
- never use placeholder like [Fellow Name]
- use actual name from transcript
- signal = positive, negative, or neutral only
- dimension = execution, systems_building, kpi_impact, change_management only
- gaps = only from 4 dimensions above
- never leave fields empty
`
}

module.exports = { buildPrompt }