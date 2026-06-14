import { useState, useEffect } from 'react';
import { Brain, Loader2, User, AlertTriangle, CheckCircle, Info, Save, ChevronDown, Stethoscope, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function AISymptomAnalyzer() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, d] = await Promise.all([API.get('/patients'), API.get('/doctors')]);
        setPatients(p.data);
        setDoctors(d.data);
      } catch (err) {
        toast.error('Failed to load patients and doctors');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const patient = patients.find(p => String(p.id) === String(selectedPatient));
      if (patient) {
        if (patient.age) setAge(String(patient.age));
        if (patient.gender) setGender(patient.gender);
      }
    }
  }, [selectedPatient, patients]);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) { toast.error('Please enter symptoms'); return; }
    if (!selectedPatient) { toast.error('Please select a patient'); return; }

    setLoading(true);
    setResult(null);

    try {
      const patient = patients.find(p => String(p.id) === String(selectedPatient));
      const prompt = `You are a medical AI assistant helping doctors in a hospital management system. Analyze the following patient symptoms and provide a structured medical assessment.

Patient Information:
- Name: ${patient?.fullName || 'Unknown'}
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}

Reported Symptoms:
${symptoms}

Please provide your response in the following JSON format only, no extra text:
{
  "possibleDiagnoses": [
    {"name": "diagnosis name", "probability": "High/Medium/Low", "description": "brief description"},
    {"name": "diagnosis name", "probability": "High/Medium/Low", "description": "brief description"},
    {"name": "diagnosis name", "probability": "High/Medium/Low", "description": "brief description"}
  ],
  "severityLevel": "Critical/High/Moderate/Low",
  "severityReason": "one sentence explaining severity",
  "recommendedTests": ["test 1", "test 2", "test 3"],
  "immediateActions": ["action 1", "action 2"],
  "suggestedSpecialist": "specialist type",
  "disclaimer": "This is an AI-assisted analysis and should not replace professional medical judgment."
}`;

      // ← Now calls backend instead of Anthropic directly
      const response = await API.post('/ai/analyze', { prompt });
      const data = response.data;
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      toast.error('AI analysis failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveToMedicalRecord = async () => {
    if (!result || !selectedPatient || !selectedDoctor) {
      toast.error('Please select a doctor before saving');
      return;
    }
    setSaving(true);
    try {
      const diagnosis = result.possibleDiagnoses[0]?.name || 'AI Analysis';
      const notes = `AI Symptom Analysis Result:
Symptoms: ${symptoms}
Severity: ${result.severityLevel} — ${result.severityReason}
Possible Diagnoses: ${result.possibleDiagnoses.map(d => `${d.name} (${d.probability})`).join(', ')}
Recommended Tests: ${result.recommendedTests.join(', ')}
Immediate Actions: ${result.immediateActions.join(', ')}
Suggested Specialist: ${result.suggestedSpecialist}
${result.disclaimer}`;

      await API.post('/medical-records', {
        patient: { id: selectedPatient },
        doctor: { id: selectedDoctor },
        diagnosis,
        prescription: '',
        recordDate: new Date().toISOString().split('T')[0],
        notes,
      });

      toast.success('Saved to medical records! 📋');
    } catch (err) {
      toast.error('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const severityColor = (level) => {
    const map = {
      Critical: 'bg-red-100 text-red-700 border-red-200',
      High: 'bg-orange-100 text-orange-700 border-orange-200',
      Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Low: 'bg-green-100 text-green-700 border-green-200',
    };
    return map[level] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const severityIcon = (level) => {
    if (level === 'Critical' || level === 'High') return <AlertTriangle className="w-4 h-4" />;
    if (level === 'Moderate') return <Info className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const probabilityColor = (p) => {
    const map = {
      High: 'bg-red-50 text-red-600 border-red-100',
      Medium: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      Low: 'bg-green-50 text-green-600 border-green-100'
    };
    return map[p] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI Symptom Analyzer
          </h1>
          <p className="text-gray-500 text-sm mt-1">Powered by Claude AI — Enter symptoms to get an instant medical analysis</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2">
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-violet-600">AI Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Input Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Patient Information
            </h2>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Patient *</label>
              <div className="relative">
                <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm appearance-none bg-white">
                  <option value="">Choose a patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 35" className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Gender</label>
                <div className="relative">
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm appearance-none bg-white">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Assign Doctor (for saving)</label>
              <div className="relative">
                <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm appearance-none bg-white">
                  <option value="">Choose a doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-violet-500" />
              Describe Symptoms
            </h2>
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Describe the patient's symptoms in detail...

Example: Patient reports severe headache for 3 days, fever of 38.5°C, stiff neck, sensitivity to light, and nausea. No recent travel history."
              rows={7}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
            />
            <button
              onClick={analyzeSymptoms}
              disabled={loading || !symptoms.trim() || !selectedPatient}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing symptoms...</> : <><Brain className="w-4 h-4" /> Analyze with AI</>}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center gap-4 h-full min-h-64">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-violet-500 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">AI is analyzing symptoms...</p>
                <p className="text-sm text-gray-400 mt-1">This usually takes a few seconds</p>
              </div>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center gap-3 h-full min-h-64 text-gray-300">
              <Brain className="w-16 h-16" />
              <p className="text-gray-400 font-medium">AI analysis will appear here</p>
              <p className="text-sm text-gray-300 text-center">Select a patient, enter symptoms,<br />and click Analyze</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-2xl border font-medium ${severityColor(result.severityLevel)}`}>
                {severityIcon(result.severityLevel)}
                <div>
                  <p className="font-semibold">Severity: {result.severityLevel}</p>
                  <p className="text-xs font-normal mt-0.5 opacity-80">{result.severityReason}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Possible Diagnoses
                </h3>
                <div className="space-y-2">
                  {result.possibleDiagnoses.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 mt-0.5 w-4">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${probabilityColor(d.probability)}`}>{d.probability}</span>
                        </div>
                        <p className="text-xs text-gray-500">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Recommended Tests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.recommendedTests.map((t, i) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg font-medium">{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Immediate Actions
                </h3>
                <ul className="space-y-1.5 mb-4">
                  {result.immediateActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-orange-400 mt-0.5">→</span>
                      {a}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                  <Stethoscope className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700"><span className="font-semibold">Suggested Specialist:</span> {result.suggestedSpecialist}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">{result.disclaimer}</p>
              </div>

              <button
                onClick={saveToMedicalRecord}
                disabled={saving || !selectedDoctor}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save to Medical Records'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
