import React, { useState, useEffect } from 'react';
import { medicationAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, medication: null });
  const [formData, setFormData] = useState({
    medName: '',
    medicationType: 'Painkiller',
    dosage: '',
    frequency: '',
    timesPerDay: '',
    reminderTimes: [''],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: ''
  });

  // Only use the medication types that work with your backend
  const allowedMedicationTypes = [
    'Painkiller',
    'Antibiotic', 
    'Anti-inflammatory',
    'Other'
  ];

  useEffect(() => {
    fetchMedications();
  }, []);

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
  };

  const fetchMedications = async () => {
    try {
      const response = await medicationAPI.getAll();
      setMedications(response.data.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
      showAlert('Error loading medications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReminderTimeChange = (index, value) => {
    const newTimes = [...formData.reminderTimes];
    newTimes[index] = value;
    setFormData({ ...formData, reminderTimes: newTimes });
  };

  const addReminderTime = () => {
    setFormData({ ...formData, reminderTimes: [...formData.reminderTimes, ''] });
  };

  const removeReminderTime = (index) => {
    const newTimes = formData.reminderTimes.filter((_, i) => i !== index);
    setFormData({ ...formData, reminderTimes: newTimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty reminder times
      const filteredTimes = formData.reminderTimes.filter(time => time.trim() !== '');
      
      if (filteredTimes.length === 0) {
        showAlert('Please add at least one reminder time', 'warning');
        return;
      }

      const medicationData = {
        ...formData,
        reminderTimes: filteredTimes,
        frequency: parseInt(formData.frequency),
        timesPerDay: parseInt(formData.timesPerDay)
      };

      console.log('Submitting medication data:', medicationData);

      if (editingMedication) {
        // Update existing medication
        await medicationAPI.update(editingMedication._id, medicationData);
        showAlert('Medication updated successfully!', 'success');
      } else {
        // Create new medication
        await medicationAPI.create(medicationData);
        showAlert('Medication added successfully!', 'success');
      }

      setShowAddForm(false);
      setEditingMedication(null);
      resetForm();
      fetchMedications();
    } catch (error) {
      console.error('Error saving medication:', error);
      console.error('Error details:', error.response?.data);
      showAlert('Failed to save medication. Please try again.', 'error');
    }
  };

  const showDeleteConfirm = (medication) => {
    setDeleteConfirm({ show: true, medication });
  };

  const hideDeleteConfirm = () => {
    setDeleteConfirm({ show: false, medication: null });
  };

  const deleteMedication = async () => {
    if (!deleteConfirm.medication) return;

    try {
      await medicationAPI.delete(deleteConfirm.medication._id);
      showAlert('Medication deleted successfully!', 'success');
      fetchMedications();
      hideDeleteConfirm();
    } catch (error) {
      console.error('Error deleting medication:', error);
      showAlert('Failed to delete medication.', 'error');
      hideDeleteConfirm();
    }
  };

  const editMedication = (medication) => {
    setEditingMedication(medication);
    setShowAddForm(true);
    setFormData({
      medName: medication.medName,
      medicationType: medication.medicationType,
      dosage: medication.dosage,
      frequency: medication.frequency.toString(),
      timesPerDay: medication.timesPerDay.toString(),
      reminderTimes: [...medication.reminderTimes],
      startDate: medication.startDate.split('T')[0],
      endDate: medication.endDate.split('T')[0],
      instructions: medication.instructions || ''
    });
  };

  const resetForm = () => {
    setFormData({
      medName: '',
      medicationType: 'Painkiller',
      dosage: '',
      frequency: '',
      timesPerDay: '',
      reminderTimes: [''],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      instructions: ''
    });
    setEditingMedication(null);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingMedication(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500"></div>
            <p className="text-blue-600 font-medium">Loading your medications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      
      {/* Beautiful Alert Notification */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          alert.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : alert.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        } border-2 rounded-2xl shadow-lg p-4 transform transition-all duration-300 ease-in-out`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              alert.type === 'success' 
                ? 'bg-green-100 text-green-600' 
                : alert.type === 'error'
                ? 'bg-red-100 text-red-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : alert.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{alert.message}</p>
            </div>
            <button
              onClick={() => setAlert({ show: false, message: '', type: '' })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Beautiful Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="p-6 text-center">
              {/* Warning Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete Medication
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{deleteConfirm.medication?.medName}"</strong>? This action cannot be undone.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={hideDeleteConfirm}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteMedication}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              My Medications
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your prescribed medications and schedules</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                cancelForm();
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 justify-center lg:justify-start w-full lg:w-auto"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <span className="text-xl">{showAddForm ? '✕' : '+'}</span>
            </div>
            <span>{showAddForm ? 'Cancel' : 'Add Medication'}</span>
          </button>
        </div>

        {/* Add/Edit Medication Form */}
        {showAddForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100/50 p-4 sm:p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-xl">
                <span className="text-blue-600 text-xl">
                  {editingMedication ? '✏️' : '➕'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    name="medName"
                    value={formData.medName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Type *
                  </label>
                  <select
                    name="medicationType"
                    value={formData.medicationType}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
                    style={{ maxWidth: '100%' }}
                  >
                    {allowedMedicationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Frequency (hours) *
                  </label>
                  <input
                    type="number"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                    min="1"
                    max="24"
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g., 6"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Times Per Day *
                  </label>
                  <input
                    type="number"
                    name="timesPerDay"
                    value={formData.timesPerDay}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="e.g., 4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Reminder Times *
                </label>
                <div className="space-y-3">
                  {formData.reminderTimes.map((time, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                        step="300" // 5-minute intervals
                        list="common-times"
                      />
                      <datalist id="common-times">
                        <option value="06:00" />
                        <option value="08:00" />
                        <option value="12:00" />
                        <option value="14:00" />
                        <option value="18:00" />
                        <option value="20:00" />
                        <option value="22:00" />
                      </datalist>
                      {formData.reminderTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReminderTime(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
                        >
                          <span>🗑️</span>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addReminderTime}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add Another Time
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                  placeholder="e.g., Take with food, Avoid alcohol, etc."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingMedication ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                    </svg>
                    <span>{editingMedication ? 'Update Medication' : 'Add Medication'}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-6 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Medications List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {medications.length === 0 ? (
            <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-100/50 p-8 sm:p-12 text-center">
              <p className="text-gray-500 text-lg font-medium">No medications added yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Add Medication" to start managing your health</p>
            </div>
          ) : (
            medications.map((med) => (
              <MedicationCard 
                key={med._id} 
                medication={med} 
                onDelete={showDeleteConfirm}
                onEdit={editMedication}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const MedicationCard = ({ medication, onDelete, onEdit }) => {
  const getTypeColor = (type) => {
    const colors = {
      'Painkiller': 'from-blue-500 to-cyan-500',
      'Antibiotic': 'from-purple-500 to-indigo-500',
      'Anti-inflammatory': 'from-orange-500 to-red-500',
      'Other': 'from-gray-500 to-slate-500'
    };
    return colors[type] || colors['Other'];
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Painkiller': '💊',
      'Antibiotic': '🦠',
      'Anti-inflammatory': '🔥',
      'Other': '💊'
    };
    return icons[type] || icons['Other'];
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-100/50 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className={`bg-gradient-to-br ${getTypeColor(medication.medicationType)} text-white p-3 rounded-xl shadow-lg`}>
            <span className="text-xl">{getTypeIcon(medication.medicationType)}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{medication.medName}</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              medication.medicationType === 'Painkiller' ? 'bg-blue-100 text-blue-700' :
              medication.medicationType === 'Antibiotic' ? 'bg-purple-100 text-purple-700' :
              medication.medicationType === 'Anti-inflammatory' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {medication.medicationType}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{medication.dosage}</p>
          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {medication.timesPerDay}x daily
          </p>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">Start Date</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(medication.startDate).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">End Date</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(medication.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Reminder Times */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Reminder Times
        </p>
        <div className="flex flex-wrap gap-2">
          {medication.reminderTimes.map((time, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
              {time}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {medication.instructions && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 p-4 rounded-xl mb-4">
          <p className="text-sm text-blue-800 font-medium">
            <span className="font-semibold">Instructions:</span> {medication.instructions}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onEdit(medication)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete(medication)}
          className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default Medications;