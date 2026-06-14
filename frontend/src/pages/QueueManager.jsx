import { useState, useEffect } from 'react';
import { Users, ChevronRight, SkipForward, RotateCcw, CheckCircle, Clock, Play, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function QueueManager() {
  const [queues, setQueues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueues = async () => {
    try {
      const res = await API.get('/queue/today');
      setQueues(res.data);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      setDoctors(res.data);
      if (res.data.length > 0) setSelectedDoctor(String(res.data[0].id));
    } catch (err) {}
  };

  useEffect(() => {
    fetchDoctors();
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const doctorQueues = queues.filter(q => String(q.doctorId) === String(selectedDoctor));
  const serving = doctorQueues.find(q => q.status === 'SERVING');
  const waiting = doctorQueues.filter(q => q.status === 'WAITING');
  const done = doctorQueues.filter(q => q.status === 'DONE');

  const callNext = async () => {
    if (!selectedDoctor) { toast.error('Select a doctor first'); return; }
    setActionLoading(true);
    try {
      await API.post(`/queue/next?doctorId=${selectedDoctor}`);
      toast.success('Called next patient! 🔔');
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No patients waiting');
    } finally {
      setActionLoading(false);
    }
  };

  const skipCurrent = async () => {
    if (!serving) { toast.error('No patient is being served'); return; }
    setActionLoading(true);
    try {
      await API.post(`/queue/${serving.id}/skip`);
      toast.success('Patient skipped');
      fetchQueues();
    } catch (err) {
      toast.error('Failed to skip');
    } finally {
      setActionLoading(false);
    }
  };

  const completeCurrent = async () => {
    if (!serving) { toast.error('No patient is being served'); return; }
    setActionLoading(true);
    try {
      await API.post(`/queue/${serving.id}/complete`);
      toast.success('Patient completed ✅');
      fetchQueues();
    } catch (err) {
      toast.error('Failed to complete');
    } finally {
      setActionLoading(false);
    }
  };

  const generateQueue = async () => {
    if (!selectedDoctor) { toast.error('Select a doctor first'); return; }
    setActionLoading(true);
    try {
      await API.post(`/queue/generate?doctorId=${selectedDoctor}`);
      toast.success('Queue generated from today\'s appointments! 🎉');
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate queue');
    } finally {
      setActionLoading(false);
    }
  };

  const resetQueue = async () => {
    if (!selectedDoctor) return;
    if (!window.confirm('Reset the entire queue for this doctor today?')) return;
    setActionLoading(true);
    try {
      await API.delete(`/queue/reset?doctorId=${selectedDoctor}`);
      toast.success('Queue reset');
      fetchQueues();
    } catch (err) {
      toast.error('Failed to reset');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedDoctorObj = doctors.find(d => String(d.id) === String(selectedDoctor));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Queue Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage today's patient queue in real-time</p>
        </div>
        <a
          href="/queue-display"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          <Monitor className="w-4 h-4" />
          Open Display Screen
        </a>
      </div>

      {/* Doctor Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Doctor</label>
        <div className="flex gap-3 flex-wrap">
          {doctors.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDoctor(String(d.id))}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                String(selectedDoctor) === String(d.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              Dr. {d.fullName}
              <span className="ml-2 text-xs opacity-70">{d.specialty}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Controls */}
          <div className="space-y-4">
            {/* Now Serving Card */}
            <div className={`rounded-2xl p-5 border-2 ${serving ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Now Serving</p>
              {serving ? (
                <div>
                  <div className="text-6xl font-black text-emerald-600 mb-2">
                    {String(serving.tokenNumber).padStart(3, '0')}
                  </div>
                  <p className="font-semibold text-gray-800">{serving.patientName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{serving.appointmentTime}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No one being served</p>
                </div>
              )}
            </div>

            {/* Next in Queue */}
            {waiting.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">Next Up</p>
                <div className="text-3xl font-black text-amber-600">{String(waiting[0].tokenNumber).padStart(3, '0')}</div>
                <p className="text-sm font-medium text-gray-700 mt-1">{waiting[0].patientName}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={callNext}
                disabled={actionLoading || waiting.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
              >
                <ChevronRight className="w-5 h-5" />
                Call Next Patient
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={completeCurrent}
                  disabled={actionLoading || !serving}
                  className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-600 font-medium py-2.5 rounded-xl text-sm transition-all border border-emerald-200"
                >
                  <CheckCircle className="w-4 h-4" /> Done
                </button>
                <button
                  onClick={skipCurrent}
                  disabled={actionLoading || !serving}
                  className="flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 text-orange-600 font-medium py-2.5 rounded-xl text-sm transition-all border border-orange-200"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
              </div>

              <button
                onClick={generateQueue}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-600 font-medium py-2.5 rounded-xl text-sm transition-all border border-indigo-200"
              >
                <Play className="w-4 h-4" />
                Generate from Today's Appointments
              </button>

              <button
                onClick={resetQueue}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-500 font-medium py-2.5 rounded-xl text-sm transition-all border border-red-200"
              >
                <RotateCcw className="w-4 h-4" /> Reset Queue
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Waiting', value: waiting.length, color: 'text-amber-600 bg-amber-50' },
                { label: 'Serving', value: serving ? 1 : 0, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Done', value: done.length, color: 'text-blue-600 bg-blue-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs font-medium opacity-80">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Queue List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Today's Queue — Dr. {selectedDoctorObj?.fullName}
              </h2>
              <span className="text-xs text-gray-400">{doctorQueues.length} total</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : doctorQueues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <Users className="w-12 h-12 mb-3" />
                <p className="text-gray-400 font-medium">No queue yet</p>
                <p className="text-sm text-gray-300 mt-1">Click "Generate from Today's Appointments"</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {doctorQueues.map(q => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                      q.status === 'SERVING' ? 'bg-emerald-50 border-emerald-200' :
                      q.status === 'DONE' ? 'bg-gray-50 border-gray-100 opacity-60' :
                      q.status === 'SKIPPED' ? 'bg-red-50 border-red-100 opacity-60' :
                      'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {/* Token */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      q.status === 'SERVING' ? 'bg-emerald-500 text-white' :
                      q.status === 'DONE' ? 'bg-gray-200 text-gray-500' :
                      q.status === 'SKIPPED' ? 'bg-red-200 text-red-500' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {String(q.tokenNumber).padStart(3, '0')}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{q.patientName}</p>
                      <p className="text-xs text-gray-400">{q.appointmentTime}</p>
                    </div>

                    {/* Status */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      q.status === 'SERVING' ? 'bg-emerald-100 text-emerald-600' :
                      q.status === 'WAITING' ? 'bg-amber-100 text-amber-600' :
                      q.status === 'DONE' ? 'bg-gray-100 text-gray-500' :
                      'bg-red-100 text-red-500'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
