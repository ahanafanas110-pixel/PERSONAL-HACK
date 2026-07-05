import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple file-based database for keys & admin password
  const KEYS_FILE = path.join(process.cwd(), "active_keys.json");
  const ADMIN_FILE = path.join(process.cwd(), "admin_password.json");

  // Helper to load keys
  const loadKeys = () => {
    try {
      if (fs.existsSync(KEYS_FILE)) {
        const data = fs.readFileSync(KEYS_FILE, "utf-8");
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Error loading keys:", e);
    }
    // Default seed keys if file doesn't exist
    const defaultSeeds = [
      {
        id: 'seed-1',
        code: 'dj2026',
        vipNum: 1,
        validUntil: 'alltime',
        maxUsers: -1,
        usedCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-2',
        code: 'raihanvip2',
        vipNum: 2,
        validUntil: 'alltime',
        maxUsers: -1,
        usedCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-3',
        code: 'ST26',
        vipNum: 3,
        validUntil: 'alltime',
        maxUsers: -1,
        usedCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-4',
        code: 'ST26',
        vipNum: 4,
        validUntil: 'alltime',
        maxUsers: -1,
        usedCount: 0,
        createdAt: new Date().toISOString()
      }
    ];
    try {
      fs.writeFileSync(KEYS_FILE, JSON.stringify(defaultSeeds, null, 2), "utf-8");
    } catch (err) {}
    return defaultSeeds;
  };

  // Helper to save keys
  const saveKeys = (keys: any) => {
    try {
      fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving keys:", e);
    }
  };

  // Helper to load admin password
  const loadAdminPassword = () => {
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        return fs.readFileSync(ADMIN_FILE, "utf-8").trim();
      }
    } catch (e) {
      console.error("Error loading admin password:", e);
    }
    return "SADMAN018"; // default
  };

  // Helper to save admin password
  const saveAdminPassword = (pwd: string) => {
    try {
      fs.writeFileSync(ADMIN_FILE, pwd.trim(), "utf-8");
    } catch (e) {
      console.error("Error saving admin password:", e);
    }
  };

  // Initialize data files
  loadKeys();
  if (!fs.existsSync(ADMIN_FILE)) {
    saveAdminPassword("SADMAN018");
  }

  // 1. Get all active password keys
  app.get("/api/passwords", (req, res) => {
    res.json(loadKeys());
  });

  // 2. Add a new password key
  app.post("/api/passwords", (req, res) => {
    const { vipNum, code, maxUsers, validityHours } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    let finalExpiry = 'alltime';
    if (validityHours !== 'alltime') {
      const hours = parseInt(validityHours) || 24;
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + hours);
      finalExpiry = expiryDate.toISOString();
    }

    const newKey = {
      id: 'key-' + Date.now(),
      code: code.trim(),
      vipNum: parseInt(vipNum) || 1,
      validUntil: finalExpiry,
      maxUsers: parseInt(maxUsers) ?? -1,
      usedCount: 0,
      createdAt: new Date().toISOString()
    };

    const keys = loadKeys();
    keys.push(newKey);
    saveKeys(keys);

    res.json(newKey);
  });

  // 3. Delete a password key
  app.delete("/api/passwords/:id", (req, res) => {
    const { id } = req.params;
    const keys = loadKeys();
    const updated = keys.filter((k: any) => k.id !== id);
    saveKeys(updated);
    res.json({ success: true });
  });

  // 4. Verify password for specific VIP hack screen
  app.post("/api/passwords/verify", (req, res) => {
    const { code, vipNum } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const keys = loadKeys();
    const cleanCode = code.trim();
    const num = parseInt(vipNum);

    const matchedKeyIndex = keys.findIndex((k: any) => 
      k.code === cleanCode && 
      k.vipNum === num && 
      (k.maxUsers === -1 || k.usedCount < k.maxUsers) &&
      (k.validUntil === 'alltime' || new Date(k.validUntil) > new Date())
    );

    if (matchedKeyIndex !== -1) {
      keys[matchedKeyIndex].usedCount += 1;
      saveKeys(keys);
      return res.json({ success: true, key: keys[matchedKeyIndex] });
    } else {
      return res.status(400).json({ error: "Invalid or expired key!" });
    }
  });

  // 5. Get admin password
  app.get("/api/admin/password", (req, res) => {
    res.json({ password: loadAdminPassword() });
  });

  // 6. Update admin password
  app.post("/api/admin/password", (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    saveAdminPassword(password);
    res.json({ success: true });
  });

  // Vite middleware for development or serving static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
