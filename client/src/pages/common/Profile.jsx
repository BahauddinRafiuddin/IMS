/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/user.api";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";
import { User, Mail, Building2, Phone, MapPin, Shield } from "lucide-react";
import { toastError } from "../../utils/toast";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.profile);
    } catch (err) {
      toastError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your personal information and security
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ProfileItem icon={User} label="Full Name" value={profile.name} />
          <ProfileItem icon={Mail} label="Email" value={profile.email} />
          <ProfileItem icon={Shield} label="Role" value={profile.role} />

          {profile.company && (
            <>
              <ProfileItem
                icon={Building2}
                label="Company"
                value={profile.company.name}
              />
              <ProfileItem
                icon={Phone}
                label="Company Phone"
                value={profile.company.phone}
              />
              <ProfileItem
                icon={MapPin}
                label="Company Address"
                value={profile.company.address}
              />
            </>
          )}
        </div>

        {/* CHANGE PASSWORD BUTTON */}
        <div className="pt-6 border-t">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition"
          >
            Change Password
          </button>
        </div>

      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Icon size={16} />
      {label}
    </div>
    <p className="font-medium text-gray-800 wrap-break-words">
      {value || "—"}
    </p>
  </div>
);

export default Profile;