import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
