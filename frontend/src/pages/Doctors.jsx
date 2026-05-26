import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API from '../api/axios';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    qualification: '',
    experienceYears: '',
    bio: '',
    available: true,
    consultationFee: '',
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctors();
  }, []);

  const refreshDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/doctors', form);

      setShowForm(false);

      setForm({
        fullName: '',
        email: '',
        phone: '',
        specialty: '',
        qualification: '',
        experienceYears: '',
        bio: '',
        available: true,
        consultationFee: '',
      });

      refreshDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this doctor?')) {
      try {
        await API.delete(`/doctors/${id}`);
        refreshDoctors();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Doctor</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              className="border rounded-lg p-2"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              required
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Specialty"
              value={form.specialty}
              onChange={(e) =>
                setForm({ ...form, specialty: e.target.value })
              }
              required
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Qualification"
              value={form.qualification}
              onChange={(e) =>
                setForm({ ...form, qualification: e.target.value })
              }
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Experience (years)"
              type="number"
              value={form.experienceYears}
              onChange={(e) =>
                setForm({ ...form, experienceYears: e.target.value })
              }
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Consultation Fee"
              type="number"
              value={form.consultationFee}
              onChange={(e) =>
                setForm({ ...form, consultationFee: e.target.value })
              }
            />

            <select
              className="border rounded-lg p-2"
              value={form.available}
              onChange={(e) =>
                setForm({
                  ...form,
                  available: e.target.value === 'true',
                })
              }
            >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>

            <input
              className="border rounded-lg p-2 col-span-2"
              placeholder="Bio"
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
            />

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Save
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((d) => (
          <div key={d.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{d.fullName}</h3>
                <p className="text-green-600 text-sm font-medium">
                  {d.specialty}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {d.qualification}
                </p>
                <p className="text-gray-500 text-sm">
                  {d.experienceYears} years experience
                </p>
                <p className="text-gray-700 font-medium mt-2">
                  Rs. {d.consultationFee}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    d.available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {d.available ? 'Available' : 'Unavailable'}
                </span>

                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <p className="text-center text-gray-400 py-8">No doctors found</p>
      )}
    </div>
  );
}

export default Doctors;