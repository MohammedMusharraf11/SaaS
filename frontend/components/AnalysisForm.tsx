'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AnalysisForm = () => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    setLoading(true);
    // Clean the domain input
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    router.push(`/analysis/${cleanDomain}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Analyze Your Website</h2>
        <div className="mb-4">
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
            Enter website URL
          </label>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Analyzing...' : 'Analyze Now'}
        </button>
      </form>
    </div>
  );
};

export default AnalysisForm;