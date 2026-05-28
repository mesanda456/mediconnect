import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', specialty: '',
    qualification: '', experienceYears: '', bio: '',
    available: true, consultationFee: ''
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      fullName: doctor.fullName || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialty: doctor.specialty || '',
      qualification: doctor.qualification || '',
      experienceYears: doctor.experienceYears || '',
      bio: doctor.bio || '',
      available: doctor.available ?? true,
      consultationFee: doctor.consultationFee || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ fullName: '', email: '', phone: '', specialty: '', qualification: '', experienceYears: '', bio: '', available: true, consultationFee: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.specialty) {
      toast.error('Name, email and specialty are required!');
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await API.put(`/doctors/${editingId}`, form);
        toast.success('Doctor updated successfully! ✅');
      } else {
        await API.post('/doctors', form);
        toast.success('Doctor added successfully! 🎉');
      }
      handleCancel();
      fetchDoctors();
    } catch (err) {
      toast.error(editingId ? 'Failed to update doctor' : 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this doctor?')) {
      try {
        await API.delete(`/doctors/${id}`);
        toast.success('Doctor deleted');
        fetchDoctors();
      } catch (err) {
        toast.error('Failed to delete doctor');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>
        <button onClick={() => { handleCancel(); setShowForm(!showForm); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? '✏️ Edit Doctor' : '➕ New Doctor'}</h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="Dr. John Smith" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="doctor@hospital.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editingId} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="0112345678" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Specialty *</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="Cardiology" value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Qualification</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="MBBS, MD" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Experience (years)</label>
              <input className="border rounded-lg p-2 w-full mt-1" type="number" placeholder="5" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Consultation Fee</label>
              <input className="border rounded-lg p-2 w-full mt-1" type="number" placeholder="2500" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Availability</label>
              <select className="border rounded-lg p-2 w-full mt-1" value={form.available} onChange={e => setForm({...form, available: e.target.value === 'true'})}>
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="Brief description..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : editingId ? 'Update Doctor' : 'Save Doctor'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          <span className="ml-2 text-gray-500">Loading doctors...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(d => (
            <div key={d.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{d.fullName}</h3>
                  <p className="text-green-600 text-sm font-medium">{d.specialty}</p>
                  <p className="text-gray-500 text-sm mt-1">{d.qualification}</p>
                  <p className="text-gray-500 text-sm">{d.experienceYears} years experience</p>
                  <p className="text-gray-700 font-medium mt-2">Rs. {d.consultationFee}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${d.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.available ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(d)} className="text-blue-500 hover:text-blue-700">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && doctors.length === 0 && <p className="text-center text-gray-400 py-8">No doctors found</p>}
    </div>
  );
}

export default Doctors;