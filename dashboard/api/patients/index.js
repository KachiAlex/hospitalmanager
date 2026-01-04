import { db } from '@/server/db';

export default async function handler(req, res) {
  try {
    const patients = await db.query('SELECT * FROM patients');
    res.status(200).json(patients.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
