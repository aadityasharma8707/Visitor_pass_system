/**
 * Initial migration: ensure critical indexes exist.
 */
module.exports.up = async function ({ mongoose }) {
  const db = mongoose.connection.db;

  // VisitRequest indexes
  await db.collection('visitrequests').createIndex({ host: 1, createdAt: -1 }, { name: 'host_createdAt_idx' });
  await db.collection('visitrequests').createIndex({ visitor: 1 }, { name: 'visitor_idx' });
  await db.collection('visitrequests').createIndex({ status: 1 }, { name: 'status_idx' });
  await db.collection('visitrequests').createIndex({ passCode: 1 }, { unique: true, sparse: true, name: 'passcode_unique' });

  // EntryLog indexes
  await db.collection('entrylogs').createIndex({ visitRequest: 1 }, { unique: true, name: 'visitreq_unique_idx' });

  // AuditLog indexes
  await db.collection('auditlogs').createIndex({ admin: 1, createdAt: -1 }, { name: 'admin_createdAt_idx' });
  await db.collection('auditlogs').createIndex({ targetType: 1, createdAt: -1 }, { name: 'target_createdAt_idx' });

  // User indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
  await db.collection('users').createIndex({ role: 1, isSuspended: 1 }, { name: 'role_suspended_idx' });

  // Optional: create a small TTL index for test logs (example)
  // await db.collection('auditlogs').createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365, name: 'audit_ttl' });
};
