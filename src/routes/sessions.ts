import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const dbPath = process.env.DATABASE_URL || './local.db';

function generateId(): string {
  return crypto.randomUUID();
}

export function sessionsRoutes(app: Elysia) {
  // POST /sessions — create new session
  app.post('/sessions', async ({ body }: { body: any }) => {
    try {
      const db = new Database(dbPath);
      const { clientName } = body;
      const sessionId = generateId();
      const now = Date.now();

      db.prepare(`
        INSERT INTO sessions (id, client_name, created_at, updated_at, status)
        VALUES (?, ?, ?, ?, 'active')
      `).run(sessionId, clientName || 'Unnamed Client', now, now);

      return { id: sessionId, clientName: clientName || 'Unnamed Client', createdAt: now };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  // GET /sessions — list all sessions
  app.get('/sessions', async () => {
    try {
      const db = new Database(dbPath);
      const result = db.prepare(`
        SELECT id, client_name, created_at, updated_at, status FROM sessions ORDER BY created_at DESC
      `).all();
      return { sessions: result || [] };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  // GET /sessions/:id — get session detail
  app.get('/sessions/:id', async ({ params }: { params: any }) => {
    try {
      const db = new Database(dbPath);
      const sessionId = params.id;

      const session = db.prepare(`
        SELECT id, client_name, created_at, updated_at, status FROM sessions WHERE id = ?
      `).get(sessionId);

      if (!session) {
        return { error: 'Session not found' };
      }

      const plant = db.prepare(`
        SELECT * FROM plants WHERE session_id = ? LIMIT 1
      `).get(sessionId);

      const scenarios = db.prepare(`
        SELECT id, name, pv_capacity_kwp, bess_capacity_kwh, roof_used_m2, bess_cost_per_kwh, is_active, created_at
        FROM scenarios WHERE session_id = ? ORDER BY created_at DESC
      `).all(sessionId);

      return { session, plant: plant || null, scenarios: scenarios || [] };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  // POST /sessions/:id/scenarios — create scenario
  app.post('/sessions/:id/scenarios', async ({ params, body }: { params: any; body: any }) => {
    try {
      const db = new Database(dbPath);
      const sessionId = params.id;
      const { name, pvCapacityKwp, bessCapacityKwh, roofUsedM2, bessCostPerKwh, isActive } = body;
      const scenarioId = generateId();
      const now = Date.now();

      // Deactivate other scenarios if this one is active
      if (isActive) {
        db.prepare(`
          UPDATE scenarios SET is_active = 0 WHERE session_id = ?
        `).run(sessionId);
      }

      db.prepare(`
        INSERT INTO scenarios (id, session_id, name, pv_capacity_kwp, bess_capacity_kwh, roof_used_m2, bess_cost_per_kwh, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        scenarioId,
        sessionId,
        name || 'Scenario ' + new Date().toLocaleDateString('id-ID'),
        pvCapacityKwp || 750,
        bessCapacityKwh || 1500,
        roofUsedM2 || 6000,
        bessCostPerKwh || 3800000,
        now,
        isActive ? 1 : 0
      );

      return { id: scenarioId, name, createdAt: now };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  // PUT /sessions/:id/scenarios/:scenarioId — update scenario
  app.put('/sessions/:id/scenarios/:scenarioId', async ({ params, body }: { params: any; body: any }) => {
    try {
      const db = new Database(dbPath);
      const { scenarioId } = params;
      const { pvCapacityKwp, bessCapacityKwh, roofUsedM2, bessCostPerKwh, isActive } = body;

      if (isActive) {
        db.prepare(`
          UPDATE scenarios SET is_active = 0 WHERE id != ?
        `).run(scenarioId);
      }

      db.prepare(`
        UPDATE scenarios
        SET pv_capacity_kwp = COALESCE(?, pv_capacity_kwp),
            bess_capacity_kwh = COALESCE(?, bess_capacity_kwh),
            roof_used_m2 = COALESCE(?, roof_used_m2),
            bess_cost_per_kwh = COALESCE(?, bess_cost_per_kwh),
            is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(pvCapacityKwp, bessCapacityKwh, roofUsedM2, bessCostPerKwh, isActive ? 1 : 0, scenarioId);

      return { success: true, id: scenarioId };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  return app;
}
