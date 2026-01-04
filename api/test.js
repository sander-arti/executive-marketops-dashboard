export default function handler(req, res) {
  res.status(200).json({ message: 'Test endpoint works', timestamp: new Date().toISOString() });
}
