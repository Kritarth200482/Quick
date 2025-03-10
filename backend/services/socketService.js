const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join user to their personal room for targeted updates
    socket.join(`user:${socket.user.id}`);
    
    // Join role-based rooms
    if (socket.user.role === 'admin') {
      socket.join('admins');
    } else if (socket.user.role === 'delivery') {
      socket.join('delivery');
    }
    
    // Listen for location updates from delivery personnel
    socket.on('updateDeliveryLocation', (data) => {
      // Update order with new location and notify customer
      updateOrderLocation(data.orderId, data.location)
        .then(() => {
          emitToCustomer(data.customerId, 'deliveryLocationUpdate', {
            orderId: data.orderId,
            location: data.location,
          });
        })
        .catch(err => console.error('Error updating location:', err));
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
  
  return io;
};

// Emit event to a specific customer
const emitToCustomer = (customerId, event, data) => {
  if (io) {
    io.to(`user:${customerId}`).emit(event, data);
  }
};

// Emit event to all connected clients with a specific role
const emitToRole = (role, event, data) => {
  if (io) {
    io.to(role).emit(event, data);
  }
};

// Broadcast order status update
const broadcastOrderUpdate = (order) => {
  if (io) {
    // Notify the customer
    emitToCustomer(order.userId, 'orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt,
      currentLocation: order.currentLocation,
      estimatedDelivery: order.estimatedDelivery,
    });
    
    // Notify delivery personnel if assigned
    if (order.deliveryPersonId) {
      emitToCustomer(order.deliveryPersonId, 'assignedOrderUpdate', {
        orderId: order._id,
        status: order.status,
      });
    }
    
    // Notify admins
    emitToRole('admins', 'orderStatusUpdate', {
      orderId: order._id,
      userId: order.userId,
      status: order.status,
      updatedAt: order.updatedAt,
    });
  }
};

module.exports = {
  initializeSocket,
  emitToCustomer,
  emitToRole,
  broadcastOrderUpdate,
};
