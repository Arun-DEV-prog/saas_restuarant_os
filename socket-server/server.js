const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const url = require("url");

dotenv.config();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV || "development";

// Allowed origins for CORS - flexible for Railway/Vercel deployments
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  FRONTEND_URL,
  "https://saas-frontend-gules.vercel.app",
  // Allow Railway deployments dynamically
  ...(process.env.NEXT_PUBLIC_FRONTEND_URL
    ? [process.env.NEXT_PUBLIC_FRONTEND_URL]
    : []),
];

// Create HTTP server
const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "*";
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) || NODE_ENV === "development";

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Health check endpoint
  if (req.method === "GET" && parsedUrl.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        port: PORT,
      }),
    );
    return;
  }

  // Notification endpoint - receive events from backend APIs
  if (req.method === "POST" && parsedUrl.pathname === "/notify") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const { event, data } = payload;

        console.log(`📨 Received notification: ${event}`);

        if (event === "order-update") {
          const room = `restaurant-${data.restaurantId}`;
          console.log(`  → Broadcasting "order-updated" to room: ${room}`);
          io.to(room).emit("order-updated", {
            orderId: data.orderId || data._id,
            _id: data._id,
            status: data.status,
            updatedAt: data.updatedAt,
          });
        } else if (event === "order-create") {
          const room = `restaurant-${data.restaurantId}`;
          console.log(`  → Broadcasting "order-created" to room: ${room}`);
          io.to(room).emit("order-created", data);
        } else if (event === "table-update") {
          const room = `restaurant-${data.restaurantId}`;
          console.log(`  → Broadcasting "table-updated" to room: ${room}`);
          io.to(room).emit("table-updated", data);
        } else if (event === "menu-update") {
          const room = `restaurant-${data.restaurantId}`;
          console.log(`  → Broadcasting "menu-updated" to room: ${room}`);
          io.to(room).emit("menu-updated", data);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, event }));
      } catch (e) {
        console.error("Error processing notification:", e);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 404 for other paths
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// Initialize Socket.IO with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: NODE_ENV === "production" ? ALLOWED_ORIGINS : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  addTrailingSlash: false,
  maxHttpBufferSize: 1e6,
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join restaurant-specific room
  socket.on("join-restaurant", (restaurantId) => {
    if (!restaurantId) {
      console.warn(`⚠️ join-restaurant called without restaurantId`);
      return;
    }
    const room = `restaurant-${restaurantId}`;
    socket.join(room);
    console.log(`✅ Socket ${socket.id} joined room: ${room}`);
    socket.emit("joined-restaurant", { restaurantId, room });
  });

  // Leave restaurant room
  socket.on("leave-restaurant", (restaurantId) => {
    if (!restaurantId) return;
    const room = `restaurant-${restaurantId}`;
    socket.leave(room);
    console.log(`➡️ Socket ${socket.id} left room: ${room}`);
  });

  // Handle order updates from backend
  socket.on("order-update", (data) => {
    if (!data.restaurantId) {
      console.warn(`⚠️ order-update without restaurantId:`, data);
      return;
    }
    const room = `restaurant-${data.restaurantId}`;
    console.log(`📨 Order update received for room: ${room}`);
    io.to(room).emit("order-updated", {
      orderId: data.orderId || data._id,
      _id: data._id,
      status: data.status,
      updatedAt: data.updatedAt,
    });
  });

  // Handle order creation
  socket.on("order-create", (data) => {
    if (!data.restaurantId) {
      console.warn(`⚠️ order-create without restaurantId`);
      return;
    }
    const room = `restaurant-${data.restaurantId}`;
    console.log(`📨 Order created for room: ${room}`);
    io.to(room).emit("order-created", data);
  });

  // Handle table updates
  socket.on("table-update", (data) => {
    if (!data.restaurantId) return;
    const room = `restaurant-${data.restaurantId}`;
    io.to(room).emit("table-updated", data);
  });

  // Handle menu updates
  socket.on("menu-update", (data) => {
    if (!data.restaurantId) return;
    const room = `restaurant-${data.restaurantId}`;
    io.to(room).emit("menu-updated", data);
  });

  // Heartbeat/keep-alive
  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Socket.IO Server Started");
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log(`   CORS Origins: ${ALLOWED_ORIGINS.length} allowed`);
  console.log("✅ Ready to accept WebSocket connections");
  ALLOWED_ORIGINS.forEach((origin) => {
    console.log(`   • ${origin}`);
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Socket.IO server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Socket.IO server closed");
    process.exit(0);
  });
});
