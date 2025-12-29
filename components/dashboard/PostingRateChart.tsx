// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 動態導入 Recharts 以避免 SSR hydration 錯誤
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

interface PostingRateData {
  percentage: number;
  available: number;
  total: number;
}

const COLORS = ['#3b82f6', '#e5e7eb'];

export default function PostingRateChart() {
  const [data, setData] = useState<PostingRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PostingRateChart.tsx:40',message:'Component render start',data:{mounted,loading,hasData:!!data,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
  }
  // #endregion

  useEffect(() => {
    setMounted(true);
    // 不再自動初始化假數據
    // 延遲獲取數據，確保 localStorage 已初始化
    setTimeout(() => {
      fetchData();
    }, 100);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 從 localStorage 獲取數據
      const { propertyStorage } = await import('@/lib/storage');
      const properties = propertyStorage.getAll();
      
      const totalProperties = properties.length;
      const rentedProperties = properties.filter((p: any) => p.status === 'HOLDING').length;
      const availableProperties = totalProperties - rentedProperties;
      const postingRate = totalProperties > 0 
        ? Math.round((availableProperties / totalProperties) * 100) 
        : 0;

      setData({
        percentage: postingRate,
        available: availableProperties,
        total: totalProperties,
      });
    } catch (error) {
      console.error('Failed to fetch posting rate:', error);
    } finally {
      setLoading(false);
    }
  };

  // 確保服務器和客戶端初始渲染一致 - 如果未掛載，返回 null 而不是 loading skeleton
  if (!mounted) {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PostingRateChart.tsx:65',message:'Not mounted yet, returning null',data:{mounted,loading,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A,B'})}).catch(()=>{});
    }
    // #endregion
    return null;
  }

  if (loading) {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PostingRateChart.tsx:75',message:'Rendering loading skeleton',data:{mounted,loading,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">招租廣告刊登率</h3>
        <div className="text-center py-12 text-gray-500">暫無數據</div>
      </div>
    );
  }

  const chartData = [
    { name: '已出租', value: data.total - data.available },
    { name: '可招租', value: data.available },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">招租廣告刊登率</h3>
      
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-gray-900">{data.percentage}%</p>
        <p className="text-sm text-gray-600">可招租比例</p>
        <div className="mt-2 flex justify-center space-x-4 text-sm">
          <span className="text-gray-600">可招租: <span className="font-semibold">{data.available}</span></span>
          <span className="text-gray-600">總數: <span className="font-semibold">{data.total}</span></span>
        </div>
      </div>
    </div>
  );
}
