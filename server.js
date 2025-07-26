
const express = require('express');
const app = express();
const port = 3000;

// Hardcoded secrets for two users
const secrets = {
  user1: 'secret1',
  user2: 'secret2'
};

let sharedLink = '';

app.use(express.json());
app.use(express.static('public'));

// Endpoint to get the shared link
app.get('/getLink', (req, res) => {
  const { secret } = req.query;
  if (Object.values(secrets).includes(secret)) {
    res.json({ link: sharedLink });
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Endpoint to set the shared link
app.post('/setLink', (req, res) => {
  const { secret, link } = req.body;
  if (Object.values(secrets).includes(secret)) {
    sharedLink = link;
    res.send('Link shared successfully');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
