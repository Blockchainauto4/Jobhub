import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { parseWhatsAppJobMessage, generateWhatsAppBroadcast } from './server/gemini.js';

dotenv.config();

const SQL_SCHEMA = `-- Schema DDL para Neon DB / PostgreSQL / Vercel Postgres
-- Execute este script no SQL Editor do seu Neon DB ou Vercel Storage

CREATE TABLE IF NOT EXISTS freelance_jobs (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
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
  neighborhood VARCHAR(100),
  city VARCHAR(100) NOT NULL DEFAULT 'São Paulo - SP',
  google_maps_url TEXT,
  contact_phone VARCHAR(50) NOT NULL,
  contact_name VARCHAR(100),
  is_urgent BOOLEAN DEFAULT FALSE,
  status VARCHAR(30) DEFAULT 'open',
  requirements JSONB DEFAULT '[]',
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
  status VARCHAR(30) DEFAULT 'pending',
  rating INT,
  paid_amount NUMERIC(10, 2),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON freelance_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_urgent ON freelance_jobs(is_urgent);
CREATE INDEX IF NOT EXISTS idx_applicants_job ON job_applicants(job_id);
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === API ROUTES ===
  
  // Health & Database status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/db-status', (req, res) => {
    const jobs = db.getJobs();
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
    const hasDbUrl = Boolean(process.env.DATABASE_URL);

    res.json({
      engine: hasDbUrl ? 'neon_postgres' : 'local_persistent_json',
      status: 'connected',
      totalJobs: jobs.length,
      totalApplicants,
      databaseUrlConfigured: hasDbUrl,
      sampleSqlSchema: SQL_SCHEMA,
      vercelInstructions: `1. Crie seu banco no Neon (https://neon.tech) ou Vercel Postgres.\n2. Execute o script SQL Schema.\n3. Defina a variável de ambiente DATABASE_URL na Vercel.\n4. O FreelaHub conectará automaticamente em produção!`
    });
  });

  app.get('/api/db/sql-schema', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(SQL_SCHEMA);
  });

  app.post('/api/db-reset', (req, res) => {
    const freshJobs = db.resetToDefault();
    res.json({ success: true, message: 'Banco reiniciado com os dados oficiais FreelaHub', jobs: freshJobs });
  });

  // Jobs endpoints
  app.get('/api/jobs', (req, res) => {
    try {
      const jobs = db.getJobs();
      res.json(jobs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/jobs/:id', (req, res) => {
    const job = db.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }
    res.json(job);
  });

  app.post('/api/jobs', (req, res) => {
    try {
      const jobData = req.body;
      if (!jobData.role || !jobData.cachet || !jobData.locationAddress) {
        return res.status(400).json({ error: 'Campos obrigatórios: Função, Cachê e Endereço' });
      }

      if (!jobData.googleMapsUrl && jobData.locationAddress) {
        jobData.googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(jobData.locationAddress)}`;
      }

      const newJob = db.createJob(jobData);
      res.status(201).json(newJob);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/jobs/:id', (req, res) => {
    try {
      const updated = db.updateJob(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Vaga não encontrada' });
      }
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/jobs/:id', (req, res) => {
    try {
      const deleted = db.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Vaga não encontrada' });
      }
      res.json({ success: true, message: 'Vaga removida com sucesso' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Apply to job
  app.post('/api/jobs/:id/apply', (req, res) => {
    try {
      const { name, whatsapp, pixKey, pixType, experienceSummary } = req.body;
      if (!name || !whatsapp || !pixKey) {
        return res.status(400).json({ error: 'Nome, WhatsApp e Chave PIX são obrigatórios para candidatura' });
      }

      const applicant = db.addApplicant(req.params.id, {
        name,
        whatsapp,
        pixKey,
        pixType: pixType || 'cpf',
        experienceSummary: experienceSummary || 'Disponibilidade imediata e compromisso com o trabalho.'
      });

      if (!applicant) {
        return res.status(404).json({ error: 'Vaga não encontrada' });
      }

      res.status(201).json(applicant);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update applicant status (accept, reject, check-in, pay)
  app.patch('/api/jobs/:id/applicants/:applicantId', (req, res) => {
    try {
      const { status, notes, rating, paidAmount } = req.body;
      const success = db.updateApplicantStatus(req.params.id, req.params.applicantId, status, notes, rating, paidAmount);
      if (!success) {
        return res.status(404).json({ error: 'Candidato ou vaga não encontrada' });
      }
      const updatedJob = db.getJobById(req.params.id);
      res.json({ success: true, job: updatedJob });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // AI & Message helpers
  app.post('/api/parse-whatsapp', async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== 'string') {
        return res.status(400).json({ error: 'Texto da mensagem é obrigatório' });
      }
      const parsed = await parseWhatsAppJobMessage(rawText);
      res.json(parsed);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/generate-whatsapp', (req, res) => {
    try {
      const job = req.body;
      const message = generateWhatsAppBroadcast(job);
      res.json({ message });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // === VITE MIDDLEWARE SETUP ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FreelaHub Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
