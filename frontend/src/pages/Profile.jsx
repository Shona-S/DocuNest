import { useEffect, useState } from 'react';
import { getCurrentUser, setPIN } from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingPin, setIsSettingPin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await getCurrentUser();
        setUser(res.data.user);
      } catch (err) {
        // handled by interceptor
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSetPin = async () => {
    const pin = window.prompt('Enter a new 4-6 digit PIN:');
    if (!pin) return;
    setIsSettingPin(true);
    try {
      await setPIN(pin);
      alert('PIN updated successfully');
    } catch (err) {
      // handled by interceptor
    } finally {
      setIsSettingPin(false);
    }
  };

  if (isLoading) {
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
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="bg-surface p-6 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-lavender text-white flex items-center justify-center text-lg font-semibold">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
            </div>
            <div>
              <div className="text-lg font-medium">{user?.name}</div>
              <div className="text-sm text-text-secondary">{user?.email}</div>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-sm font-medium mb-2">Security</h2>
            <p className="text-sm text-text-secondary mb-3">Set or update a 4-6 digit PIN to protect downloads.</p>
            <button onClick={handleSetPin} className="btn-primary" disabled={isSettingPin}>
              {isSettingPin ? 'Saving...' : 'Set / Update PIN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
