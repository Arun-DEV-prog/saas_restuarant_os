const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const url = require("url");

dotenv.config();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Create HTTP server
const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
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

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      FRONTEND_URL,
      "https://saas-frontend-gules.vercel.app", // Your Vercel URL
    ],
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

// Health check endpoint
const app = require("http").createServer();
app.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 Socket.IO Server Ready!          ║
╠═══════════════════════════════════════╣
║   ➜ Port:     ${PORT.toString().padEnd(24)}║
║   ➜ CORS:     ${FRONTEND_URL.slice(0, 20).padEnd(24)}║
╚═══════════════════════════════════════╝
  `);
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
