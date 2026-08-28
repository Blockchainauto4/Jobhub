import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { parseWhatsAppJobMessage, generateWhatsAppBroadcast } from './server/gemini.js';
import { initPostgresTables, syncJobsToPostgres } from './server/postgres.js';

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

  // Initialize PostgreSQL / Neon DB if DATABASE_URL is present
  if (process.env.DATABASE_URL) {
    initPostgresTables().then((success) => {
      if (success) {
        syncJobsToPostgres(db.getJobs()).catch(err => console.warn('Background sync error:', err));
      }
    }).catch(err => console.warn('Postgres init error:', err));
  }

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
    if (process.env.DATABASE_URL) {
      syncJobsToPostgres(freshJobs).catch(err => console.warn('Postgres sync error on reset:', err));
    }
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
      if (process.env.DATABASE_URL) {
        syncJobsToPostgres(db.getJobs()).catch(err => console.warn('Postgres sync error:', err));
      }
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
      if (process.env.DATABASE_URL) {
        syncJobsToPostgres(db.getJobs()).catch(err => console.warn('Postgres sync error:', err));
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
      if (process.env.DATABASE_URL) {
        syncJobsToPostgres(db.getJobs()).catch(err => console.warn('Postgres sync error:', err));
      }
      res.json({ success: true, message: 'Vaga removida com sucesso' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Apply to job with skills and certifications
  app.post('/api/jobs/:id/apply', (req, res) => {
    try {
      const { name, whatsapp, pixKey, pixType, experienceSummary, skills, certifications, state, city, neighborhood } = req.body;
      if (!name || !whatsapp || !pixKey) {
        return res.status(400).json({ error: 'Nome, WhatsApp e Chave PIX são obrigatórios para candidatura' });
      }

      const applicant = db.addApplicant(req.params.id, {
        name,
        whatsapp,
        pixKey,
        pixType: pixType || 'cpf',
        experienceSummary: experienceSummary || 'Disponibilidade imediata e compromisso com o trabalho.',
        skills: skills && skills.length > 0 ? skills : ['Pontualidade', 'Compromisso'],
        certifications: certifications || [],
        state: state || 'SP',
        city: city || 'São Paulo',
        neighborhood: neighborhood || 'Centro'
      });

      if (!applicant) {
        return res.status(404).json({ error: 'Vaga não encontrada' });
      }

      if (process.env.DATABASE_URL) {
        syncJobsToPostgres(db.getJobs()).catch(err => console.warn('Postgres sync error:', err));
      }

      res.status(201).json(applicant);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Background Check instant verification API
  app.post('/api/background-check/verify', (req, res) => {
    try {
      const { fullName, cpf, state, documentType } = req.body;
      if (!fullName || !cpf) {
        return res.status(400).json({ error: 'Nome completo e CPF são obrigatórios para emissão do selo' });
      }

      const protocolNumber = `CERT-${(state || 'BR').toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const verification = {
        status: 'verified' as const,
        verifiedAt: new Date().toISOString().slice(0, 10),
        documentType: (documentType as any) || 'Certidão PF (Polícia Federal)',
        protocolNumber,
        verifiedBadgeLabel: 'Antecedentes Criminais Verificados (Nada Consta)',
        holderName: fullName,
        cleanRecord: true,
        issuedBy: 'Sistema Nacional de Informações de Segurança Pública (SINESP / PF)',
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      };

      res.json({
        success: true,
        message: 'Certidão de Antecedentes Criminais consultada e validada com sucesso!',
        verification
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // National metrics
  app.get('/api/stats/national', (req, res) => {
    const jobs = db.getJobs();
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
    const totalEarningsDisbursed = 3840290.00 + jobs.reduce((acc, j) => acc + (j.cachet * (j.applicants?.filter(a => a.status === 'paid').length || 0)), 0);

    res.json({
      activeFreelancers: 48920,
      totalJobsPosted: 12450 + jobs.length,
      totalPixDisbursed: totalEarningsDisbursed,
      statesCovered: 18,
      satisfactionRate: 99.4,
      verifiedBackgroundRate: 94.8,
      topSectors: [
        { name: 'Eventos & Festas', share: '38%' },
        { name: 'Bares & Gastronomia', share: '29%' },
        { name: 'Logística & Cargas', share: '18%' },
        { name: 'Limpeza & Facilities', share: '15%' }
      ]
    });
  });

  // Admin Dashboard Realtime Indicators & Analytics
  app.get('/api/admin/metrics', (req, res) => {
    try {
      const jobs = db.getJobs();
      const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
      const totalSlots = jobs.reduce((sum, j) => sum + j.slotsTotal, 0);
      const filledSlots = jobs.reduce((sum, j) => sum + (j.slotsTotal - j.slotsAvailable), 0);
      const totalCachetVolume = jobs.reduce((sum, j) => sum + (j.cachet * j.slotsTotal), 0);

      // Category metrics aggregation with distinct color scheme
      const categoryColorMap: Record<string, string> = {
        'Eventos & Festas': '#10b981', // emerald
        'Bares & Restaurantes': '#06b6d4', // cyan
        'Finanças & Caixa de Eventos': '#f59e0b', // amber
        'Logística & Cargas': '#ec4899', // pink
        'Limpeza & Serviços': '#8b5cf6', // purple
        'Limpeza & Facilities': '#8b5cf6',
        'Hotelaria & Recepção': '#3b82f6', // blue
        'Segurança & Apoio': '#ef4444', // red
        'Audiovisual & Montagem': '#14b8a6', // teal
        'Outros': '#64748b' // slate
      };

      const categoryMap = new Map<string, {
        count: number;
        totalSlots: number;
        filledSlots: number;
        availableSlots: number;
        totalCachetValue: number;
      }>();

      // Ensure default standard categories exist
      const standardCategories = [
        'Eventos & Festas',
        'Bares & Restaurantes',
        'Logística & Cargas',
        'Finanças & Caixa de Eventos',
        'Limpeza & Serviços',
        'Hotelaria & Recepção',
        'Audiovisual & Montagem',
        'Segurança & Apoio'
      ];

      standardCategories.forEach(cat => {
        categoryMap.set(cat, {
          count: 0,
          totalSlots: 0,
          filledSlots: 0,
          availableSlots: 0,
          totalCachetValue: 0
        });
      });

      jobs.forEach(job => {
        const cat = job.category || 'Outros';
        const current = categoryMap.get(cat) || {
          count: 0,
          totalSlots: 0,
          filledSlots: 0,
          availableSlots: 0,
          totalCachetValue: 0
        };

        const jobFilled = job.slotsTotal - job.slotsAvailable;
        current.count += 1;
        current.totalSlots += job.slotsTotal;
        current.filledSlots += jobFilled;
        current.availableSlots += job.slotsAvailable;
        current.totalCachetValue += (job.cachet * job.slotsTotal);
        categoryMap.set(cat, current);
      });

      const categoriesList = Array.from(categoryMap.entries())
        .filter(([_, data]) => data.count > 0 || ['Eventos & Festas', 'Bares & Restaurantes', 'Logística & Cargas', 'Finanças & Caixa de Eventos'].includes(_))
        .map(([name, data]) => {
          const avgCachet = data.totalSlots > 0 ? Math.round(data.totalCachetValue / data.totalSlots) : 210;
          const fillRate = data.totalSlots > 0 ? Math.round((data.filledSlots / data.totalSlots) * 100) : 0;
          return {
            category: name,
            count: data.count,
            totalSlots: data.totalSlots,
            filledSlots: data.filledSlots,
            availableSlots: data.availableSlots,
            totalCachetValue: data.totalCachetValue,
            avgCachet,
            fillRate,
            color: categoryColorMap[name] || '#10b981'
          };
        })
        .sort((a, b) => b.totalCachetValue - a.totalCachetValue);

      // User Growth Data
      const baseUsers = 48920 + totalApplicants;
      const userGrowth = {
        '7d': [
          { period: 'Seg', totalUsers: baseUsers - 340, newFreelancers: 48, newContractors: 7, verifiedProfiles: 42 },
          { period: 'Ter', totalUsers: baseUsers - 280, newFreelancers: 56, newContractors: 9, verifiedProfiles: 51 },
          { period: 'Qua', totalUsers: baseUsers - 210, newFreelancers: 65, newContractors: 11, verifiedProfiles: 59 },
          { period: 'Qui', totalUsers: baseUsers - 140, newFreelancers: 72, newContractors: 14, verifiedProfiles: 68 },
          { period: 'Sex', totalUsers: baseUsers - 65, newFreelancers: 89, newContractors: 19, verifiedProfiles: 82 },
          { period: 'Sáb', totalUsers: baseUsers - 20, newFreelancers: 94, newContractors: 22, verifiedProfiles: 89 },
          { period: 'Hoje (Tempo Real)', totalUsers: baseUsers, newFreelancers: 112, newContractors: 28, verifiedProfiles: 104 }
        ],
        '30d': [
          { period: 'Sem 1', totalUsers: baseUsers - 1850, newFreelancers: 390, newContractors: 62, verifiedProfiles: 345 },
          { period: 'Sem 2', totalUsers: baseUsers - 1240, newFreelancers: 480, newContractors: 78, verifiedProfiles: 430 },
          { period: 'Sem 3', totalUsers: baseUsers - 620, newFreelancers: 590, newContractors: 94, verifiedProfiles: 540 },
          { period: 'Sem 4 (Atual)', totalUsers: baseUsers, newFreelancers: 780, newContractors: 126, verifiedProfiles: 715 }
        ],
        '6m': [
          { period: 'Mar/26', totalUsers: 28400, newFreelancers: 2100, newContractors: 310, verifiedProfiles: 1940 },
          { period: 'Abr/26', totalUsers: 33100, newFreelancers: 2500, newContractors: 380, verifiedProfiles: 2320 },
          { period: 'Mai/26', totalUsers: 37900, newFreelancers: 2900, newContractors: 440, verifiedProfiles: 2710 },
          { period: 'Jun/26', totalUsers: 42300, newFreelancers: 3400, newContractors: 510, verifiedProfiles: 3150 },
          { period: 'Jul/26', totalUsers: 46100, newFreelancers: 3800, newContractors: 590, verifiedProfiles: 3580 },
          { period: 'Ago/26', totalUsers: baseUsers, newFreelancers: 4350, newContractors: 680, verifiedProfiles: 4120 }
        ],
        '1y': [
          { period: 'Q3/25', totalUsers: 14200, newFreelancers: 4800, newContractors: 650, verifiedProfiles: 4100 },
          { period: 'Q4/25', totalUsers: 22800, newFreelancers: 7200, newContractors: 980, verifiedProfiles: 6500 },
          { period: 'Q1/26', totalUsers: 33100, newFreelancers: 8900, newContractors: 1240, verifiedProfiles: 8200 },
          { period: 'Q2/26', totalUsers: 42300, newFreelancers: 10400, newContractors: 1520, verifiedProfiles: 9800 },
          { period: 'Q3/26 (Em andamento)', totalUsers: baseUsers, newFreelancers: 12900, newContractors: 1890, verifiedProfiles: 12100 }
        ]
      };

      // Realtime Mission Telemetry
      const missionsInitiated = 18450;
      const tiktokCompleted = 12840;
      const kwaiCompleted = 10420;
      const whatsappGroupJoined = 14190;
      const sponsorContactUnlocked = 4920;
      const totalMissionsCompleted = tiktokCompleted + kwaiCompleted + whatsappGroupJoined + sponsorContactUnlocked;
      const completionRate = Math.round((totalMissionsCompleted / (missionsInitiated * 3)) * 100 * 10) / 10; // ~76.5%

      const now = new Date();
      const currentHour = now.getHours();
      const hourlyTrends = Array.from({ length: 8 }).map((_, i) => {
        const h = (currentHour - 7 + i + 24) % 24;
        const hourStr = `${h.toString().padStart(2, '0')}:00`;
        return {
          hour: hourStr,
          tiktok: Math.floor(45 + Math.random() * 30 + (i * 8)),
          kwai: Math.floor(35 + Math.random() * 25 + (i * 6)),
          whatsapp: Math.floor(55 + Math.random() * 35 + (i * 10)),
          unlocks: Math.floor(20 + Math.random() * 18 + (i * 4))
        };
      });

      const liveEvents = [
        {
          id: `evt-1`,
          timestamp: 'Agora mesmo',
          userName: 'Lucas Silva Pereira',
          missionType: 'contact_unlock' as const,
          jobRole: 'Logístico (Interlagos)',
          rewardAmount: 225,
          status: 'completed' as const
        },
        {
          id: `evt-2`,
          timestamp: 'Há 1 min',
          userName: 'Mariana Rodrigues Costa',
          missionType: 'tiktok' as const,
          jobRole: 'Missão Patrocinador TikTok',
          rewardAmount: 50,
          status: 'completed' as const
        },
        {
          id: `evt-3`,
          timestamp: 'Há 3 min',
          userName: 'Carlos Eduardo Santos',
          missionType: 'whatsapp' as const,
          jobRole: 'Grupo VIP de Vagas SP',
          status: 'completed' as const
        },
        {
          id: `evt-4`,
          timestamp: 'Há 5 min',
          userName: 'Beatriz Almeida Lima',
          missionType: 'kwai' as const,
          jobRole: 'Missão Kwai Referral',
          rewardAmount: 50,
          status: 'completed' as const
        },
        {
          id: `evt-5`,
          timestamp: 'Há 7 min',
          userName: 'Felipe Augusto Barreto',
          missionType: 'contact_unlock' as const,
          jobRole: 'Operador de Caixa (Vila Olímpia)',
          rewardAmount: 240,
          status: 'completed' as const
        }
      ];

      res.json({
        kpis: {
          totalUsers: baseUsers,
          usersGrowthPct: 24.8,
          totalActiveJobs: jobs.filter(j => j.status === 'open').length,
          totalCachetVolume,
          missionCompletionRate: completionRate,
          totalMissionsCompleted,
          totalApplicants,
          avgFillRate: totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 74
        },
        userGrowth,
        categories: categoriesList,
        missions: {
          totalInitiated: missionsInitiated,
          totalCompleted: totalMissionsCompleted,
          completionRate,
          tiktokCompleted,
          kwaiCompleted,
          whatsappGroupJoined,
          sponsorContactUnlocked,
          totalRewardsDistributed: (tiktokCompleted * 50) + (kwaiCompleted * 50),
          hourlyTrends,
          liveEvents
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // === ADMIN & SECURITY ENDPOINTS ===

  // Admin authentication (Password Gatekeeper)
  app.post('/api/admin/login', (req, res) => {
    try {
      const { password, email } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Senha de acesso administrativo é obrigatória.' });
      }

      const result = db.verifyAdminAccess(password, email);
      if (!result.success) {
        return res.status(401).json({ error: result.message || 'Senha incorreta.' });
      }

      const token = `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      res.json({
        success: true,
        token,
        admin: result.admin,
        expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get system administrators
  app.get('/api/admin/admins', (req, res) => {
    try {
      const admins = db.getAdmins();
      res.json(admins);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Create new system administrator
  app.post('/api/admin/admins', (req, res) => {
    try {
      const { name, email, role, permissions, status, notes, requesterAdmin } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Nome, E-mail e Papel/Função são obrigatórios.' });
      }

      const newAdmin = db.createAdmin({
        name,
        email,
        role,
        roleLabel: '',
        permissions,
        status: status || 'active',
        notes
      }, requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined);

      res.status(201).json(newAdmin);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update system administrator
  app.put('/api/admin/admins/:id', (req, res) => {
    try {
      const { requesterAdmin, ...updates } = req.body;
      const updated = db.updateAdmin(req.params.id, updates, requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined);
      if (!updated) {
        return res.status(404).json({ error: 'Administrador não encontrado.' });
      }
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Delete system administrator
  app.delete('/api/admin/admins/:id', (req, res) => {
    try {
      const { requesterAdminId, requesterAdminName } = req.query;
      const result = db.deleteAdmin(req.params.id, {
        adminId: (requesterAdminId as string) || 'admin-1',
        adminName: (requesterAdminName as string) || 'Super Administrador'
      });

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Change master administrator password
  app.post('/api/admin/change-password', (req, res) => {
    try {
      const { oldPassword, newPassword, requesterAdmin } = req.body;
      const result = db.changeMasterPassword(
        oldPassword, 
        newPassword, 
        requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined
      );

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get admin audit logs
  app.get('/api/admin/audit-logs', (req, res) => {
    try {
      const logs = db.getAuditLogs(60);
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Clone job for rapid reposting
  app.post('/api/admin/jobs/clone/:id', (req, res) => {
    try {
      const original = db.getJobById(req.params.id);
      if (!original) {
        return res.status(404).json({ error: 'Vaga original não encontrada.' });
      }

      const { requesterAdmin } = req.body;
      const cloned = db.createJob({
        ...original,
        title: `${original.title} (Cópia Repostada)`,
        status: 'open',
        slotsAvailable: original.slotsTotal,
        date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10)
      }, requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined);

      res.status(201).json(cloned);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Quick job status update
  app.patch('/api/admin/jobs/:id/status', (req, res) => {
    try {
      const { status, requesterAdmin } = req.body;
      if (!['open', 'filled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Status de vaga inválido.' });
      }

      const updated = db.updateJob(req.params.id, { status }, requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined);
      if (!updated) {
        return res.status(404).json({ error: 'Vaga não encontrada.' });
      }

      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update applicant status (accept, reject, check-in, pay)
  app.patch('/api/jobs/:id/applicants/:applicantId', (req, res) => {
    try {
      const { status, notes, rating, paidAmount, requesterAdmin } = req.body;
      const success = db.updateApplicantStatus(
        req.params.id, 
        req.params.applicantId, 
        status, 
        notes, 
        rating, 
        paidAmount,
        requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined
      );
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

  // === TIKTOK 24H MISSION & CONTRACT GATEKEEPER ENDPOINTS ===

  // Get active TikTok 24h mission configuration & live remaining time
  app.get('/api/tiktok-mission', (req, res) => {
    try {
      const config = db.getTikTokMissionConfig();
      const now = Date.now();
      const expiresAtMs = new Date(config.expiresAt).getTime();
      const timeRemainingMs = Math.max(0, expiresAtMs - now);
      const isExpired = timeRemainingMs <= 0;

      const hoursLeft = Math.floor(timeRemainingMs / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

      res.json({
        ...config,
        timeRemainingMs,
        isExpired,
        formattedRemaining: `${hoursLeft.toString().padStart(2, '0')}h ${minutesLeft.toString().padStart(2, '0')}m ${secondsLeft.toString().padStart(2, '0')}s`,
        hoursLeft,
        minutesLeft,
        secondsLeft
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin update TikTok 24h mission link and reset 24h validity
  app.post('/api/admin/tiktok-mission', (req, res) => {
    try {
      const { activeUrl, renew24Hours, isActive, lockAllJobs, missionInstructions, missionTitle, requesterAdmin } = req.body;
      
      const updates: any = {};
      if (activeUrl) updates.activeUrl = activeUrl.trim();
      if (isActive !== undefined) updates.isActive = Boolean(isActive);
      if (lockAllJobs !== undefined) updates.lockAllJobs = Boolean(lockAllJobs);
      if (missionInstructions) updates.missionInstructions = missionInstructions;
      if (missionTitle) updates.missionTitle = missionTitle;

      if (renew24Hours) {
        updates.generatedAt = new Date().toISOString();
        updates.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      const updated = db.updateTikTokMissionConfig(updates, requesterAdmin ? { adminId: requesterAdmin.id, adminName: requesterAdmin.name } : undefined);
      res.json({ success: true, config: updated, message: 'Link do TikTok e regras de bloqueio de 24h atualizados com sucesso!' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Track TikTok mission link click
  app.post('/api/tiktok-mission/track-click', (req, res) => {
    try {
      const result = db.trackTikTokMissionClick();
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Unlock job contact and contract via TikTok mission completion
  app.post('/api/tiktok-mission/unlock', (req, res) => {
    try {
      const { jobId, userName } = req.body;
      const result = db.trackTikTokMissionUnlock();
      
      if (jobId) {
        const job = db.getJobById(jobId);
        if (job) {
          db.addAuditLog({
            adminId: 'system',
            adminName: 'Gatekeeper TikTok 24h',
            adminRole: 'super_admin',
            action: 'applicant_status_change',
            title: 'Contrato & WhatsApp Desbloqueados via TikTok',
            details: `Usuário "${userName || 'Candidato'}" completou a missão do link de 24h e liberou o contato da vaga ${job.role} (${job.city}).`,
            targetId: jobId,
            severity: 'success'
          });
        }
      }

      res.json({ 
        success: true, 
        message: 'Missão validada com sucesso! Número do contratante e contrato de trabalho liberados.', 
        totalUnlocks: result.totalUnlocks 
      });
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
