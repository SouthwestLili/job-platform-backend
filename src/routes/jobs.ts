import { Router } from 'express';
import { z } from 'zod';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  descriptionText: string;
  applyUrl: string;
  postedAt: string; // ISO
};

// —— mock data: jobs —— //
const mockJobs: Job[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Frontend Developer (React)',
    company: 'Prototyp3',
    location: 'Ottawa, ON',
    descriptionText: 'Build modern React apps. Tailwind, TypeScript preferred.',
    applyUrl: 'https://example.com/jobs/1',
    postedAt: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Full Stack Developer (Node/React)',
    company: 'JobMate',
    location: 'Toronto, ON',
    descriptionText: 'Node.js, Express, PostgreSQL. Experience with REST APIs.',
    applyUrl: 'https://example.com/jobs/2',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Backend Engineer (Node.js)',
    company: 'StartupX',
    location: 'Remote - Canada',
    descriptionText: 'Design APIs, authentication, and job search services.',
    applyUrl: 'https://example.com/jobs/3',
    postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];

const router = Router();

// GET /api/jobs/search
router.get('/search', async (req, res, next) => {
  try {
    // check query params 
    const schema = z.object({
      q: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).default(20),
      offset: z.coerce.number().min(0).default(0),
    });

    const { q, company, location, limit, offset } = schema.parse(req.query);

    // filter jobs 
    const qlc = (s: string) => s.toLowerCase();
    let filtered = mockJobs;

    if (q && q.trim()) {
      const k = qlc(q);
      filtered = filtered.filter(j =>
        qlc(j.title).includes(k) ||
        qlc(j.descriptionText).includes(k) ||
        qlc(j.company).includes(k)
      );
    }
    if (company && company.trim()) {
      const k = qlc(company);
      filtered = filtered.filter(j => qlc(j.company).includes(k));
    }
    if (location && location.trim()) {
      const k = qlc(location);
      filtered = filtered.filter(j => qlc(j.location).includes(k));
    }

    // filter jobs by date
    filtered = filtered.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));

    // split page
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);

    res.json({ data, pagination: { limit, offset, total } });
  } catch (err) {
    next(err);
  }
});

export default router;
