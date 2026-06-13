import { useState, useEffect } from 'react';
import { Plus, Loader2, X, Calendar, Clock, Stethoscope, FileText, CheckCircle, XCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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
      PENDING:   { style: 'bg-amber-50 text-amber-600',     dot: 'bg-amber-400' },
      CONFIRMED: { style: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
      CANCELLED: { style: 'bg-red-50 text-red-500',         dot: 'bg-red-400' },
      COMPLETED: { style: 'bg-blue-50 text-blue-600',       dot: 'bg-blue-400' },
    };
    return map[status] || { style: 'bg-gray-50 text-gray-500', dot: 'bg-gray-400' };
  };

  const statusDot = (status) => {
    const map = {
      PENDING: 'bg-amber-400',
      CONFIRMED: 'bg-emerald-400',
      CANCELLED: 'bg-red-400',
      COMPLETED: 'bg-blue-400',
    };
    return map[status] || 'bg-gray-400';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ── Calendar helpers ──────────────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const appointmentsOnDay = (day) => {
    const str = toDateStr(year, month, day);
    return appointments.filter(a => a.appointmentDate === str);
  };

  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
  };

  const selectedDayAppointments = selectedDate
    ? appointments.filter(a => a.appointmentDate === toDateStr(year, month, selectedDate))
    : [];

  // filtered for status tabs (used in selected day panel)
  const filtered = selectedDayAppointments.filter(a => {
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

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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
            onClick={() => exportAppointmentsPDF(appointments)}
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

      {/* Booking Form */}
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

      {/* Calendar + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {MONTH_NAMES[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date().getDate()); }}
                className="text-xs px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg font-medium hover:bg-violet-100 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayAppts = appointmentsOnDay(day);
                const isSelected = selectedDate === day;
                const todayDay = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`h-14 rounded-xl flex flex-col items-center justify-start pt-1.5 px-1 transition-all hover:bg-violet-50 relative
                      ${isSelected ? 'bg-violet-600 text-white hover:bg-violet-700' : ''}
                      ${todayDay && !isSelected ? 'border-2 border-violet-400' : ''}
                    `}
                  >
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : todayDay ? 'text-violet-600' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {dayAppts.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayAppts.slice(0, 3).map((a, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white opacity-80' : statusDot(a.status)}`}
                          />
                        ))}
                        {dayAppts.length > 3 && (
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            +{dayAppts.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusDot(s)}`} />
                <span className="text-xs text-gray-400">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {selectedDate ? (
            <>
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  {MONTH_NAMES[month]} {selectedDate}, {year}
                </h3>
                <p className="text-sm text-gray-400">{selectedDayAppointments.length} appointment{selectedDayAppointments.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Search */}
              <input
                className="border border-gray-200 rounded-xl p-2.5 w-full text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              {/* Status filter */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterStatus === status
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                  <Calendar className="w-8 h-8 mb-2" />
                  <p className="text-sm text-gray-400">No appointments</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filtered.map(a => {
                    const { style, dot } = statusConfig(a.status);
                    return (
                      <div key={a.id} className="p-3 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">
                                {getInitials(a.patient?.fullName)}
                              </div>
                              <p className="text-sm font-medium text-gray-800">{a.patient?.fullName}</p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 ml-8">
                              <Stethoscope className="w-3 h-3 text-emerald-500" />
                              <p className="text-xs text-gray-500">{a.doctor?.fullName}</p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 ml-8">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-400">{a.appointmentTime}</p>
                            </div>
                            {a.reason && (
                              <div className="flex items-center gap-1.5 mt-1 ml-8">
                                <FileText className="w-3 h-3 text-gray-300" />
                                <p className="text-xs text-gray-400">{a.reason}</p>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${style}`}>
                            {a.status}
                          </span>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-1 ml-8">
                          {a.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-medium"
                            >
                              <CheckCircle className="w-3 h-3" /> Confirm
                            </button>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium"
                            >
                              <Check className="w-3 h-3" /> Complete
                            </button>
                          )}
                          {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCancel(a.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-medium"
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-300">
              <Calendar className="w-12 h-12 mb-3" />
              <p className="text-sm text-gray-400 text-center">Click a day to see appointments</p>
              <div className="mt-4 space-y-1 w-full">
                {Object.entries(counts).filter(([k]) => k !== 'ALL').map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusDot(status)}`} />
                      <span className="text-xs text-gray-500">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Appointments;
