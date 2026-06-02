import { useState, useEffect } from 'react';
import { Plus, X, Loader2, FileText, Search, Trash2, ClipboardList, Calendar, User, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [form, setForm] = useState({
    patient: { id: '' },
    doctor: { id: '' },
    diagnosis: '',
    prescription: '',
    recordDate: '',
    notes: '',
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [r, p, d] = await Promise.all([
        API.get('/medical-records'),
        API.get('/patients'),
        API.get('/doctors'),
      ]);
      setRecords(r.data);
      setPatients(p.data);
      setDoctors(d.data);
    } catch (err) {
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient.id || !form.doctor.id || !form.diagnosis || !form.recordDate) {
      toast.error('Patient, doctor, diagnosis and date are required!');
      return;
    }
    try {
      setSaving(true);
      await API.post('/medical-records', form);
      toast.success('Medical record added! 🎉');
      setShowForm(false);
      setForm({ patient: { id: '' }, doctor: { id: '' }, diagnosis: '', prescription: '', recordDate: '', notes: '' });
      fetchAll();
    } catch (err) {
      toast.error('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this medical record?')) {
      try {
        await API.delete(`/medical-records/${id}`);
        toast.success('Record deleted');
        fetchAll();
      } catch (err) {
        toast.error('Failed to delete record');
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filtered = records.filter(r => {
    const matchSearch = r.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                        r.diagnosis?.toLowerCase().includes(search.toLowerCase());
    const matchPatient = selectedPatient ? r.patient?.id === parseInt(selectedPatient) : true;
    return matchSearch && matchPatient;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500 text-sm mt-1">{records.length} total records</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">📋 New Medical Record</h2>
              <p className="text-sm text-gray-400 mt-0.5">Fill in the patient's medical details</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Patient *</label>
              <select
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.patient.id}
                onChange={e => setForm({...form, patient: { id: e.target.value }})}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Doctor *</label>
              <select
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.doctor.id}
                onChange={e => setForm({...form, doctor: { id: e.target.value }})}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Record Date *</label>
              <input
                type="date"
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.recordDate}
                onChange={e => setForm({...form, recordDate: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Diagnosis *</label>
              <input
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Hypertension"
                value={form.diagnosis}
                onChange={e => setForm({...form, diagnosis: e.target.value})}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Prescription</label>
              <textarea
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="e.g. Amlodipine 5mg - once daily..."
                rows={2}
                value={form.prescription}
                onChange={e => setForm({...form, prescription: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Additional notes or follow-up instructions..."
                rows={2}
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>

            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-all"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Record'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            className="pl-10 border border-gray-200 rounded-xl p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by patient name or diagnosis..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600 min-w-48"
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
        >
          <option value="">All Patients</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
        </select>
      </div>

      {/* Records */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-500">Loading records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <ClipboardList className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No records found</p>
          <p className="text-sm text-gray-300 mt-1">Add a new medical record above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">

              {/* Record Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {getInitials(r.patient?.fullName)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{r.patient?.fullName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <Stethoscope className="w-3 h-3" />
                      {r.doctor?.fullName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {r.recordDate}
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-red-50 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Diagnosis</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">{r.diagnosis}</p>
              </div>

              {/* Prescription */}
              {r.prescription && (
                <div className="bg-blue-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Prescription</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.prescription}</p>
                </div>
              )}

              {/* Notes */}
              {r.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
                  </div>
                  <p className="text-sm text-gray-600">{r.notes}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicalRecords;