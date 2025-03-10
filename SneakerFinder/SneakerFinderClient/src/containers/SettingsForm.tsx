import { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import {
  getCurrentUserData,
  updateUserEmail,
  updateUserPassword,
  addShippingAddress,
  deleteShippingAddress,
  updateShippingAddress,
  ShippingAddress,
} from "../services/userService";
import i18n from "../i18n";

export default function SettingsForm() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    currentEmail: string;
    newEmail: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    language: string;
    newsletter: boolean;
    notifications: { email: boolean; push: boolean };
    profilePicture?: string;
  }>({
    currentEmail: "",
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    language: "pl",
    newsletter: true,
    notifications: { email: true, push: false },
    profilePicture: "",
  });
  const emptyAddress: ShippingAddress = {
    street: "",
    number: "",
    apartmentNumber: "",
    city: "",
    postalCode: "",
    province: "",
    phoneNumber: "",
  };
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [newAddress, setNewAddress] = useState<ShippingAddress>(emptyAddress);
  const [editingAddress, setEditingAddress] = useState<{
    index: number;
    address: ShippingAddress;
  } | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sneakerFinder/auth/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCurrentUserData();
        setUserData((prev) => ({
          ...prev,
          currentEmail: data.email,
          profilePicture: data.profilePicture,
        }));
        setAddresses(data.shippingAddresses || []);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load user data");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    // Load saved language from localStorage or use browser default
    const savedLanguage = localStorage.getItem('i18nextLng') || navigator.language.split('-')[0];
    setUserData(prev => ({ ...prev, language: savedLanguage }));
    i18n.changeLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setUserData(prev => ({ ...prev, language: newLang }));
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setUserData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAddress = (index: number) => {
    setEditingAddress({ index, address: { ...addresses[index] } });
  };

  const handleEditAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (editingAddress) {
      setEditingAddress({
        ...editingAddress,
        address: { ...editingAddress.address, [name]: value },
      });
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress) return;
    try {
      setError(null);
      await updateShippingAddress(editingAddress.index, editingAddress.address);
      setAddresses((prev) =>
        prev.map((addr, idx) =>
          idx === editingAddress.index ? editingAddress.address : addr
        )
      );
      setEditingAddress(null);
      setSuccessMessage("Address updated successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to update address");
    }
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
  };

  const handleUpdateEmail = async () => {
    try {
      setError(null);
      await updateUserEmail(userData.newEmail);
      setUserData((prev) => ({
        ...prev,
        currentEmail: userData.newEmail,
        newEmail: "",
      }));
      setSuccessMessage("Email updated successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to update email");
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (userData.newPassword !== userData.confirmPassword) {
        setError("New passwords don't match");
        console.error("New passwords don't match");
        return;
      }
      setError(null);
      await updateUserPassword(userData.currentPassword, userData.newPassword);
      setUserData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setSuccessMessage("Password updated successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to update password");
    }
  };

  const handleAddAddress = async () => {
    try {
      setError(null);
      await addShippingAddress(newAddress);
      setAddresses((prev) => [...prev, newAddress]);
      setNewAddress(emptyAddress);
      setIsAddingAddress(false);
      setSuccessMessage("Address added successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to add address");
    }
  };

  const handleDeleteAddress = async (index: number) => {
    try {
      setError(null);
      await deleteShippingAddress(index);
      setAddresses((prev) => prev.filter((_, i) => i !== index));
      setSuccessMessage("Address deleted successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to delete address");
    }
  };

  const handleUpdateProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/me/profile-picture`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data) {
          setUserData((prev) => ({
            ...prev,
            profilePicture: response.data.profilePicture,
          }));
          setSuccessMessage("Zdjęcie profilowe zostało zaktualizowane");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err) {
        console.error(err);
        setError("Błąd podczas aktualizacji zdjęcia profilowego");
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (userData.newEmail && userData.newEmail !== userData.currentEmail) {
        await updateUserEmail(userData.newEmail);
      }
      if (userData.newPassword && userData.confirmPassword) {
        if (userData.newPassword !== userData.confirmPassword) {
          setError("Hasła nie są takie same");
          console.error("Hasła nie są takie same");
          return;
        }
        await updateUserPassword(
          userData.currentPassword,
          userData.newPassword
        );
      }
      const updatedUserData = await getCurrentUserData();
      setUserData((prev) => ({
        ...prev,
        currentEmail: updatedUserData.email,
        profilePicture: updatedUserData.profilePicture || prev.profilePicture,
        newPassword: "",
        confirmPassword: "",
      }));
      setSuccessMessage("Dane zostały zaktualizowane");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setError("Wystąpił błąd podczas aktualizacji danych");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          {t('title')}
        </h2>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        <div className="space-y-12">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <section>
              <h3 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">
                {t('profile')}
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">{t('profilePicture')}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpdateProfilePicture}
                    className="hidden"
                    id="profile-picture-input"
                  />
                  <label
                    htmlFor="profile-picture-input"
                    className="bg-[#1C2632] text-white px-4 py-2 rounded-full w-full hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? t('placeholders.uploading') : t('changePicture')}
                  </label>
                </div>
              </div>
            </section>
          </div>
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">
              {t('email')}
            </h3>
            <div className="space-y-4">
              <Input
                label={t('currentEmail')}
                id="currentEmail"
                name="currentEmail"
                type="email"
                value={userData.currentEmail}
                onChange={handleChange}
                disabled
              />
              <Input
                label={t('newEmail')}
                id="newEmail"
                name="newEmail"
                type="email"
                value={userData.newEmail}
                onChange={handleChange}
                placeholder={t('placeholders.email')}
              />
              <div className="flex justify-end pt-2">
                <Button
                  name={t('changeEmail')}
                  onClick={handleUpdateEmail}
                  disabled={!userData.newEmail}
                />
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">
              {t('password')}
            </h3>
            <div className="space-y-4">
              <Input
                label={t('currentPassword')}
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={userData.currentPassword}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('newPassword')}
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={userData.newPassword}
                  onChange={handleChange}
                />
                <Input
                  label={t('confirmPassword')}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  name={t('changePassword')}
                  onClick={handleUpdatePassword}
                  disabled={
                    !userData.currentPassword ||
                    !userData.newPassword ||
                    !userData.confirmPassword
                  }
                />
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">
              {t('shippingAddresses')}
            </h3>
            <div className="space-y-6">
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 relative"
                >
                  {editingAddress?.index === index ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label={t('street')}
                          id={`edit-street-${index}`}
                          name="street"
                          type="text"
                          value={editingAddress.address.street}
                          onChange={handleEditAddressChange}
                        />
                        <Input
                          label={t('number')}
                          id={`edit-number-${index}`}
                          name="number"
                          type="text"
                          value={editingAddress.address.number}
                          onChange={handleEditAddressChange}
                        />
                        <Input
                          label={t('apartmentNumber')}
                          id={`edit-apartmentNumber-${index}`}
                          name="apartmentNumber"
                          type="text"
                          value={editingAddress.address.apartmentNumber || ""}
                          onChange={handleEditAddressChange}
                        />
                        <Input
                          label={t('city')}
                          id={`edit-city-${index}`}
                          name="city"
                          type="text"
                          value={editingAddress.address.city}
                          onChange={handleEditAddressChange}
                        />
                        <Input
                          label={t('postalCode')}
                          id={`edit-postalCode-${index}`}
                          name="postalCode"
                          type="text"
                          value={editingAddress.address.postalCode}
                          onChange={handleEditAddressChange}
                        />
                        <Input
                          label={t('province')}
                          id={`edit-province-${index}`}
                          name="province"
                          type="text"
                          value={editingAddress.address.province}
                          onChange={handleEditAddressChange}
                        />
                        <Input
                          label={t('phoneNumber')}
                          id={`edit-phoneNumber-${index}`}
                          name="phoneNumber"
                          type="tel"
                          value={editingAddress.address.phoneNumber}
                          onChange={handleEditAddressChange}
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <Button name={t('cancel')} onClick={handleCancelEdit} />
                        <Button
                          name={t('saveChanges')}
                          onClick={handleUpdateAddress}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleEditAddress(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p>
                          <span className="font-medium">{t('street')}:</span>{" "}
                          {address.street} {address.number}
                          {address.apartmentNumber &&
                            ` m. ${address.apartmentNumber}`}
                        </p>
                        <p>
                          <span className="font-medium">{t('city')}:</span>{" "}
                          {address.city}
                        </p>
                        <p>
                          <span className="font-medium">{t('postalCode')}:</span>{" "}
                          {address.postalCode}
                        </p>
                        <p>
                          <span className="font-medium">{t('province')}:</span>{" "}
                          {address.province}
                        </p>
                        <p>
                          <span className="font-medium">{t('phoneNumber')}:</span>{" "}
                          {address.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isAddingAddress ? (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-lg font-medium mb-4">{t('newAddress')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('street')}
                      id="street"
                      name="street"
                      type="text"
                      value={newAddress.street}
                      onChange={handleAddressChange}
                    />
                    <Input
                      label={t('number')}
                      id="number"
                      name="number"
                      type="text"
                      value={newAddress.number}
                      onChange={handleAddressChange}
                    />
                    <Input
                      label={t('apartmentNumber')}
                      id="apartmentNumber"
                      name="apartmentNumber"
                      type="text"
                      value={newAddress.apartmentNumber || ""}
                      onChange={handleAddressChange}
                    />
                    <Input
                      label={t('city')}
                      id="city"
                      name="city"
                      type="text"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                    />
                    <Input
                      label={t('postalCode')}
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={newAddress.postalCode}
                      onChange={handleAddressChange}
                    />
                    <Input
                      label={t('province')}
                      id="province"
                      name="province"
                      type="text"
                      value={newAddress.province}
                      onChange={handleAddressChange}
                    />
                    <Input
                      label={t('phoneNumber')}
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={newAddress.phoneNumber}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="flex justify-end space-x-4 mt-4">
                    <Button
                      name={t('cancel')}
                      onClick={() => setIsAddingAddress(false)}
                    />
                    <Button name={t('addAddress')} onClick={handleAddAddress} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <Button
                    name={t('addNewAddress')}
                    onClick={() => setIsAddingAddress(true)}
                  />
                </div>
              )}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4 pb-2 border-b">
              {t('preferences')}
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('language')}
                </label>
                <select
                  name="language"
                  value={userData.language}
                  onChange={handleLanguageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="en">{t('languages.english')}</option>
                  <option value="pl">{t('languages.polish')}</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={userData.newsletter}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('newsletter')}
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="notifications.email"
                    checked={userData.notifications.email}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('emailNotifications')}
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="notifications.push"
                    checked={userData.notifications.push}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('pushNotifications')}
                  </span>
                </label>
              </div>
            </div>
          </section>
          <div className="pt-6 border-t">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-end space-x-4">
                <Button name={t('cancel')} />
                <Button
                  name={t('saveChanges')}
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
