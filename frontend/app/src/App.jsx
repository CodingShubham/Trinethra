import { useState } from "react"
import axios from "axios"

// Editable Field Component
const EditableField = ({ label, value, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value || "")

  const handleSave = () => {
    onSave(tempValue)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") setEditing(false)
  }

  if (editing) {
    return (
      <div className="mb-2">
        <p className="text-xs font-bold text-slate-500 uppercase mb-1">
          {label}
        </p>
        <div className="flex gap-2">
          <input
            autoFocus
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-1.5 border-2 border-indigo-500 
              rounded-lg text-sm outline-none"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-indigo-600 text-white 
              rounded-lg text-sm font-bold hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 
              rounded-lg text-sm hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-2 group">
      <p className="text-xs font-bold text-slate-500 uppercase mb-1">
        {label}
      </p>
      <div className="flex items-start gap-2">
        {value ? (
          <p className="text-sm text-slate-700 flex-1">{value}</p>
        ) : (
          <p className="text-sm text-amber-600 flex-1 italic">
            ⚠️ Empty - click edit to fill
          </p>
        )}
        <button
          onClick={() => {
            setTempValue(value || "")
            setEditing(true)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity
            px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 
            text-slate-500 hover:text-indigo-600 rounded text-xs"
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  )
}

function App() {
  const [transcript, setTranscript] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeTranscript = async () => {
    if (!transcript.trim()) {
      setError("Please paste a transcript first!")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setAnalysis(null)

      const response = await axios.post(
        "http://localhost:2000/analyze",
        { transcript: transcript },
        { timeout: 600000 }
      )

      setAnalysis(response.data)

    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Ollama took too long. Try again.")
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to backend. Make sure server is running on port 2000.")
      } else {
        setError("Something went wrong. Please try again.")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Update score fields
  const updateScore = (field, value) => {
    setAnalysis(prev => ({
      ...prev,
      score: { ...prev.score, [field]: value }
    }))
  }

  // Update evidence fields
  const updateEvidence = (index, field, value) => {
    setAnalysis(prev => {
      const updated = [...prev.evidence]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, evidence: updated }
    })
  }

  // Update KPI fields
  const updateKpi = (index, field, value) => {
    setAnalysis(prev => {
      const updated = [...prev.kpiMapping]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, kpiMapping: updated }
    })
  }

  // Update gap fields
  const updateGap = (index, field, value) => {
    setAnalysis(prev => {
      const updated = [...prev.gaps]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, gaps: updated }
    })
  }

  // Update follow up question fields
  const updateQuestion = (index, field, value) => {
    setAnalysis(prev => {
      const updated = [...prev.followUpQuestions]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, followUpQuestions: updated }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
            Trinethra
          </h1>
          <p className="mt-2 text-lg text-slate-600 font-medium">
            Supervisor Feedback Analyzer — DeepThought
          </p>
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 border 
              border-amber-200 rounded-lg px-4 py-2 inline-block">
            ⚠️ AI generates a draft. Review and edit all fields before finalizing.
            Hover over any field to edit it.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Paste Supervisor Transcript
          </h2>
          <textarea
            className="w-full p-4 border border-slate-300 rounded-lg 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              outline-none transition-all font-mono text-sm"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the supervisor transcript here..."
            rows={8}
          />
          <button
            onClick={analyzeTranscript}
            disabled={loading}
            className={`mt-4 w-full py-3 px-6 rounded-lg font-semibold 
              text-white transition-all 
              ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                       5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                       5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing... Please wait 2-3 minutes
              </span>
            ) : "▶ Run Analysis"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
            <p className="font-medium">❌ {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 bg-white rounded-xl 
              border border-slate-200 mb-8">
            <div className="text-4xl mb-4 animate-bounce">🤖</div>
            <p className="text-indigo-600 font-semibold text-lg">
              AI is analyzing transcript...
            </p>
            <p className="text-slate-500 text-sm mt-2">
              This takes 2-3 minutes for local model
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Please do not close this window
            </p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-8">

            {/* Edit Instructions */}
            <div className="bg-blue-50 border border-blue-200 
                rounded-xl p-4 text-blue-800 text-sm">
              <p className="font-bold mb-1">📝 How to edit:</p>
              <p>Hover over any field → Click ✏️ Edit button → 
                 Make changes → Click Save or press Enter</p>
            </div>

            {/* Score Card */}
            <div className="bg-white rounded-xl shadow-sm border 
                border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 
                  border-b pb-2">
                🎯 Score
              </h2>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-32 h-32 rounded-full 
                    border-4 border-indigo-100 flex flex-col items-center 
                    justify-center bg-indigo-50 text-indigo-700">
                  <span className="text-3xl font-black">
                    {analysis.score?.value ?? "?"}/10
                  </span>
                  <span className="text-xs text-center px-2 uppercase 
                      font-bold tracking-wider leading-tight mt-1">
                    {analysis.score?.label || "⚠️"}
                  </span>
                </div>
                <div className="flex-1 w-full">
                  <EditableField
                    label="Score Value (1-10)"
                    value={String(analysis.score?.value || "")}
                    onSave={(v) => updateScore("value", Number(v))}
                  />
                  <EditableField
                    label="Label"
                    value={analysis.score?.label}
                    onSave={(v) => updateScore("label", v)}
                  />
                  <EditableField
                    label="Band"
                    value={analysis.score?.band}
                    onSave={(v) => updateScore("band", v)}
                  />
                  <EditableField
                    label="Justification"
                    value={analysis.score?.justification}
                    onSave={(v) => updateScore("justification", v)}
                  />
                  <EditableField
                    label="Confidence"
                    value={analysis.score?.confidence}
                    onSave={(v) => updateScore("confidence", v)}
                  />
                </div>
              </div>
            </div>

            {/* Evidence */}
            <div className="bg-white rounded-xl shadow-sm border 
                border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">
                  🔍 Evidence Found
                </h2>
              </div>
              <div className="p-6 grid gap-4">
                {analysis.evidence?.length > 0 ? (
                  analysis.evidence.map((item, index) => (
                    <div key={index}
                      className={`p-4 rounded-lg border-l-4 
                        ${item.signal?.toLowerCase() === "positive"
                          ? "bg-emerald-50 border-emerald-500"
                          : item.signal?.toLowerCase() === "negative"
                          ? "bg-red-50 border-red-500"
                          : "bg-amber-50 border-amber-400"
                        }`}
                    >
                      <p className="text-slate-800 italic font-medium mb-3 
                          text-sm bg-white p-2 rounded border">
                        "{item.quote || "⚠️ No quote"}"
                      </p>
                      <EditableField
                        label="Quote"
                        value={item.quote}
                        onSave={(v) => updateEvidence(index, "quote", v)}
                      />
                      <EditableField
                        label="Signal (positive/negative/neutral)"
                        value={item.signal}
                        onSave={(v) => updateEvidence(index, "signal", v)}
                      />
                      <EditableField
                        label="Dimension"
                        value={item.dimension}
                        onSave={(v) => updateEvidence(index, "dimension", v)}
                      />
                      <EditableField
                        label="Interpretation"
                        value={item.interpretation}
                        onSave={(v) => updateEvidence(index, "interpretation", v)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600">⚠️ No evidence extracted</p>
                )}
              </div>
            </div>

            {/* KPI and Gaps Grid */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* KPI Mapping */}
              <div className="bg-white rounded-xl shadow-sm border 
                  border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  📊 KPI Mapping
                </h2>
                {analysis.kpiMapping?.length > 0 ? (
                  analysis.kpiMapping.map((item, index) => (
                    <div key={index} className="mb-4 p-3 bg-indigo-50 
                        rounded border border-indigo-100 last:mb-0">
                      <EditableField
                        label="KPI"
                        value={item.kpi}
                        onSave={(v) => updateKpi(index, "kpi", v)}
                      />
                      <EditableField
                        label="Evidence"
                        value={item.evidence}
                        onSave={(v) => updateKpi(index, "evidence", v)}
                      />
                      <EditableField
                        label="System or Personal"
                        value={item.systemOrPersonal}
                        onSave={(v) => updateKpi(index, "systemOrPersonal", v)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600">⚠️ No KPIs mapped</p>
                )}
              </div>

              {/* Gap Analysis */}
              <div className="bg-white rounded-xl shadow-sm border 
                  border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  ⚠️ Gap Analysis
                </h2>
                {analysis.gaps?.length > 0 ? (
                  analysis.gaps.map((item, index) => (
                    <div key={index} className="mb-4 p-3 bg-red-50 
                        rounded border border-red-100 last:mb-0">
                      <EditableField
                        label="Dimension"
                        value={item.dimension}
                        onSave={(v) => updateGap(index, "dimension", v)}
                      />
                      <EditableField
                        label="Detail"
                        value={item.detail}
                        onSave={(v) => updateGap(index, "detail", v)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600">⚠️ No gaps identified</p>
                )}
              </div>

            </div>

            {/* Follow Up Questions */}
            <div className="bg-indigo-900 rounded-xl shadow-xl p-8 text-white">
              <h2 className="text-xl font-bold mb-6">
                💡 Recommended Follow-Up Questions
              </h2>
              <div className="space-y-6">
                {analysis.followUpQuestions?.length > 0 ? (
                  analysis.followUpQuestions.map((item, index) => (
                    <div key={index} className="border-b border-indigo-800 
                        pb-4 last:border-0">
                      <div className="bg-indigo-800 rounded-lg p-3">
                        <EditableField
                          label={`Question ${index + 1}`}
                          value={item.question}
                          onSave={(v) => updateQuestion(index, "question", v)}
                        />
                        <EditableField
                          label="Target Gap"
                          value={item.targetGap}
                          onSave={(v) => updateQuestion(index, "targetGap", v)}
                        />
                        <EditableField
                          label="Looking For"
                          value={item.lookingFor}
                          onSave={(v) => updateQuestion(index, "lookingFor", v)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-300">
                    ⚠️ No follow up questions generated
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default App