import React, { useState, useEffect } from 'react';
import { adherenceAPI, reportAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [markedReminders, setMarkedReminders] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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

  const fetchData = async () => {
    try {
      const [remindersRes, statsRes] = await Promise.all([
        adherenceAPI.getTodayReminders(),
        reportAPI.getStats()
      ]);

      const remindersData = remindersRes.data.data;
      setReminders(remindersData);
      setStats(statsRes.data.data);
      
      const savedMarked = localStorage.getItem('markedReminders');
      if (savedMarked) {
        setMarkedReminders(JSON.parse(savedMarked));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Error loading your data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markDose = async (medicationId, timeString, status) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Check if current time has reached or passed the scheduled time
      if (currentTime < scheduledTime) {
        showAlert('You can only mark medications when the scheduled time has arrived', 'warning');
        return;
      }

      await adherenceAPI.createLog({
        medicationId,
        scheduledTime: scheduledTime.toISOString(),
        status,
        notes: ''
      });

      const reminderKey = `${medicationId}-${timeString}`;
      const newMarked = {
        ...markedReminders,
        [reminderKey]: status
      };
      setMarkedReminders(newMarked);
      localStorage.setItem('markedReminders', JSON.stringify(newMarked));

      fetchData();
      showAlert(`Dose marked as ${status}!`, 'success');
    } catch (error) {
      console.error('Error marking dose:', error);
      showAlert('Failed to mark dose. Please try again.', 'error');
    }
  };

  const getReminderStatus = (medicationId, timeString) => {
    const reminderKey = `${medicationId}-${timeString}`;
    return markedReminders[reminderKey];
  };

  // Check if medication can be marked (time has arrived or passed)
  const canMarkMedication = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return currentTime >= scheduledTime;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500"></div>
            <p className="text-blue-600 font-medium">Loading your health data...</p>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Health Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's your medication overview for today.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-blue-100">
              <p className="text-sm text-gray-500">Current Time</p>
              <p className="text-xl font-semibold text-blue-700">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Adherence Rate"
            value={stats ? `${stats.adherenceRate}%` : '0%'}
            subtitle="This week"
            trend="up"
          />
          <StatCard
            title="Doses Taken"
            value={stats ? stats.taken : 0}
            subtitle="On time"
            trend="up"
          />
          <StatCard
            title="Doses Missed"
            value={stats ? stats.missed : 0}
            subtitle="Need attention"
            trend="down"
          />
          <StatCard
            title="Today's Reminders"
            value={reminders.length}
            subtitle="Scheduled"
            trend="neutral"
          />
        </div>

        {/* Today's Schedule */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-100/50 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Today's Medication Schedule
            </h2>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">No medications scheduled for today</p>
              <p className="text-gray-400 text-sm mt-2">Add medications to get started with your health journey</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder, index) => (
                <ReminderCard
                  key={index}
                  reminder={reminder}
                  currentTime={currentTime}
                  onMark={markDose}
                  status={getReminderStatus(reminder.medication._id, reminder.timeString)}
                  canMark={canMarkMedication(reminder.timeString)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, trend, color, icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className={`bg-gradient-to-br ${color} text-white p-4 rounded-xl text-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const ReminderCard = ({ reminder, currentTime, onMark, status, canMark }) => {
  const medication = reminder.medication;
  const timeString = reminder.timeString;
  
  const [hours, minutes] = timeString.split(':');
  const reminderTime = new Date();
  reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const isPast = reminderTime < currentTime;
  const isNow = Math.abs(reminderTime - currentTime) < 300000; // Within 5 minutes
  
  let statusConfig = {
    border: 'border-blue-200',
    bg: 'bg-white',
    accent: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700'
  };
  
  if (isNow && !status) {
    statusConfig = {
      border: 'border-yellow-300 shadow-lg shadow-yellow-200/50',
      bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      accent: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800 animate-pulse'
    };
  } else if (isPast && !status) {
    statusConfig = {
      border: 'border-red-200',
      bg: 'bg-gradient-to-r from-red-50 to-orange-50',
      accent: 'text-red-600',
      badge: 'bg-red-100 text-red-700'
    };
  } else if (status) {
    // Different styling for marked medications based on status
    if (status === 'Taken') {
      statusConfig = {
        border: 'border-green-200',
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        accent: 'text-green-600',
        badge: 'bg-green-100 text-green-700'
      };
    } else if (status === 'Missed') {
      statusConfig = {
        border: 'border-red-200',
        bg: 'bg-gradient-to-r from-red-50 to-orange-50',
        accent: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      };
    }
  }
  
  return (
    <div className={`${statusConfig.bg} border-2 ${statusConfig.border} rounded-2xl p-5 transition-all duration-300 hover:shadow-md`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">
                  {medication.medName}
                </span>
                <span className={`ml-3 text-xs px-3 py-1 rounded-full font-medium ${statusConfig.badge}`}>
                  {medication.medicationType}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong className="text-gray-700">Dosage:</strong> {medication.dosage}
              </p>
              
              {medication.instructions && (
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-700">Instructions:</strong> {medication.instructions}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-800">
                  {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isNow && !status && (
                  <div className="text-xs font-semibold px-2 py-1 rounded-full mt-1 bg-yellow-200 text-yellow-800 animate-pulse">
                    TIME TO TAKE MEDICATION!
                  </div>
                )}
                {!canMark && !status && (
                  <div className="text-xs font-semibold px-2 py-1 rounded-full mt-1 bg-gray-200 text-gray-700">
                    WAITING FOR SCHEDULED TIME
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons or Status Display */}
        <div className="flex flex-row lg:flex-col gap-2 justify-end lg:justify-start">
          {status ? (
            // Show status badge when medication is marked
            <div className={`px-6 py-3 rounded-xl font-semibold text-center ${
              status === 'Taken' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 justify-center">
                {status === 'Taken' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Taken</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Missed</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1 opacity-75">Marked</p>
            </div>
          ) : (
            // Show action buttons when medication is not marked
            <>
              <button
                onClick={() => onMark(medication._id, timeString, 'Taken')}
                disabled={!canMark}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md flex-1 lg:flex-none justify-center ${
                  canMark
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Taken</span>
              </button>
              <button
                onClick={() => onMark(medication._id, timeString, 'Missed')}
                disabled={!canMark}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md flex-1 lg:flex-none justify-center ${
                  canMark
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Missed</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;