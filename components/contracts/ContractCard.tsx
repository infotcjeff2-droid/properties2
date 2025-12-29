'use client';

import Link from 'next/link';
import { FileText, Calendar, DollarSign } from 'lucide-react';

interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
  property?: any;
  tenant?: any;
}

interface ContractCardProps {
  contract: Contract;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

export default function ContractCard({ contract }: ContractCardProps) {
  const isExpiringSoon = () => {
    if (!contract.endDate) return false;
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return endDate <= sevenDaysLater && endDate >= now;
  };

  return (
    <Link href={`/contracts/${contract.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {contract.property?.name || `物業 ${contract.propertyId}`}
              </h3>
              <p className="text-sm text-gray-500">
                {contract.tenant?.name || `租客 ${contract.tenantId}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[contract.status] || 'bg-gray-100 text-gray-800'}`}>
              {contract.status === 'ACTIVE' ? '活躍' : contract.status === 'EXPIRED' ? '已過期' : '已終止'}
            </span>
            {isExpiringSoon() && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                即將到期
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {contract.rentAmount != null && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>月租金: ${contract.rentAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {contract.startDate && new Date(contract.startDate).toLocaleDateString('zh-TW')} - {contract.endDate && new Date(contract.endDate).toLocaleDateString('zh-TW')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

