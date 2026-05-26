import { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import API from '../api/axios';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get('/patients');
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPatients();
  }, []);

  const refreshPatients = async () => {
    try {
      const res = await API.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/patients', form);
      setShowForm(false);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        bloodGroup: '',
        address: '',
        emergencyContact: '',
      });
      refreshPatients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient?')) {
      try {
        await API.delete(`/patients/${id}`);
        refreshPatients();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filtered = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Patient</h2>

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

            <select
              className="border rounded-lg p-2"
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <input
              className="border rounded-lg p-2"
              placeholder="Blood Group"
              value={form.bloodGroup}
              onChange={(e) =>
                setForm({ ...form, bloodGroup: e.target.value })
              }
            />

            <input
              className="border rounded-lg p-2"
              placeholder="Emergency Contact"
              value={form.emergencyContact}
              onChange={(e) =>
                setForm({ ...form, emergencyContact: e.target.value })
              }
            />

            <input
              className="border rounded-lg p-2 col-span-2"
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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

      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

            <input
              className="pl-9 border rounded-lg p-2 w-full"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Phone
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Gender
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Blood
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{p.fullName}</td>
                <td className="p-4 text-gray-500">{p.email}</td>
                <td className="p-4 text-gray-500">{p.phone}</td>

                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {p.gender}
                  </span>
                </td>

                <td className="p-4">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                    {p.bloodGroup}
                  </span>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No patients found</p>
        )}
      </div>
    </div>
  );
}

export default Patients;