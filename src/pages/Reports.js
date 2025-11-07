import React, { useState, useEffect } from 'react';
import { reportAPI, adherenceAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [medicationWise, setMedicationWise] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchReports();
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

  const fetchReports = async () => {
    try {
      const [statsRes, medWiseRes, logsRes] = await Promise.all([
        reportAPI.getStats(),
        reportAPI.getMedicationWise(),
        adherenceAPI.getLogs()
      ]);

      setStats(statsRes.data.data);
      setMedicationWise(medWiseRes.data.data);
      setRecentLogs(logsRes.data.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching reports:', error);
      showAlert('Error loading reports data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500"></div>
            <p className="text-blue-600 font-medium">Loading your health reports...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Adherence Reports
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Track your medication adherence performance and health progress</p>
        </div>

        {/* Overall Statistics - Updated Design */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 text-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-500/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Overall Performance</h2>
                <p className="text-blue-200 mt-1">Your medication adherence overview</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              <StatItem 
                label="Total Doses" 
                value={stats?.total || 0} 
                gradient="from-blue-500 to-cyan-500"
                trend="neutral"
              />
              <StatItem 
                label="Taken" 
                value={stats?.taken || 0} 
                gradient="from-green-500 to-emerald-500"
                trend="up"
              />
              <StatItem 
                label="Missed" 
                value={stats?.missed || 0} 
                gradient="from-orange-500 to-red-500"
                trend="down"
              />
              <StatItem 
                label="Pending" 
                value={stats?.pending || 0} 
                gradient="from-gray-500 to-slate-500"
                trend="neutral"
              />
              <StatItem 
                label="Adherence Rate" 
                value={`${stats?.adherenceRate || 0}%`} 
                gradient="from-purple-500 to-indigo-500"
                trend="up"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Medication-Wise Adherence */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-100/50 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Medication-Wise Adherence</h2>
            </div>
            
            {medicationWise.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-medium">No medication data available yet</p>
                <p className="text-gray-400 text-sm mt-2">Start tracking your medications to see reports</p>
              </div>
            ) : (
              <div className="space-y-6">
                {medicationWise.map((item, index) => (
                  <MedicationCard key={index} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-100/50 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Last 10 entries
              </div>
            </div>
            
            {recentLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-medium">No activity recorded yet</p>
                <p className="text-gray-400 text-sm mt-2">Your medication logs will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <ActivityLog key={log._id} log={log} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, gradient, trend }) => (
  <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl mb-3 shadow-lg`}>
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {label === 'Total Doses' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
        {label === 'Taken' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
        {label === 'Missed' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
        {label === 'Pending' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {label === 'Adherence Rate' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
      </svg>
    </div>
    <p className="text-sm text-blue-200 mb-2 font-medium">{label}</p>
    <p className="text-2xl md:text-3xl font-bold mb-1">{value}</p>
    <div className="flex items-center justify-center gap-1">
      <span className={`text-xs ${
        trend === 'up' ? 'text-green-400' : 
        trend === 'down' ? 'text-red-400' : 'text-gray-400'
      }`}>
        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
      </span>
      <span className="text-xs text-blue-300">
        {trend === 'up' ? 'Good' : trend === 'down' ? 'Needs attention' : 'Stable'}
      </span>
    </div>
  </div>
);

const MedicationCard = ({ item }) => {
  const adherenceRate = item.stats.adherenceRate;
  
  const getAdherenceColor = (rate) => {
    if (rate >= 90) return 'from-green-500 to-emerald-500';
    if (rate >= 75) return 'from-yellow-500 to-amber-500';
    if (rate >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getAdherenceText = (rate) => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Good';
    if (rate >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-5 border border-blue-100 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{item.medication.name}</h3>
              <p className="text-sm text-gray-600">
                {item.medication.type} • {item.medication.dosage}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-11">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-lg font-bold text-gray-800">{item.stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Taken</p>
              <p className="text-lg font-bold text-green-600">{item.stats.taken}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Missed</p>
              <p className="text-lg font-bold text-red-600">{item.stats.missed}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-lg font-bold text-gray-600">{item.stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="text-center lg:text-right">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getAdherenceColor(adherenceRate)} text-white rounded-2xl shadow-lg mb-2`}>
            <span className="text-xl font-bold">{adherenceRate}%</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">{getAdherenceText(adherenceRate)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Adherence Progress</span>
          <span>{adherenceRate}% - {getAdherenceText(adherenceRate)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${getAdherenceColor(adherenceRate)} transition-all duration-1000 ease-out`}
            style={{ width: `${adherenceRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ActivityLog = ({ log }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Taken': {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-700',
        icon: '✅',
        badge: 'bg-green-100 text-green-700'
      },
      'Missed': {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: '❌',
        badge: 'bg-red-100 text-red-700'
      },
      'Pending': {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-700',
        icon: '⏳',
        badge: 'bg-gray-100 text-gray-700'
      }
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(log.status);

  return (
    <div className={`${statusConfig.bg} border-2 ${statusConfig.bg.replace('bg-', 'border-')} rounded-2xl p-4 hover:shadow-sm transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">
            {statusConfig.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {log.medicationId?.medName || 'Unknown Medication'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(log.scheduledTime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.badge}`}>
          {log.status}
        </span>
      </div>
    </div>
  );
};

export default Reports;