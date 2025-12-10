import { useEffect, useState } from 'react';
import { getCurrentUser, updateProfile } from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const emptyProfile = {
  name: '',
  email: '',
  mobile: '',
  motherMobile: '',
  fatherMobile: '',
  address: '',
  dob: '',
  gender: '',
};

const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validMobile = (m) => {
  if (!m) return true;
  const digits = m.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(emptyProfile);
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getCurrentUser();
        const u = res.data?.user || res.data || null;
        if (u) {
          setUser(u);
          setForm({
            name: u.name || '',
            email: u.email || '',
            mobile: u.mobile || '',
            motherMobile: u.motherMobile || '',
            fatherMobile: u.fatherMobile || '',
            address: u.address || '',
            dob: u.dob || '',
            gender: u.gender || '',
          });
          if (u.customFields && Array.isArray(u.customFields)) {
            setCustomFields(u.customFields.map((cf, i) => ({ id: i + 1, title: cf.title, value: cf.value })));
          }
        }
      } catch (err) {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startEdit = () => setEditing(true);

  const cancelEdit = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      motherMobile: user?.motherMobile || '',
      fatherMobile: user?.fatherMobile || '',
      address: user?.address || '',
      dob: user?.dob || '',
      gender: user?.gender || '',
    });
    if (user?.customFields) {
      setCustomFields(user.customFields.map((cf, i) => ({ id: i + 1, title: cf.title, value: cf.value })));
    }
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const addCustomField = () => setCustomFields((c) => [...c, { id: Date.now(), title: '', value: '' }]);
  const removeCustomField = (id) => setCustomFields((c) => c.filter((f) => f.id !== id));
  const updateCustomField = (id, key, value) => setCustomFields((c) => c.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  const validate = () => {
    if (!form.name || form.name.trim().length < 2) { toast.error('Please enter a valid name'); return false; }
    if (form.email && !validEmail(form.email)) { toast.error('Please enter a valid email address'); return false; }
    if (!validMobile(form.mobile)) { toast.error('Please enter a valid mobile number'); return false; }
    if (!validMobile(form.motherMobile)) { toast.error("Please enter a valid mother's mobile number"); return false; }
    if (!validMobile(form.fatherMobile)) { toast.error("Please enter a valid father's mobile number"); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = { ...form, customFields: customFields.map(({ title, value }) => ({ title, value })) };
    try {
      await updateProfile(payload);
      const updatedUser = { ...(user || {}), ...payload };
      updatedUser.customFields = payload.customFields;
      setUser(updatedUser);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto py-20">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          {!editing ? (
            <button onClick={startEdit} className="btn-primary">Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
            </div>
          )}
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-md transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-lavender text-white flex items-center justify-center text-3xl font-semibold">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
            </div>
            <div>
              {!editing ? (
                <>
                  <div className="text-xl font-medium">{user?.name}</div>
                  <div className="text-base text-text-secondary">{user?.email}</div>
                </>
              ) : (
                <>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field mb-2" placeholder="Full name" />
                  <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="Email" />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary">Mobile</label>
              {editing ? (
                <input name="mobile" value={form.mobile} onChange={handleChange} className="input-field" placeholder="Primary mobile" />
              ) : (
                <div className="text-base">{user?.mobile || '—'}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary">Mother's Mobile</label>
              {editing ? (
                <input name="motherMobile" value={form.motherMobile} onChange={handleChange} className="input-field" placeholder="Mother's mobile" />
              ) : (
                <div className="text-base">{user?.motherMobile || '—'}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary">Father's Mobile</label>
              {editing ? (
                <input name="fatherMobile" value={form.fatherMobile} onChange={handleChange} className="input-field" placeholder="Father's mobile" />
              ) : (
                <div className="text-base">{user?.fatherMobile || '—'}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary">Address</label>
              {editing ? (
                <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="Address" />
              ) : (
                <div className="text-base">{user?.address || '—'}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary">DOB</label>
              {editing ? (
                <input name="dob" value={form.dob} onChange={handleChange} className="input-field" placeholder="YYYY-MM-DD" />
              ) : (
                <div className="text-base">{user?.dob || '—'}</div>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary">Gender</label>
              {editing ? (
                <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="text-base">{user?.gender || '—'}</div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Custom Fields</h2>
              {editing && (
                <button onClick={addCustomField} className="btn-primary text-sm">+ Add Field</button>
              )}
            </div>

            <div className="space-y-3">
              {customFields.length === 0 && (
                <div className="text-base text-text-secondary">No custom fields added</div>
              )}

              {customFields.map((f) => (
                <div key={f.id} className="flex items-center gap-2 transition-all">
                  {editing ? (
                    <>
                      <input value={f.title} onChange={(e) => updateCustomField(f.id, 'title', e.target.value)} placeholder="Title (e.g. Aadhaar)" className="input-field flex-1" />
                      <input value={f.value} onChange={(e) => updateCustomField(f.id, 'value', e.target.value)} placeholder="Value" className="input-field flex-1" />
                      <button onClick={() => removeCustomField(f.id)} className="text-red-500 px-2" title="Remove">❌</button>
                    </>
                  ) : (
                    <div className="flex-1">
                      <div className="text-base font-medium">{f.title}</div>
                      <div className="text-base text-text-secondary">{f.value}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
