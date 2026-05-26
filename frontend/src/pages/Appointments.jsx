import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API from '../api/axios';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    patient: { id: '' },
    doctor: { id: '' },
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [a, p, d] = await Promise.all([
          API.get('/appointments'),
          API.get('/patients'),
          API.get('/doctors'),
        ]);

        setAppointments(a.data);
        setPatients(p.data);
        setDoctors(d.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  const refreshAll = async () => {
    try {
      const [a, p, d] = await Promise.all([
        API.get('/appointments'),
        API.get('/patients'),
        API.get('/doctors'),
      ]);

      setAppointments(a.data);
      setPatients(p.data);
      setDoctors(d.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post('/appointments', form);
      setShowForm(false);
      setForm(emptyForm);
      refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await API.patch(`/appointments/${id}/cancel`);
        refreshAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const statusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
    };

    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Book Appointment</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg p-2"
              value={form.patient.id}
              onChange={(e) =>
                setForm({
                  ...form,
                  patient: { id: e.target.value },
                })
              }
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg p-2"
              value={form.doctor.id}
              onChange={(e) =>
                setForm({
                  ...form,
                  doctor: { id: e.target.value },
                })
              }
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} — {d.specialty}
                </option>
              ))}
            </select>

            <input
              className="border rounded-lg p-2"
              type="date"
              value={form.appointmentDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  appointmentDate: e.target.value,
                })
              }
              required
            />

            <input
              className="border rounded-lg p-2"
              type="time"
              value={form.appointmentTime}
              onChange={(e) =>
                setForm({
                  ...form,
                  appointmentTime: e.target.value,
                })
              }
              required
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Reason"
              value={form.reason}
              onChange={(e) =>
                setForm({ ...form, reason: e.target.value })
              }
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Book
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Patient
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Doctor
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Date
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Time
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{a.patient?.fullName}</td>
                <td className="p-4 text-gray-500">{a.doctor?.fullName}</td>
                <td className="p-4 text-gray-500">{a.appointmentDate}</td>
                <td className="p-4 text-gray-500">{a.appointmentTime}</td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${statusColor(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>
                </td>

                <td className="p-4">
                  {a.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No appointments found
          </p>
        )}
      </div>
    </div>
  );
}

export default Appointments;