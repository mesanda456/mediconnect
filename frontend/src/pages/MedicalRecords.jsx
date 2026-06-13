import { useState, useEffect, useRef } from 'react';
import { Plus, X, Loader2, FileText, Search, Trash2, ClipboardList, Calendar, User, Stethoscope, Paperclip, Download, Image, File } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { exportMedicalRecordsPDF } from '../utils/pdfExport';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }

    setAttachmentFile(file);
    if (file.type.startsWith('image/')) {
      setAttachmentPreview({ type: 'image', url: URL.createObjectURL(file), name: file.name });
    } else {
      setAttachmentPreview({ type: 'pdf', name: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient.id || !form.doctor.id || !form.diagnosis || !form.recordDate) {
      toast.error('Patient, doctor, diagnosis and date are required!');
      return;
    }
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('patientId', form.patient.id);
      formData.append('doctorId', form.doctor.id);
      formData.append('diagnosis', form.diagnosis);
      formData.append('prescription', form.prescription);
      formData.append('recordDate', form.recordDate);
      formData.append('notes', form.notes);
      if (attachmentFile) formData.append('attachment', attachmentFile);

      await API.post('/medical-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Medical record added! 🎉');
      setShowForm(false);
      setForm({ patient: { id: '' }, doctor: { id: '' }, diagnosis: '', prescription: '', recordDate: '', notes: '' });
      setAttachmentFile(null);
      setAttachmentPreview(null);
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

  const isImageUrl = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

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
        <div className="flex gap-3">
          <button
            onClick={() => exportMedicalRecordsPDF(filtered)}
            className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 shadow-sm font-medium"
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all hover:shadow-md font-medium"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
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
              <select className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.patient.id} onChange={e => setForm({...form, patient: { id: e.target.value }})} required>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Doctor *</label>
              <select className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.doctor.id} onChange={e => setForm({...form, doctor: { id: e.target.value }})} required>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Record Date *</label>
              <input type="date" className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.recordDate} onChange={e => setForm({...form, recordDate: e.target.value})} required />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Diagnosis *</label>
              <input className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Hypertension" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} required />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Prescription</label>
              <textarea className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="e.g. Amlodipine 5mg - once daily..." rows={2} value={form.prescription} onChange={e => setForm({...form, prescription: e.target.value})} />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Additional notes or follow-up instructions..." rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>

            {/* File Upload */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Attachment (PDF or Image)</label>
              <div
                onClick={() => fileInputRef.current.click()}
                className="mt-1 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                {attachmentPreview ? (
                  <div className="flex items-center gap-3">
                    {attachmentPreview.type === 'image' ? (
                      <img src={attachmentPreview.url} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{attachmentPreview.name}</p>
                      <p className="text-xs text-gray-400">{attachmentPreview.type === 'pdf' ? 'PDF Document' : 'Image'} • Click to change</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAttachmentFile(null); setAttachmentPreview(null); }}
                      className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <Paperclip className="w-6 h-6 text-gray-300" />
                    <p className="text-sm text-gray-400">Click to upload PDF or image</p>
                    <p className="text-xs text-gray-300">JPG, PNG, PDF up to 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-all">
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

      {/* Records Grid */}
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
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
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
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
                  </div>
                  <p className="text-sm text-gray-600">{r.notes}</p>
                </div>
              )}

              {/* Attachment */}
              {r.attachmentUrl && (
                <div className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachment</span>
                  </div>
                  {isImageUrl(r.attachmentUrl) ? (
                    <div className="relative group">
                      <img
                        src={`http://localhost:8080${r.attachmentUrl}`}
                        alt="attachment"
                        className="w-full h-32 object-cover rounded-lg border border-gray-100"
                      />
                      <a
                        href={`http://localhost:8080${r.attachmentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all"
                      >
                        <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  ) : (
                    <a
                      href={`http://localhost:8080${r.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">View PDF</span>
                      <Download className="w-3.5 h-3.5 text-red-400 ml-auto" />
                    </a>
                  )}
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
