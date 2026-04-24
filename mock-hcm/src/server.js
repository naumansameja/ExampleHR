const express = require("express");
const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "..", "data", "users.json");
const PORT = process.env.PORT || 3001;

function readUsersFromDisk() {
  const raw = fs.readFileSync(USERS_PATH, "utf8");
  return JSON.parse(raw);
}

function writeUsersToDisk(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2) + "\n", "utf8");
}

/** In-memory copy; synced to disk on successful leave application */
let users = readUsersFromDisk();

/** idempotencyKey -> { userId, leaveDays, appliedAt } */
const idempotencyRecords = new Map();

const app = express();
app.use(express.json());

app.get("/api/users", (_req, res) => {
  res.json({ users });
});

/**
 * Apply leave: deducts leaveDays from user's balance.
 * Headers: Idempotency-Key (required)
 * Body: { leaveDays: number }
 */
app.patch("/api/users/:userId/leave", (req, res) => {
  const idempotencyKey =
    req.header("Idempotency-Key") || req.header("idempotency-key");

  if (!idempotencyKey || typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
    return res.status(400).json({
      code: "MISSING_IDEMPOTENCY_KEY",
      message: "Idempotency-Key header is required.",
    });
  }

  const key = idempotencyKey.trim();
  if (idempotencyRecords.has(key)) {
    return res.status(409).json({
      code: "IDEMPOTENCY_KEY_REUSED",
      message:
        "This idempotency key has already been used. Duplicate leave requests are not allowed.",
    });
  }

  const { userId } = req.params;
  const leaveDays = req.body?.leaveDays;

  if (typeof leaveDays !== "number" || Number.isNaN(leaveDays) || leaveDays <= 0) {
    return res.status(400).json({
      code: "INVALID_LEAVE_DAYS",
      message: "Body must include a positive numeric leaveDays value.",
    });
  }

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      code: "USER_NOT_FOUND",
      message: "No user exists with the given id.",
    });
  }

  const user = users[userIndex];
  if (leaveDays > user.balance) {
    return res.status(422).json({
      code: "INSUFFICIENT_LEAVE_BALANCE",
      message: `Requested leave (${leaveDays} day(s)) exceeds available balance (${user.balance} day(s)).`,
      availableBalance: user.balance,
      requestedLeaveDays: leaveDays,
    });
  }

  const newBalance = user.balance - leaveDays;
  users[userIndex] = { ...user, balance: newBalance };
  writeUsersToDisk(users);

  idempotencyRecords.set(key, {
    userId,
    leaveDays,
    appliedAt: new Date().toISOString(),
  });

  return res.status(200).json({
    user: users[userIndex],
    appliedLeaveDays: leaveDays,
  });
});

app.listen(PORT, () => {
  console.log(`Mock HCM listening on http://localhost:${PORT}`);
});
