const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const secrets = {
  user1: 'secret1',
  user2: 'secret2'
};

let sharedLink = '';

// Multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON bodies for other routes
app.use(express.json());
app.use(express.static('public'));

// Upload endpoint (single file, requires ?secret= in query or header x-secret)
app.post('/upload', async (req, res, next) => {
  const secret = req.query.secret || req.headers['x-secret'];

  if (!Object.values(secrets).includes(secret)) {
    return res.status(401).send('Unauthorized');
  }

  try {
    // Clear upload folder
    const files = await fs.promises.readdir('uploads/');
    await Promise.all(
      files.map(file => fs.promises.unlink(path.join('uploads/', file)))
    );

    // ✅ Pass to Multer after clearing
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).send('Upload failed');
      }
      res.send('File uploaded successfully');
    });

  } catch (err) {
    console.error('Error clearing uploads:', err);
    res.status(500).send('Server error while clearing uploads');
  }
});

// Example: /getLink, /setLink (same as before)
app.get('/getLink', (req, res) => {
  const { secret } = req.query;
  if (Object.values(secrets).includes(secret)) {
    res.json({ link: sharedLink });
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.post('/setLink', (req, res) => {
  const { secret, link } = req.body;
  if (Object.values(secrets).includes(secret)) {
    sharedLink = link;
    res.send('Link shared successfully');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.get('/files', (req, res) => {
  const { secret } = req.query;
  if (Object.values(secrets).includes(secret)) {
    fs.readdir('uploads/', (err, files) => {
      if (err) {
        res.status(500).send('Unable to scan files');
      } else {
        res.json(files);
      }
    });
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.get('/download/:filename', (req, res) => {
  const { secret } = req.query;
  if (Object.values(secrets).includes(secret)) {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.download(filePath, filename, (err) => {
      if (err) {
        res.status(404).send('File not found');
      }
    });
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
