const { emitToCustomer, emitToRole } = require('./socketService');

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_STATUS: 'ORDER_STATUS',
  PAYMENT_STATUS: 'PAYMENT_STATUS',
  DELIVERY_UPDATE: 'DELIVERY_UPDATE',
  STOCK_ALERT: 'STOCK_ALERT',
  PRICE_DROP: 'PRICE_DROP',
  GENERAL: 'GENERAL'
};


const notificationStore = new Map();


const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  role = null
}) => {
  const notification = {
    id: Date.now().toString(),
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
  };

  if (!notificationStore.has(userId)) {
    notificationStore.set(userId, []);
  }
  notificationStore.get(userId).unshift(notification);


  if (role) {
    emitToRole(role, 'newNotification', notification);
  } else {
    emitToCustomer(userId, 'newNotification', notification);
  }

  return notification;
};


const sendOrderStatusNotification = async (order, userId) => {
  const statusMessages = {
    placed: 'Your order has been successfully placed',
    processing: 'Your order is being processed',
    out_for_delivery: 'Your order is out for delivery',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled'
  };

  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title: 'Order Update',
    message: statusMessages[order.status],
    data: {
      orderId: order._id,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery
    }
  });
};


const sendPaymentNotification = async (payment, userId) => {
  const statusMessages = {
    completed: 'Payment successful',
    failed: 'Payment failed',
    refunded: 'Payment has been refunded'
  };

  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.PAYMENT_STATUS,
    title: 'Payment Update',
    message: statusMessages[payment.status],
    data: {
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status
    }
  });
};

/**
 * Send delivery update notification
 */
const sendDeliveryNotification = async (orderId, location, userId) => {
  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.DELIVERY_UPDATE,
    title: 'Delivery Update',
    message: 'Your delivery person is on the way',
    data: {
      orderId,
      currentLocation: location
    }
  });
};


const sendLowStockAlert = async (product) => {
  await createNotification({
    userId: null,
    type: NOTIFICATION_TYPES.STOCK_ALERT,
    title: 'Low Stock Alert',
    message: `${product.name} is running low on stock`,
    data: {
      productId: product._id,
      currentStock: product.stock
    },
    role: 'admins'
  });
};


const getUserNotifications = (userId) => {
  return notificationStore.get(userId) || [];
};

const markNotificationAsRead = (userId, notificationId) => {
  const userNotifications = notificationStore.get(userId);
  if (userNotifications) {
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      emitToCustomer(userId, 'notificationRead', { notificationId });
    }
  }
};


const clearUserNotifications = (userId) => {
  notificationStore.delete(userId);
  emitToCustomer(userId, 'notificationsCleared');
};

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  sendOrderStatusNotification,
  sendPaymentNotification,
  sendDeliveryNotification,
  sendLowStockAlert,
  getUserNotifications,
  markNotificationAsRead,
  clearUserNotifications
}; 