import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'day' or 'month'

    const where: any = {};
    
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      where.companyId = user.companyId;
    }

    const now = new Date();
    let startDate: Date;

    if (period === 'day') {
      // 過去30天的每日數據
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // 過去12個月的每月數據
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
    }

    // 獲取收入數據
    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        ...where,
        type: 'INCOME',
        status: 'PAID',
        paidDate: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    // 獲取支出數據
    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        ...where,
        type: 'EXPENSE',
        status: 'PAID',
        paidDate: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    // 按日期分組數據
    const incomeByDate: Record<string, number> = {};
    const expenseByDate: Record<string, number> = {};

    incomeTransactions.forEach((t) => {
      if (t.paidDate) {
        const key = period === 'day' 
          ? t.paidDate.toISOString().split('T')[0]
          : `${t.paidDate.getFullYear()}-${String(t.paidDate.getMonth() + 1).padStart(2, '0')}`;
        incomeByDate[key] = (incomeByDate[key] || 0) + t.amount;
      }
    });

    expenseTransactions.forEach((t) => {
      if (t.paidDate) {
        const key = period === 'day' 
          ? t.paidDate.toISOString().split('T')[0]
          : `${t.paidDate.getFullYear()}-${String(t.paidDate.getMonth() + 1).padStart(2, '0')}`;
        expenseByDate[key] = (expenseByDate[key] || 0) + t.amount;
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

    // 計算總計
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalProfit = totalIncome - totalExpense;

    return NextResponse.json({
      period,
      chartData,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        profit: totalProfit,
      },
    });
  } catch (error) {
    console.error('Get financial data error:', error);
    return NextResponse.json(
      { error: '獲取財務數據失敗' },
      { status: 500 }
    );
  }
}

