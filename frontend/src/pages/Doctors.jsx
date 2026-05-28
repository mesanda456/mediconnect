import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Pencil, X, UserCheck, Phone, Mail, Star, DollarSign } from 'lucide-react';
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-emerald-400 to-emerald-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600',
      'from-pink-400 to-pink-600',
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const specialtyColor = (specialty) => {
    const map = {
      Cardiology: 'bg-red-50 text-red-600',
      Neurology: 'bg-purple-50 text-purple-600',
      Pediatrics: 'bg-blue-50 text-blue-600',
      Orthopedics: 'bg-orange-50 text-orange-600',
      Dermatology: 'bg-pink-50 text-pink-600',
    };
    return map[specialty] || 'bg-green-50 text-green-600';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">{doctors.length} doctors on staff</p>
        </div>
        <button
          onClick={() => { handleCancel(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? '✏️ Edit Doctor' : '➕ New Doctor'}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{editingId ? 'Update doctor information' : 'Fill in the details below'}</p>
            </div>
            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name *', key: 'fullName', placeholder: 'Dr. John Smith', type: 'text' },
              { label: 'Email *', key: 'email', placeholder: 'doctor@hospital.com', type: 'email', disabled: !!editingId },
              { label: 'Phone', key: 'phone', placeholder: '0112345678', type: 'text' },
              { label: 'Specialty *', key: 'specialty', placeholder: 'Cardiology', type: 'text' },
              { label: 'Qualification', key: 'qualification', placeholder: 'MBBS, MD', type: 'text' },
              { label: 'Experience (years)', key: 'experienceYears', placeholder: '5', type: 'number' },
              { label: 'Consultation Fee', key: 'consultationFee', placeholder: '2500', type: 'number' },
            ].map(({ label, key, placeholder, type, disabled }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <input
                  type={type}
                  className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  disabled={disabled}
                  required={label.includes('*')}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700">Availability</label>
              <select
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.available}
                onChange={e => setForm({...form, available: e.target.value === 'true'})}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Brief description about the doctor..."
                rows={2}
                value={form.bio}
                onChange={e => setForm({...form, bio: e.target.value})}
              />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium transition-all"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : editingId ? 'Update Doctor' : 'Save Doctor'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-3 text-gray-500">Loading doctors...</span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <UserCheck className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No doctors found</p>
          <p className="text-sm text-gray-300 mt-1">Add your first doctor to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">

              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(d.fullName)} flex items-center justify-center text-white font-bold text-sm`}>
                    {getInitials(d.fullName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{d.fullName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${specialtyColor(d.specialty)}`}>
                      {d.specialty}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${d.available ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {d.available ? '● Available' : '● Unavailable'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                {d.qualification && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {d.qualification}
                  </div>
                )}
                {d.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {d.email}
                  </div>
                )}
                {d.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {d.phone}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800">Rs. {d.consultationFee || '—'}</span>
                  {d.experienceYears && (
                    <span className="text-xs text-gray-400 ml-2">• {d.experienceYears} yrs exp</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(d)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Doctors;