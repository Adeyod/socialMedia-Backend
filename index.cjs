import express from 'express';

import path from 'path';

const app = express();

const port = 8800;

// Middlewares
app.use(express.json());

// serving my static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/verify', (req, res) => {
  console.log('done');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
