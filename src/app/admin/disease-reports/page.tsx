'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Search, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface SecondaryFindings {
  severity: 'low' | 'medium' | 'high';
  affectedArea: string;
}

interface User {
  userID: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLogin: string;
  location: string;
  contact: string;
}

interface Diagnosis {
  diagnosisID: string;
  diseaseName: string;
  confidenceLevel: number;
  processingTime: number;
  diagnosisDate: string;
  secondaryFindings: SecondaryFindings;
  imageUrl: string;
  user: User;
  status: 'confirmed' | 'pending' | 'rejected';
}

const API_BASE_URL = 'http://20.62.15.198:8080';

export default function DiseaseReportsPage() {
  const [reports, setReports] = useState<Diagnosis[]>([]);
  const [filteredReports, setFilteredReports] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const maxRetries = 3;

  const fetchReports = async () => {
    try {
      const cookies = document.cookie;
      console.log('Cookies:', cookies);
      let token = cookies
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1];

      if (!token) {
        console.warn('No authToken found in cookies, checking localStorage');
        token = localStorage.getItem('authToken') || undefined;
      }

      console.log('localStorage authToken:', localStorage.getItem('authToken'));
      console.log('UserRole:', localStorage.getItem('userRole'));

      if (!token) {
        throw new Error(
          'Authentication required. Please <a href="/auth/signin" class="text-green-600 hover:underline">sign in</a> as an administrator.'
        );
      }

      console.log('Using token:', token.substring(0, 10) + '...');

      // Test API availability
      try {
        await fetch(`${API_BASE_URL}/`, { method: 'HEAD' });
        console.log('API server is reachable');
      } catch (pingErr) {
        console.warn('API server ping failed:', pingErr);
      }

      const response = await fetch(`${API_BASE_URL}/api/diagnoses/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('API Response Status:', response.status);

      if (response.status === 401) {
        throw new Error(
          'Authentication required. Please <a href="/auth/signin" class="text-green-600 hover:underline">sign in</a> as an administrator.'
        );
      }
      if (response.status === 403) {
        throw new Error('Access denied. Administrator role required.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(
          errorData.message || `Failed to fetch disease reports (Status: ${response.status})`
        );
      }

      const data: Diagnosis[] = await response.json();
      setReports(data);
      setFilteredReports(data);
      setError(undefined);
      setRetryCount(0);
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      let errorMessage: string;
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage =
          'Unable to connect to the server. Please check your network connection or ensure the server is running at <a href="http://20.62.15.198:8080" class="text-green-600 hover:underline">http://20.62.15.198:8080</a>.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Failed to load reports';
      }

      if (retryCount < maxRetries && errorMessage.includes('Unable to connect')) {
        console.log(`Retrying fetch... Attempt ${retryCount + 2}/${maxRetries}`);
        setRetryCount(retryCount + 1);
      } else {
        setError(errorMessage);
        setIsLoading(false);
        if (errorMessage.includes('Authentication required')) {
          setTimeout(() => router.push('/auth/signin'), 5000);
        }
      }
    }
  };

  const handleSignOut = () => {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    router.push('/auth/signin');
  };

  useEffect(() => {
    fetchReports();
  }, [router, retryCount]);

  useEffect(() => {
    let filtered = [...reports];

    if (diseaseFilter !== 'all') {
      filtered = filtered.filter((report) => report.diseaseName === diseaseFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((report) => report.secondaryFindings.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.diagnosisID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, diseaseFilter, severityFilter, statusFilter, searchTerm]);

  const getUniqueDiseases = () => {
    const diseases = new Set(reports.map((report) => report.diseaseName));
    return Array.from(diseases).sort();
  };

  const exportReports = () => {
    const csv = [
      [
        'Diagnosis ID',
        'Username',
        'Email',
        'Disease Name',
        'Confidence Level',
        'Severity',
        'Affected Area',
        'Processing Time',
        'Diagnosis Date',
        'Status',
        'Image URL',
      ],
      ...filteredReports.map((report) => [
        report.diagnosisID,
        report.user.username,
        report.user.email,
        report.diseaseName,
        report.confidenceLevel.toFixed(1),
        report.secondaryFindings.severity,
        report.secondaryFindings.affectedArea,
        report.processingTime,
        new Date(report.diagnosisDate).toLocaleString(),
        report.status,
        report.imageUrl,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disease-reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Disease Diagnosis Reports</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all disease detection reports</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportReports}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          {error && (
            <button
              onClick={() => fetchReports()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
          {error?.includes('Authentication required') && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2"
          dangerouslySetInnerHTML={{ __html: error }}
        />
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <select
          value={diseaseFilter}
          onChange={(e) => setDiseaseFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Diseases</option>
          {getUniqueDiseases().map((disease) => (
            <option key={disease} value={disease}>
              {disease}
            </option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disease
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affected Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.diagnosisID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.diagnosisID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.user.username}</div>
                      <div className="text-sm text-gray-500">{report.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.diseaseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.confidenceLevel.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.secondaryFindings.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : report.secondaryFindings.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.secondaryFindings.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.secondaryFindings.affectedArea}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.processingTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.diagnosisDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewImage(report.imageUrl)}
                        className="text-green-600 hover:text-green-800"
                        title="View Image"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Diagnosis Image</h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative h-[60vh]">
              <Image
                src={selectedImage}
                alt="Diagnosis image"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}