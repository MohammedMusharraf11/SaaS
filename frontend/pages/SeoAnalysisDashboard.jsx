import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Import chart components
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import CoreWebVitalsDisplay from '../components/charts/CoreWebVitalsDisplay';
import PerformanceTimeline from '../components/charts/PerformanceTimeline';
import ResourceBreakdown from '../components/charts/ResourceBreakdown';

const SeoAnalysisDashboard = () => {
  const { domain } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/lighthouse/${domain}`);
        setSeoData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load SEO analysis data');
        setLoading(false);
      }
    };

    if (domain) {
      fetchData();
    }
  }, [domain]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  if (!seoData) return <div>No data available</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">SEO Analysis for {domain}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryDonutChart data={seoData} />
        <CoreWebVitalsDisplay data={seoData} />
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <PerformanceTimeline data={seoData} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResourceBreakdown data={seoData} />
      </div>
    </div>
  );
};

export default SeoAnalysisDashboard;