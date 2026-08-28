import pg from 'pg';
import { FreelanceJob, JobApplicant, SystemAdmin, AdminAuditLog, TikTokMissionConfig } from '../src/types.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isInitialized = false;

export function getPostgresPool(): pg.Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle Neon PostgreSQL client:', err);
    });
  }

  return pool;
}

export async function initPostgresTables(): Promise<boolean> {
  const p = getPostgresPool();
  if (!p) return false;

  try {
    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS freelance_jobs (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          role VARCHAR(100) NOT NULL,
          category VARCHAR(100) NOT NULL,
          state VARCHAR(10) DEFAULT 'SP',
          city VARCHAR(100) NOT NULL DEFAULT 'São Paulo',
          neighborhood VARCHAR(100),
          slots_total INT NOT NULL DEFAULT 1,
          slots_available INT NOT NULL DEFAULT 1,
          work_date VARCHAR(50) NOT NULL,
          start_time VARCHAR(20) NOT NULL,
          end_time VARCHAR(20) NOT NULL,
          cachet NUMERIC(10, 2) NOT NULL,
          payment_details VARCHAR(255) NOT NULL,
          benefits TEXT,
          dress_code TEXT NOT NULL,
          location_name VARCHAR(255),
          location_address TEXT NOT NULL,
          google_maps_url TEXT,
          contact_phone VARCHAR(50) NOT NULL,
          contact_name VARCHAR(100),
          is_urgent BOOLEAN DEFAULT FALSE,
          status VARCHAR(30) DEFAULT 'open',
          sponsor_mission_url TEXT,
          requires_mission_to_unlock_contact BOOLEAN DEFAULT FALSE,
          gender_requirement VARCHAR(30),
          dates_list JSONB DEFAULT '[]',
          desired_skills JSONB DEFAULT '[]',
          required_certifications JSONB DEFAULT '[]',
          requirements JSONB DEFAULT '[]',
          applicants_count INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS job_applicants (
          id VARCHAR(64) PRIMARY KEY,
          job_id VARCHAR(64) REFERENCES freelance_jobs(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          whatsapp VARCHAR(50) NOT NULL,
          pix_key VARCHAR(255) NOT NULL,
          pix_type VARCHAR(20) NOT NULL DEFAULT 'cpf',
          experience_summary TEXT,
          skills JSONB DEFAULT '[]',
          equipment_owned JSONB DEFAULT '[]',
          certifications JSONB DEFAULT '[]',
          rating NUMERIC(3, 1) DEFAULT 5.0,
          completed_jobs_count INT DEFAULT 0,
          state VARCHAR(10) DEFAULT 'SP',
          city VARCHAR(100) DEFAULT 'São Paulo',
          neighborhood VARCHAR(100),
          cpf VARCHAR(30),
          cnpj VARCHAR(30),
          status VARCHAR(30) DEFAULT 'pending',
          paid_amount NUMERIC(10, 2),
          paid_at TIMESTAMP WITH TIME ZONE,
          notes TEXT,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS freelahub_system_config (
          key VARCHAR(64) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_jobs_status ON freelance_jobs(status);
        CREATE INDEX IF NOT EXISTS idx_jobs_state ON freelance_jobs(state);
        CREATE INDEX IF NOT EXISTS idx_applicants_job ON job_applicants(job_id);
      `);

      isInitialized = true;
      console.log('✓ Neon PostgreSQL tables initialized and ready.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('Could not initialize PostgreSQL tables on Neon (falling back to JSON store):', err);
    return false;
  }
}

export async function syncJobsToPostgres(jobs: FreelanceJob[]): Promise<void> {
  const p = getPostgresPool();
  if (!p || !isInitialized) return;

  try {
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      for (const job of jobs) {
        await client.query(`
          INSERT INTO freelance_jobs (
            id, title, role, category, state, city, neighborhood,
            slots_total, slots_available, work_date, start_time, end_time,
            cachet, payment_details, benefits, dress_code, location_name,
            location_address, google_maps_url, contact_phone, contact_name,
            is_urgent, status, sponsor_mission_url, requires_mission_to_unlock_contact,
            gender_requirement, dates_list, desired_skills, required_certifications,
            requirements, applicants_count, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17,
            $18, $19, $20, $21,
            $22, $23, $24, $25,
            $26, $27, $28, $29,
            $30, $31, $32
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            role = EXCLUDED.role,
            category = EXCLUDED.category,
            state = EXCLUDED.state,
            city = EXCLUDED.city,
            neighborhood = EXCLUDED.neighborhood,
            slots_total = EXCLUDED.slots_total,
            slots_available = EXCLUDED.slots_available,
            work_date = EXCLUDED.work_date,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            cachet = EXCLUDED.cachet,
            payment_details = EXCLUDED.payment_details,
            benefits = EXCLUDED.benefits,
            dress_code = EXCLUDED.dress_code,
            location_name = EXCLUDED.location_name,
            location_address = EXCLUDED.location_address,
            google_maps_url = EXCLUDED.google_maps_url,
            contact_phone = EXCLUDED.contact_phone,
            contact_name = EXCLUDED.contact_name,
            is_urgent = EXCLUDED.is_urgent,
            status = EXCLUDED.status,
            sponsor_mission_url = EXCLUDED.sponsor_mission_url,
            requires_mission_to_unlock_contact = EXCLUDED.requires_mission_to_unlock_contact,
            gender_requirement = EXCLUDED.gender_requirement,
            dates_list = EXCLUDED.dates_list,
            desired_skills = EXCLUDED.desired_skills,
            required_certifications = EXCLUDED.required_certifications,
            requirements = EXCLUDED.requirements,
            applicants_count = EXCLUDED.applicants_count;
        `, [
          job.id,
          job.title || job.role,
          job.role,
          job.category,
          job.state || 'SP',
          job.city || 'São Paulo',
          job.neighborhood || 'Centro',
          job.slotsTotal || 1,
          job.slotsAvailable || 1,
          job.date,
          job.startTime,
          job.endTime,
          job.cachet,
          job.paymentDetails,
          job.benefits || '',
          job.dressCode,
          job.locationName || '',
          job.locationAddress,
          job.googleMapsUrl || '',
          job.contactPhone,
          job.contactName || '',
          job.isUrgent || false,
          job.status || 'open',
          job.sponsorMissionUrl || null,
          job.requiresMissionToUnlockContact || false,
          job.genderRequirement || null,
          JSON.stringify(job.datesList || []),
          JSON.stringify(job.desiredSkills || []),
          JSON.stringify(job.requiredCertifications || []),
          JSON.stringify(job.requirements || []),
          job.applicants?.length || job.applicantsCount || 0,
          job.createdAt || new Date().toISOString()
        ]);

        if (job.applicants && job.applicants.length > 0) {
          for (const app of job.applicants) {
            await client.query(`
              INSERT INTO job_applicants (
                id, job_id, name, whatsapp, pix_key, pix_type,
                experience_summary, skills, equipment_owned, certifications,
                rating, completed_jobs_count, state, city, neighborhood,
                cpf, cnpj, status, paid_amount, paid_at, notes, applied_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22
              )
              ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                rating = EXCLUDED.rating,
                notes = EXCLUDED.notes,
                paid_amount = EXCLUDED.paid_amount,
                paid_at = EXCLUDED.paid_at;
            `, [
              app.id,
              job.id,
              app.name,
              app.whatsapp,
              app.pixKey,
              app.pixType,
              app.experienceSummary || '',
              JSON.stringify(app.skills || []),
              JSON.stringify(app.equipmentOwned || []),
              JSON.stringify(app.certifications || []),
              app.rating || 5.0,
              app.completedJobsCount || 0,
              app.state || job.state,
              app.city || job.city,
              app.neighborhood || job.neighborhood,
              app.cpf || null,
              app.cnpj || null,
              app.status || 'pending',
              app.paidAmount || null,
              app.paidAt || null,
              app.notes || '',
              app.appliedAt || new Date().toISOString()
            ]);
          }
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error saving jobs to Postgres:', e);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Postgres pool error during job sync:', err);
  }
}
