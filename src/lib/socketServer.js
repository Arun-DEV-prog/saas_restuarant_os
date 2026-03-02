const socketIo = require("socket.io");

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @param {Object} options - Socket.IO configuration options
 */
function initializeSocket(server, options = {}) {
  if (io) {
    console.log("Socket.IO already initialized");
    return io;
  }

  const defaultOptions = {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  };

  io = socketIo(server, { ...defaultOptions, ...options });

  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // Join restaurant-specific room
    socket.on("join-restaurant", (restaurantId) => {
      socket.join(`restaurant-${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant-${restaurantId}`);
    });

    // Leave restaurant room
    socket.on("leave-restaurant", (restaurantId) => {
      socket.leave(`restaurant-${restaurantId}`);
      console.log(`Socket ${socket.id} left restaurant-${restaurantId}`);
    });

    // Handle order updates
    socket.on("order-update", (data) => {
      console.log("Order update received:", data);
      if (data.restaurantId) {
        io.to(`restaurant-${data.restaurantId}`).emit("order-updated", data);
      }
    });

    // Handle menu updates
    socket.on("menu-update", (data) => {
      console.log("Menu update received:", data);
      if (data.restaurantId) {
        io.to(`restaurant-${data.restaurantId}`).emit("menu-updated", data);
      }
    });

    // Handle table updates
    socket.on("table-update", (data) => {
      console.log("Table update received:", data);
      if (data.restaurantId) {
        io.to(`restaurant-${data.restaurantId}`).emit("table-updated", data);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log("🚀 Socket.IO server initialized");
  return io;
}

/**
 * Get the Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
}

/**
 * Emit event to specific restaurant room
 */
function emitToRestaurant(restaurantId, event, data) {
  if (!io) {
    console.warn("Socket.IO not initialized");
    return;
  }
  io.to(`restaurant-${restaurantId}`).emit(event, data);
}

/**
 * Emit event to all connected clients
 */
function emitToAll(event, data) {
  if (!io) {
    console.warn("Socket.IO not initialized");
    return;
  }
  io.emit(event, data);
}

/**
 * Close Socket.IO server
 */
function closeSocket() {
  if (io) {
    io.close();
    io = null;
    console.log("Socket.IO server closed");
  }
}

module.exports = {
  initializeSocket,
  getIO,
  getSocketServer: getIO, // Alias for compatibility
  emitToRestaurant,
  emitToAll,
  closeSocket,
};
