import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jobsJsonPath = path.join(__dirname, '..', 'data', 'jobs.json');

async function run() {
  try {
    // Dynamic import to load ES module directly
    const module = await import('../../project/src/data/jobsData.js');
    const jobs = module.jobsData;

    // Convert fields to match the database schema
    const formattedJobs = jobs.map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      category: j.category || 'Engineering',
      type: j.type || 'Full-Time',
      remote: Boolean(j.remote),
      experience: j.experience || '0-1 years',
      skills: Array.isArray(j.skills) ? j.skills.join(',') : (j.skills || ''),
      description: j.description || '',
      responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join('|') : (j.responsibilities || ''),
      requirements: Array.isArray(j.requirements) ? j.requirements.join('|') : (j.requirements || ''),
      postedDate: j.postedDate || new Date().toISOString().slice(0, 10),
      deadline: j.deadline || '',
      recruiterId: "seed"
    }));

    fs.writeFileSync(jobsJsonPath, JSON.stringify(formattedJobs, null, 2));
    console.log(`Seeded ${formattedJobs.length} jobs successfully!`);
  } catch (error) {
    console.error("Failed to seed jobs:", error);
  }
}

run();
