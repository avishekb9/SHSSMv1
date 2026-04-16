import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GCP_PROJECT || 'hopeful-flash-485308-v3';
const BUCKET_NAME = process.env.SUBMISSIONS_BUCKET || 'shssm-iitbbs-submissions';
const FIRESTORE_DB = process.env.FIRESTORE_DB || 'g4a22a71052183-firestore';
const COLLECTION = 'logo_submissions';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://shssm-staging-672903689767.asia-south1.run.app,https://shssm.iitbbs.ac.in,http://localhost:8767,http://localhost:8080')
  .split(',').map(s => s.trim());

const firestore = new Firestore({ projectId: PROJECT_ID, databaseId: FIRESTORE_DB });
const storage = new Storage({ projectId: PROJECT_ID });
const bucket = storage.bucket(BUCKET_NAME);

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '12mb' }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`Origin not allowed: ${origin}`));
  },
  methods: ['POST', 'GET', 'OPTIONS'],
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype);
    cb(ok ? null : new Error('Only PNG/JPEG accepted'), ok);
  },
});

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/', (_req, res) => {
  res.json({
    service: 'shssm-form-backend',
    endpoints: ['POST /api/logo-submission', 'GET /healthz'],
    status: 'ready',
  });
});

function sanitizeTeamName(name) {
  return String(name || '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'team';
}

function validateSubmission(body, file) {
  const errors = [];
  if (!body.team_name || String(body.team_name).trim().length < 2) {
    errors.push('team_name required');
  }
  if (!body.team_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.team_email)) {
    errors.push('valid team_email required');
  }
  if (body.terms_agree !== 'on' && body.terms_agree !== 'true' && body.terms_agree !== true) {
    errors.push('terms_agree must be confirmed');
  }
  if (!file) errors.push('logo file required');
  return errors;
}

function collectMembers(body) {
  const members = [];
  for (let i = 1; i <= 5; i++) {
    const name = body[`member_${i}_name`];
    if (name && String(name).trim()) {
      members.push({
        name: String(name).trim(),
        discipline: String(body[`member_${i}_discipline`] || '').trim(),
        roll: String(body[`member_${i}_roll`] || '').trim(),
      });
    }
  }
  return members;
}

app.post('/api/logo-submission',
  upload.single('logo_file'),
  async (req, res) => {
    try {
      const errors = validateSubmission(req.body, req.file);
      if (errors.length) {
        return res.status(400).json({ ok: false, errors });
      }
      const members = collectMembers(req.body);
      if (!members.length) {
        return res.status(400).json({ ok: false, errors: ['at least one member required'] });
      }

      const slug = sanitizeTeamName(req.body.team_name);
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = (req.file.mimetype === 'image/png') ? 'png' : 'jpg';
      const filename = `${slug}_${ts}.${ext}`;
      const gcsPath = `submissions/${filename}`;

      await bucket.file(gcsPath).save(req.file.buffer, {
        contentType: req.file.mimetype,
        resumable: false,
        metadata: {
          metadata: {
            team_name: req.body.team_name,
            team_email: req.body.team_email,
            submitted_at: new Date().toISOString(),
          },
        },
      });

      const doc = {
        team_name: String(req.body.team_name).trim(),
        team_email: String(req.body.team_email).trim(),
        design_concept: String(req.body.design_concept || '').slice(0, 2000),
        members,
        logo: {
          filename,
          gcs_path: gcsPath,
          gcs_uri: `gs://${BUCKET_NAME}/${gcsPath}`,
          content_type: req.file.mimetype,
          size_bytes: req.file.size,
        },
        submitted_at: Firestore.Timestamp.now(),
        client_ip: req.ip,
        user_agent: String(req.get('user-agent') || '').slice(0, 300),
        status: 'received',
      };

      const ref = await firestore.collection(COLLECTION).add(doc);

      res.status(201).json({
        ok: true,
        id: ref.id,
        filename,
        message: 'Submission received. We will be in touch.',
      });
    } catch (err) {
      console.error('submission_error', err);
      const msg = err.message || 'server error';
      const status = /not allowed|required|invalid|must be/i.test(msg) ? 400 : 500;
      res.status(status).json({ ok: false, error: msg });
    }
  }
);

app.use((err, _req, res, _next) => {
  console.error('unhandled', err);
  res.status(500).json({ ok: false, error: 'server error' });
});

app.listen(PORT, () => {
  console.log(`shssm-form-backend listening on :${PORT}`);
});
