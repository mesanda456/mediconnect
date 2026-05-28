import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Loader2, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    gender: 'MALE', bloodGroup: '', address: '', emergencyContact: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await API.get('/patients');
      setPatients(res.data);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      fullName: patient.fullName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      gender: patient.gender || 'MALE',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ fullName: '', email: '', phone: '', gender: 'MALE', bloodGroup: '', address: '', emergencyContact: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      toast.error('Name and email are required!');
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await API.put(`/patients/${editingId}`, form);
        toast.success('Patient updated successfully! ✅');
      } else {
        await API.post('/patients', form);
        toast.success('Patient added successfully! 🎉');
      }
      handleCancel();
      fetchPatients();
    } catch (err) {
      toast.error(editingId ? 'Failed to update patient' : 'Failed to add patient');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient?')) {
      try {
        await API.delete(`/patients/${id}`);
        toast.success('Patient deleted');
        fetchPatients();
      } catch (err) {
        toast.error('Failed to delete patient');
      }
    }
  };

  const filtered = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <button onClick={() => { handleCancel(); setShowForm(!showForm); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? '✏️ Edit Patient' : '➕ New Patient'}</h2>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="John Silva" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="john@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editingId} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="0771234567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select className="border rounded-lg p-2 w-full mt-1" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Blood Group</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="A+" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="0779876543" value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input className="border rounded-lg p-2 w-full mt-1" placeholder="123 Main St, Colombo" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : editingId ? 'Update Patient' : 'Save Patient'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="pl-9 border rounded-lg p-2 w-full" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading patients...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Gender</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Blood</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{p.fullName}</td>
                  <td className="p-4 text-gray-500">{p.email}</td>
                  <td className="p-4 text-gray-500">{p.phone}</td>
                  <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{p.gender}</span></td>
                  <td className="p-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">{p.bloodGroup}</span></td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <p className="text-center text-gray-400 py-8">No patients found</p>}
      </div>
    </div>
  );
}

export default Patients;