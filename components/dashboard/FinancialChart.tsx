// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 動態導入 Recharts 以避免 SSR hydration 錯誤
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer as any),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart as any),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line as any),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis as any),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis as any),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid as any),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip as any),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend as any),
  { ssr: false }
);

interface FinancialData {
  period: string;
  chartData: Array<{
    date: string;
    income: number;
    expense: number;
    profit: number;
  }>;
  totals: {
    income: number;
    expense: number;
    profit: number;
  };
}

export default function FinancialChart() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'month'>('month');
  const [mounted, setMounted] = useState(false);

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FinancialChart.tsx:55',message:'Component render start',data:{mounted,loading,hasData:!!data,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
  }
  // #endregion

  useEffect(() => {
    setMounted(true);
    // 不再自動初始化假數據
    // 延遲獲取數據，確保 localStorage 已初始化
    setTimeout(() => {
      fetchFinancialData();
    }, 100);
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      // 從 localStorage 獲取交易數據
      const { transactionStorage } = await import('@/lib/storage');
      const transactions = transactionStorage.getAll();
      
      // 過濾已付款的交易
      const paidTransactions = transactions.filter((t: any) => t.status === 'PAID' && t.paidDate);
      
      if (paidTransactions.length === 0) {
        setLoading(false);
        return;
      }

      // 按日期分組
      const incomeByDate: Record<string, number> = {};
      const expenseByDate: Record<string, number> = {};

      paidTransactions.forEach((t: any) => {
        if (t.paidDate) {
          const date = new Date(t.paidDate);
          const key = period === 'day' 
            ? date.toISOString().split('T')[0]
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (t.type === 'INCOME') {
            incomeByDate[key] = (incomeByDate[key] || 0) + t.amount;
          } else if (t.type === 'EXPENSE') {
            expenseByDate[key] = (expenseByDate[key] || 0) + t.amount;
          }
        }
      });

      // 轉換為數組格式
      const allDates = new Set([...Object.keys(incomeByDate), ...Object.keys(expenseByDate)]);
      const chartData = Array.from(allDates)
        .sort()
        .map((date) => ({
          date,
          income: incomeByDate[date] || 0,
          expense: expenseByDate[date] || 0,
          profit: (incomeByDate[date] || 0) - (expenseByDate[date] || 0),
        }));

      const totalIncome = paidTransactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalExpense = paidTransactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      setData({
        period,
        chartData,
        totals: {
          income: totalIncome,
          expense: totalExpense,
          profit: totalIncome - totalExpense,
        },
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 確保服務器和客戶端初始渲染一致 - 如果未掛載，返回 null 而不是 loading skeleton
  if (!mounted) {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FinancialChart.tsx:81',message:'Not mounted yet, returning null',data:{mounted,loading,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A,B'})}).catch(()=>{});
    }
    // #endregion
    return null;
  }

  if (loading) {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FinancialChart.tsx:90',message:'Rendering loading skeleton',data:{mounted,loading,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">收支情況</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setPeriod('day')}
              className={`px-3 py-1 text-sm rounded transition ${
                period === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              每日
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 text-sm rounded transition ${
                period === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              每月
            </button>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">
          暫無數據
        </div>
      </div>
    );
  }

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7244/ingest/089f15c6-1356-43d2-915f-d9d19018b5c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FinancialChart.tsx:106',message:'Rendering chart with data',data:{mounted,loading,hasData:!!data,dataLength:data?.chartData?.length||0,isClient:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">收支情況</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1 text-sm rounded transition ${
              period === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            每日
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 text-sm rounded transition ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            每月
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">總收入</p>
          <p className="text-lg font-semibold text-green-600">
            ${data.totals.income.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">總支出</p>
          <p className="text-lg font-semibold text-red-600">
            ${data.totals.expense.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">淨利潤</p>
          <p className={`text-lg font-semibold ${data.totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${data.totals.profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* @ts-ignore - Recharts type definitions issue */}
      <ResponsiveContainer width="100%" height={300}>
        {/* @ts-ignore - Recharts type definitions issue */}
        <LineChart data={data.chartData}>
          {/* @ts-ignore - Recharts type definitions issue */}
          <CartesianGrid strokeDasharray="3 3" />
          {/* @ts-ignore - Recharts type definitions issue */}
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          {/* @ts-ignore - Recharts type definitions issue */}
          <YAxis tick={{ fontSize: 12 }} />
          {/* @ts-ignore - Recharts type definitions issue */}
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            labelStyle={{ color: '#374151' }}
          />
          {/* @ts-ignore - Recharts type definitions issue */}
          <Legend />
          {/* @ts-ignore - Recharts type definitions issue */}
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            name="收入"
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="支出"
          />
          {/* @ts-ignore - Recharts type definitions issue */}
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="淨利潤"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
