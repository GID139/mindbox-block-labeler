// Mock data for previewing Mindbox email templates

export const mindboxMockData = {
  customer: {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan.petrov@example.com',
    phone: '+7 (900) 123-45-67',
    birthDate: '1990-05-15',
  },
  
  order: {
    id: 'ORD-12345',
    date: '2025-01-15',
    totalAmount: 5490,
    currency: '₽',
    status: 'Confirmed',
    items: [
      {
        id: '1',
        name: 'Premium Product A',
        price: 1990,
        quantity: 2,
        imageUrl: 'https://mindbox.ru/build/assets/images/m-green_Journal-C66qTIQ0.svg',
      },
      {
        id: '2',
        name: 'Essential Product B',
        price: 1510,
        quantity: 1,
        imageUrl: 'https://mindbox.ru/build/assets/images/m-green_Journal-C66qTIQ0.svg',
      },
    ],
    shippingAddress: {
      street: 'Тверская ул., д. 10',
      city: 'Москва',
      postalCode: '125009',
      country: 'Россия',
    },
  },
  
  promotion: {
    code: 'WELCOME20',
    discount: 20,
    validUntil: '2025-12-31',
    description: 'Скидка 20% на первый заказ',
  },
  
  recommendations: [
    {
      id: '101',
      name: 'Recommended Product 1',
      price: 2990,
      imageUrl: 'https://mindbox.ru/build/assets/images/m-green_Journal-C66qTIQ0.svg',
    },
    {
      id: '102',
      name: 'Recommended Product 2',
      price: 3490,
      imageUrl: 'https://mindbox.ru/build/assets/images/m-green_Journal-C66qTIQ0.svg',
    },
  ],
};

// Function to replace Mindbox variables in HTML with mock data
export function applyMockData(html: string): string {
  let result = html;
  
  // Customer data
  result = result.replace(/\$\{customer\.firstName\}/g, mindboxMockData.customer.firstName);
  result = result.replace(/\$\{customer\.lastName\}/g, mindboxMockData.customer.lastName);
  result = result.replace(/\$\{customer\.email\}/g, mindboxMockData.customer.email);
  result = result.replace(/\$\{customer\.phone\}/g, mindboxMockData.customer.phone);
  
  // Order data
  result = result.replace(/\$\{order\.id\}/g, mindboxMockData.order.id);
  result = result.replace(/\$\{order\.date\}/g, mindboxMockData.order.date);
  result = result.replace(/\$\{order\.totalAmount\}/g, mindboxMockData.order.totalAmount.toString());
  result = result.replace(/\$\{order\.status\}/g, mindboxMockData.order.status);
  
  // Promotion data
  result = result.replace(/\$\{promotion\.code\}/g, mindboxMockData.promotion.code);
  result = result.replace(/\$\{promotion\.discount\}/g, mindboxMockData.promotion.discount.toString());
  result = result.replace(/\$\{promotion\.description\}/g, mindboxMockData.promotion.description);
  
  return result;
}
