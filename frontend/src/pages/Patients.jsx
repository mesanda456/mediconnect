import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Loader2, Pencil, X, Users, Phone, Mail, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterBlood, setFilterBlood] = useState('ALL');
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
        toast.success('Patient updated! ✅');
      } else {
        await API.post('/patients', form);
        toast.success('Patient added! 🎉');
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

  const filtered = patients.filter(p => {
    const matchSearch = p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                        p.email?.toLowerCase().includes(search.toLowerCase());
    const matchGender = filterGender === 'ALL' || p.gender === filterGender;
    const matchBlood = filterBlood === 'ALL' || p.bloodGroup === filterBlood;
    return matchSearch && matchGender && matchBlood;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} total patients registered</p>
        </div>
        <button
          onClick={() => { handleCancel(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? '✏️ Edit Patient' : '➕ New Patient'}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{editingId ? 'Update patient information' : 'Fill in the details below'}</p>
            </div>
            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name *', key: 'fullName', placeholder: 'John Silva', type: 'text' },
              { label: 'Email *', key: 'email', placeholder: 'john@email.com', type: 'email', disabled: !!editingId },
              { label: 'Phone', key: 'phone', placeholder: '0771234567', type: 'text' },
              { label: 'Blood Group', key: 'bloodGroup', placeholder: 'A+', type: 'text' },
              { label: 'Emergency Contact', key: 'emergencyContact', placeholder: '0779876543', type: 'text' },
            ].map(({ label, key, placeholder, type, disabled }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <input
                  type={type}
                  className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  disabled={disabled}
                  required={label.includes('*')}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.gender}
                onChange={e => setForm({...form, gender: e.target.value})}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, Colombo"
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
              />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-all"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : editingId ? 'Update Patient' : 'Save Patient'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                className="pl-10 border border-gray-200 rounded-xl p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600"
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              className="border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600"
              value={filterBlood}
              onChange={e => setFilterBlood(e.target.value)}
            >
              <option value="ALL">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
            {(search || filterGender !== 'ALL' || filterBlood !== 'ALL') && (
              <button
                onClick={() => { setSearch(''); setFilterGender('ALL'); setFilterBlood('ALL'); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-4 py-3 border-b border-gray-50 flex gap-4">
          <span className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of <span className="font-semibold text-gray-700">{patients.length}</span> patients
          </span>
          {filterGender !== 'ALL' && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Gender: {filterGender}</span>}
          {filterBlood !== 'ALL' && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Blood: {filterBlood}</span>}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500">Loading patients...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Users className="w-12 h-12 mb-3" />
            <p className="text-gray-400 font-medium">No patients found</p>
            <p className="text-sm text-gray-300 mt-1">Try a different search or clear filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gender</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Blood</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${getAvatarColor(p.fullName)} flex items-center justify-center text-white text-xs font-bold`}>
                        {getInitials(p.fullName)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.fullName}</p>
                        <p className="text-xs text-gray-400">ID #{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="w-3 h-3" /> {p.email}
                      </div>
                      {p.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3 h-3" /> {p.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.gender === 'MALE' ? 'bg-blue-50 text-blue-600' :
                      p.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {p.gender}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.bloodGroup ? (
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-sm font-semibold text-red-600">{p.bloodGroup}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Patients;