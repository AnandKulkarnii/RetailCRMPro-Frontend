import React, { useState, useEffect, ChangeEvent } from "react";
import { Camera } from "lucide-react";
import axios from "axios";

interface ProfileData {
  id?: number;
  email: string;
  phoneNumber: string;
  password: string;
  ownerName?: string;
  shopName?: string;
  gstNumber?: string;
  image?: string | null;
}

const Profile = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    phoneNumber: "",
    password: "",
    ownerName: "",
    shopName: "",
    gstNumber: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log("Profile data from backend:", response.data);
          if (response.data) {
            setProfile(response.data);
            setIsEditing(true);
            if (response.data.image) {
              setImagePreview(
                `data:image/png;base64,${response.data.image.data.toString(
                  "base64"
                )}`
              );
            } else {
              // Set a default placeholder image if no image is available
              setImagePreview("/api/placeholder/150/150");
            }
            console.log("Image Preview", imagePreview);
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    } else {
      console.error("Token not found");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (profileImage) {
        formData.append("image", profileImage);
      }

      await axios.put("http://localhost:3000/api/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Profile Settings
      </h2>
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <img
            src={imagePreview}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
          <label
            htmlFor="profile-image"
            className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
          >
            <Camera className="w-5 h-5" />
          </label>
          <input
            type="file"
            id="profile-image"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {[
          "email",
          "phoneNumber",
          "password",
          "ownerName",
          "shopName",
          "gstNumber",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${field}`}
              value={profile[field as keyof ProfileData] || ""}
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Save Profile
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
