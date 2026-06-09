import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Calendar, Clock, Stethoscope, FileText, CheckCircle, XCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { exportAppointmentsPDF } from '../utils/pdfExport';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const emptyForm = {
    patient: { id: '' },
    doctor: { id: '' },
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  };

  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [a, p, d] = await Promise.all([
        API.get('/appointments'),
        API.get('/patients'),
        API.get('/doctors'),
      ]);
      setAppointments(a.data);
      setPatients(p.data);
      setDoctors(d.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient.id || !form.doctor.id) {
      toast.error('Please select a patient and doctor');
      return;
    }
    try {
      setSaving(true);
      await API.post('/appointments', form);
      toast.success('Appointment booked! 🎉');
      setShowForm(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error('Failed to book appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status?status=${status}`);
      toast.success(`Appointment ${status.toLowerCase()}! ✅`);
      fetchAll();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await API.patch(`/appointments/${id}/cancel`);
        toast.success('Appointment cancelled');
        fetchAll();
      } catch (err) {
        toast.error('Failed to cancel');
      }
    }
  };

  const statusConfig = (status) => {
    const map = {
      PENDING:   { style: 'bg-amber-50 text-amber-600',    dot: 'bg-amber-400' },
      CONFIRMED: { style: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
      CANCELLED: { style: 'bg-red-50 text-red-500',        dot: 'bg-red-400' },
      COMPLETED: { style: 'bg-blue-50 text-blue-600',      dot: 'bg-blue-400' },
    };
    return map[status] || { style: 'bg-gray-50 text-gray-500', dot: 'bg-gray-400' };
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchSearch = search === '' ||
      a.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.fullName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: appointments.length,
    PENDING: appointments.filter(a => a.status === 'PENDING').length,
    CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} total appointments</p>
        </div>
       <div className="flex gap-3">
  <button
    onClick={() => exportAppointmentsPDF(filtered)}
    className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 shadow-sm font-medium"
  >
    📄 Export PDF
  </button>
  <button
    onClick={() => setShowForm(!showForm)}
    className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl hover:bg-violet-700 shadow-sm transition-all hover:shadow-md font-medium"
  >
    <Plus className="w-4 h-4" /> Book Appointment
  </button>
</div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">📅 Book Appointment</h2>
              <p className="text-sm text-gray-400 mt-0.5">Fill in the appointment details</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Patient *</label>
              <select className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" value={form.patient.id} onChange={e => setForm({...form, patient: { id: e.target.value }})} required>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Doctor *</label>
              <select className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" value={form.doctor.id} onChange={e => setForm({...form, doctor: { id: e.target.value }})} required>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date *</label>
              <input className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" type="date" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Time *</label>
              <input className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" type="time" value={form.appointmentTime} onChange={e => setForm({...form, appointmentTime: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <input className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="e.g. Regular checkup" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <input className="border border-gray-200 rounded-xl p-2.5 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl hover:bg-violet-700 disabled:opacity-50 font-medium">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Booking...' : 'Book Appointment'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            className="border border-gray-200 rounded-xl p-2.5 pl-4 w-full focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Search by patient or doctor name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-violet-300'
              }`}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="ml-3 text-gray-500">Loading appointments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Calendar className="w-12 h-12 mb-3" />
            <p className="text-gray-400 font-medium">No appointments found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => {
                const { style, dot } = statusConfig(a.status);
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">
                          {getInitials(a.patient?.fullName)}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{a.patient?.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm text-gray-600">{a.doctor?.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {a.appointmentDate}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {a.appointmentTime}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {a.reason ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FileText className="w-3.5 h-3.5 text-gray-300" />
                          {a.reason}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${style}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {a.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm
                          </button>
                        )}
                        {a.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                            title="Complete"
                          >
                            <Check className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                        {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCancel(a.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Appointments;