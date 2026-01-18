import { Edit, Trash2, Calendar, Tag } from 'lucide-react';

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isIncome = transaction.type === 'income';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-gray-900">{transaction.title}</h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isIncome
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {transaction.type}
            </span>
          </div>
          
          {transaction.description && (
            <p className="text-sm text-gray-600 mb-3">{transaction.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Tag size={14} />
              <span>{transaction.category_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(transaction.transaction_date)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div
            className={`text-lg font-semibold ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit transaction"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(transaction)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete transaction"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;