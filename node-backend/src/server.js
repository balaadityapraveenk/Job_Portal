import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-job-portal-secret';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.b0ao2kv.mongodb.net/jobportal?appName=Cluster0';
const DATA_DIR = path.join(__dirname, '..', 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'RECRUITER'],
    default: 'USER'
  },
  companyName: { type: String, trim: true, default: '' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  username: user.name,
  email: user.email,
  role: user.role,
  companyName: user.companyName || ''
});

const signToken = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const ensureDataFiles = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  for (const file of [JOBS_FILE, APPLICATIONS_FILE]) {
    try {
      await readFile(file, 'utf8');
    } catch {
      await writeFile(file, '[]\n');
    }
  }
};

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const writeJson = async (file, data) => writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
const nextNumericId = (items) => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ detail: 'Authentication required' });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.auth?.role)) {
    return res.status(403).json({ detail: 'You do not have permission for this action' });
  }
  return next();
};

app.get('/', (_req, res) => {
  res.json({ message: 'Node.js Job Portal API running', userStore: 'MongoDB' });
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, username, email, password, role = 'USER', companyName = '' } = req.body;
    const normalizedRole = String(role).toUpperCase();

    if (!email || !password || !(name || username)) {
      return res.status(400).json({ detail: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters' });
    }
    if (!['USER', 'ADMIN', 'RECRUITER'].includes(normalizedRole)) {
      return res.status(400).json({ detail: 'Invalid role' });
    }
    if (normalizedRole === 'RECRUITER' && !companyName.trim()) {
      return res.status(400).json({ detail: 'Company name is required for recruiters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ detail: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || username,
      email,
      password: hashedPassword,
      role: normalizedRole,
      companyName
    });

    return res.status(201).json(toPublicUser(user));
  } catch (error) {
    return res.status(500).json({ detail: error.message || 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const aliases = {
      admin: 'admin@jobportal.com',
      student: 'student@jobportal.com',
      recruiter: 'recruiter@jobportal.com'
    };
    const loginEmail = aliases[String(email || '').toLowerCase()] || email;
    const user = await User.findOne({ email: String(loginEmail || '').toLowerCase().trim() });

    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    return res.json({ token: signToken(user), user: toPublicUser(user) });
  } catch (error) {
    return res.status(500).json({ detail: error.message || 'Login failed' });
  }
});

app.get('/jobs', async (_req, res) => {
  res.json(await readJson(JOBS_FILE));
});

app.get('/jobs/:id', async (req, res) => {
  const jobs = await readJson(JOBS_FILE);
  const job = jobs.find((item) => String(item.id) === String(req.params.id));
  if (!job) return res.status(404).json({ detail: 'Job not found' });
  return res.json(job);
});

app.post('/jobs', auth, allowRoles('ADMIN', 'RECRUITER'), async (req, res) => {
  const jobs = await readJson(JOBS_FILE);
  const creator = await User.findById(req.auth.id);
  const company = req.auth.role === 'RECRUITER'
    ? creator?.companyName || req.body.company
    : req.body.company;

  const job = {
    id: nextNumericId(jobs),
    title: req.body.title,
    company,
    location: req.body.location,
    salary: req.body.salary,
    category: req.body.category || 'Engineering',
    type: req.body.type || 'Full-Time',
    remote: Boolean(req.body.remote),
    experience: req.body.experience || '0-1 years',
    skills: req.body.skills || '',
    description: req.body.description || '',
    responsibilities: req.body.responsibilities || '',
    requirements: req.body.requirements || '',
    postedDate: req.body.postedDate || new Date().toISOString().slice(0, 10),
    deadline: req.body.deadline || '',
    recruiterId: req.auth.id
  };

  if (!job.title || !job.company || !job.location) {
    return res.status(400).json({ detail: 'Title, company, and location are required' });
  }

  jobs.push(job);
  await writeJson(JOBS_FILE, jobs);
  return res.status(201).json(job);
});

app.delete('/jobs/:id', auth, allowRoles('ADMIN', 'RECRUITER'), async (req, res) => {
  const jobs = await readJson(JOBS_FILE);
  const target = jobs.find((job) => String(job.id) === String(req.params.id));
  if (!target) return res.status(404).json({ detail: 'Job not found' });
  if (req.auth.role === 'RECRUITER' && target.recruiterId !== req.auth.id) {
    return res.status(403).json({ detail: 'Recruiters can remove only their own jobs' });
  }

  await writeJson(JOBS_FILE, jobs.filter((job) => String(job.id) !== String(req.params.id)));
  const applications = await readJson(APPLICATIONS_FILE);
  await writeJson(APPLICATIONS_FILE, applications.filter((appItem) => String(appItem.job?.id) !== String(req.params.id)));
  return res.json({ message: 'Job deleted successfully' });
});

app.post('/applications', auth, allowRoles('USER'), async (req, res) => {
  const applications = await readJson(APPLICATIONS_FILE);
  const user = await User.findById(req.auth.id);
  const jobs = await readJson(JOBS_FILE);
  const submittedJob = req.body.job || {};
  const storedJob = submittedJob.id
    ? jobs.find((job) => String(job.id) === String(submittedJob.id))
    : null;
  const job = storedJob || submittedJob;

  if (!job?.id && !job?.title) {
    return res.status(400).json({ detail: 'Job information is required' });
  }

  const alreadyApplied = applications.some((appItem) =>
    String(appItem.user?.id) === String(req.auth.id) &&
    String(appItem.job?.id || appItem.job?.title) === String(job.id || job.title)
  );
  if (alreadyApplied) return res.status(409).json({ detail: 'You already applied for this job' });

  const application = {
    id: nextNumericId(applications),
    status: req.body.status || 'Applied',
    user: toPublicUser(user),
    job,
    appliedAt: new Date().toISOString()
  };
  applications.push(application);
  await writeJson(APPLICATIONS_FILE, applications);
  return res.status(201).json(application);
});

app.get('/applications', auth, allowRoles('ADMIN', 'RECRUITER'), async (req, res) => {
  const applications = await readJson(APPLICATIONS_FILE);
  if (req.auth.role === 'ADMIN') return res.json(applications);

  const recruiterApps = applications.filter((appItem) => appItem.job?.recruiterId === req.auth.id);
  return res.json(recruiterApps);
});

app.get('/applications/user/:userId', auth, async (req, res) => {
  if (req.auth.role !== 'ADMIN' && String(req.auth.id) !== String(req.params.userId)) {
    return res.status(403).json({ detail: 'You can view only your own applications' });
  }
  const applications = await readJson(APPLICATIONS_FILE);
  return res.json(applications.filter((appItem) => String(appItem.user?.id) === String(req.params.userId)));
});

app.put('/applications/:id', auth, allowRoles('ADMIN', 'RECRUITER'), async (req, res) => {
  const applications = await readJson(APPLICATIONS_FILE);
  const index = applications.findIndex((appItem) => String(appItem.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ detail: 'Application not found' });
  if (req.auth.role === 'RECRUITER' && applications[index].job?.recruiterId !== req.auth.id) {
    return res.status(403).json({ detail: 'Recruiters can update only applications for their jobs' });
  }
  applications[index] = { ...applications[index], status: req.body.status || applications[index].status };
  await writeJson(APPLICATIONS_FILE, applications);
  return res.json(applications[index]);
});

app.delete('/applications/:id', auth, async (req, res) => {
  const applications = await readJson(APPLICATIONS_FILE);
  const target = applications.find((appItem) => String(appItem.id) === String(req.params.id));
  if (!target) return res.status(404).json({ detail: 'Application not found' });
  if (req.auth.role !== 'ADMIN' && String(target.user?.id) !== String(req.auth.id)) {
    return res.status(403).json({ detail: 'You can withdraw only your own application' });
  }
  await writeJson(APPLICATIONS_FILE, applications.filter((appItem) => String(appItem.id) !== String(req.params.id)));
  return res.json({ message: 'Application withdrawn successfully' });
});

const seedUsers = async () => {
  const seeds = [
    { name: 'Admin', email: 'admin@jobportal.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Student', email: 'student@jobportal.com', password: 'student123', role: 'USER' },
    { name: 'Recruiter', email: 'recruiter@jobportal.com', password: 'recruiter123', role: 'RECRUITER', companyName: 'Direct Hire Co' }
  ];

  for (const seed of seeds) {
    const exists = await User.findOne({ email: seed.email });
    if (!exists) {
      await User.create({ ...seed, password: await bcrypt.hash(seed.password, 10) });
    }
  }
};

await mongoose.connect(MONGODB_URI);
await ensureDataFiles();
await seedUsers();

app.listen(PORT, () => {
  console.log(`Node.js API listening on http://127.0.0.1:${PORT}`);
});
