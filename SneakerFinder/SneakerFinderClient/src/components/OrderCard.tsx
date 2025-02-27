import { useTranslation } from 'react-i18next';

interface OrderCardProps {
  orderNumber: string;
  date: string;
  status: string;
  products: {
    name: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
}

export default function OrderCard({ orderNumber, date, status, products, totalAmount }: OrderCardProps) {
  const { t } = useTranslation('orderCard');
  const statusKey = status.toLowerCase();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{t('orderNumber')}{orderNumber}</h3>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium
          ${statusKey === 'delivered' ? 'bg-green-100 text-green-800' :
            statusKey === 'processing' ? 'bg-blue-100 text-blue-800' :
            statusKey === 'paid' ? 'bg-purple-100 text-purple-800' :
            statusKey === 'sent' ? 'bg-indigo-100 text-indigo-800' :
            statusKey === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'}`}>
          {t(`status.${statusKey}`)}
        </div>
      </div>
      
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">{t('size')}: {product.size}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800">${product.price.toFixed(2)} {t('quantity')} {product.quantity}</p>
              <p className="text-sm font-medium">${(product.price * product.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-200">
        <span className="text-gray-600 font-medium">{t('totalAmount')}:</span>
        <span className="text-lg font-semibold text-gray-800">${totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}