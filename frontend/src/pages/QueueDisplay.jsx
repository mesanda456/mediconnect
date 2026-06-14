import { useState, useEffect } from 'react';
import { Heart, Volume2, Clock, Users, CheckCircle } from 'lucide-react';
import API from '../api/axios';

export default function QueueDisplay() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchQueues = async () => {
    try {
      const res = await API.get('/queue/today');
      setQueues(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status) => {
    const map = {
      WAITING: 'text-amber-500',
      SERVING: 'text-emerald-500',
      DONE: 'text-gray-400',
      SKIPPED: 'text-red-400',
    };
    return map[status] || 'text-gray-400';
  };

  const currentlyServing = queues.filter(q => q.status === 'SERVING');
  const waiting = queues.filter(q => q.status === 'WAITING');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-blue-300" />
          <div>
            <h1 className="text-2xl font-bold">MediConnect</h1>
            <p className="text-blue-300 text-sm">Live Queue Display</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Now Serving */}
        <div>
          <h2 className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Now Serving</h2>
          {currentlyServing.length === 0 ? (
            <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10">
              <Clock className="w-16 h-16 text-blue-300 mx-auto mb-3 opacity-50" />
              <p className="text-blue-200 text-lg">No one is being served right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentlyServing.map(q => (
                <div key={q.id} className="bg-emerald-500/20 border-2 border-emerald-400 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -translate-y-8 translate-x-8" />
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">Now Serving</span>
                  </div>
                  <div className="text-7xl font-black text-white mb-3">{String(q.tokenNumber).padStart(3, '0')}</div>
                  <p className="text-white font-semibold text-lg">{q.patientName}</p>
                  <p className="text-emerald-300 text-sm mt-1">Dr. {q.doctorName}</p>
                  <p className="text-emerald-200 text-xs mt-0.5">{q.specialty}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waiting Queue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-blue-300 text-sm font-semibold uppercase tracking-widest">Waiting Queue</h2>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
              <Users className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200">{waiting.length} waiting</span>
            </div>
          </div>

          {waiting.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-blue-200">No patients waiting</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {waiting.map((q, idx) => (
                <div key={q.id} className={`bg-white/10 border border-white/20 rounded-2xl p-4 text-center transition-all ${idx === 0 ? 'bg-amber-500/20 border-amber-400/50' : ''}`}>
                  <div className={`text-4xl font-black mb-2 ${idx === 0 ? 'text-amber-300' : 'text-white'}`}>
                    {String(q.tokenNumber).padStart(3, '0')}
                  </div>
                  <p className="text-xs text-blue-200 font-medium truncate">{q.patientName}</p>
                  <p className="text-xs text-blue-300 truncate">Dr. {q.doctorName}</p>
                  {idx === 0 && (
                    <span className="inline-block mt-2 text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">Next</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Done Today */}
        <div className="flex items-center gap-3 text-blue-300 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{queues.filter(q => q.status === 'DONE').length} patients served today</span>
        </div>
      </div>
    </div>
  );
}
