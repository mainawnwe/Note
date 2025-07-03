import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfileEditModal from './UserProfileEditModal';
import { AuthContext } from '../context/AuthContext';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/auth/profile.php', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditSuccess = () => {
    // After successful edit, logout user to refresh session
    logout();
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  if (error) return <div className="text-red-600 text-center mt-10">Error: {error}</div>;
  if (!profile) return <div className="text-center mt-10">No profile data found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg mt-10">
      <button
        onClick={() => navigate('/')}
        className="mb-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded shadow transition duration-300"
      >
        Back to Notes
      </button>
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="flex-shrink-0">
          {profile.profile_picture ? (
            <img
              src={`http://localhost:8000/uploads/${profile.profile_picture}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-amber-500 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-amber-400 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              {(profile.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">{profile.username}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Email:</strong> {profile.email}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>First Name:</strong> {profile.first_name || '-'}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Last Name:</strong> {profile.last_name || '-'}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-4"><strong>Bio:</strong> {profile.bio || '-'}</p>
          <button
            onClick={() => setEditOpen(true)}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded shadow transition duration-300"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {editOpen && (
        <UserProfileEditModal
          isOpen={editOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
