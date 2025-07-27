

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Hardcoded secrets for two users
const secrets = {
  user1: 'secret1',
  user2: 'secret2'
};

let sharedLink = '';

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

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

// Endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    const { secret } = req.body;
    if (Object.values(secrets).includes(secret)) {
        res.send('File uploaded successfully');
    } else {
        // If unauthorized, delete the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting unauthorized upload:', err);
            }
        });
        res.status(401).send('Unauthorized');
    }
});


// Endpoint to get the list of files
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

// Endpoint to download a file
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

