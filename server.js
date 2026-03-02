const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO with custom path
  const io = new Server(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.FRONTEND_URL || `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    addTrailingSlash: false,
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join restaurant-specific room
    socket.on("join-restaurant", (restaurantId) => {
      socket.join(`restaurant-${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant-${restaurantId}`);
      socket.emit("joined-restaurant", { restaurantId });
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

    // Handle new order notifications
    socket.on("new-order", (data) => {
      console.log("New order received:", data);
      if (data.restaurantId) {
        io.to(`restaurant-${data.restaurantId}`).emit("order-created", data);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Make io accessible globally
  global.io = io;

  // Server error handling
  server.on("error", (err) => {
    console.error("Server error:", err);
    throw err;
  });

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`
╔═══════════════════════════════════════╗
║   🚀 Server Ready!                    ║
╠═══════════════════════════════════════╣
║   ➜ Local:   http://${hostname}:${port.toString().padEnd(5)}      ║
║   ➜ Socket:  /api/socket              ║
║   ➜ Mode:    ${(dev ? "Development" : "Production").padEnd(11)}      ║
╚═══════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log("\n🛑 Shutting down gracefully...");
    server.close(() => {
      console.log("✅ HTTP server closed");
      io.close(() => {
        console.log("✅ Socket.IO closed");
        process.exit(0);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("❌ Forced shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
});
