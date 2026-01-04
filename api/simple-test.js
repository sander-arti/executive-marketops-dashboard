export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    message: 'Simple JavaScript API works!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
