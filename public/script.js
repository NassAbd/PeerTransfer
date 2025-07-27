
document.addEventListener('DOMContentLoaded', () => {
  const secretInput = document.getElementById('secretInput');
  const linkInput = document.getElementById('linkInput');
  const sendButton = document.getElementById('sendButton');
  const receiveSecretInput = document.getElementById('receiveSecretInput');
  const receiveButton = document.getElementById('receiveButton');
  const sharedLink = document.getElementById('sharedLink');
  const uploadSecretInput = document.getElementById('uploadSecretInput');
  const fileInput = document.getElementById('fileInput');
  const uploadButton = document.getElementById('uploadButton');
  const downloadSecretInput = document.getElementById('downloadSecretInput');
  const fetchFilesButton = document.getElementById('fetchFilesButton');
  const fileList = document.getElementById('fileList');

  sendButton.addEventListener('click', () => {
    const secret = secretInput.value;
    const link = linkInput.value;

    fetch('/setLink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ secret, link })
    })
    .then(response => {
      if (response.ok) {
        alert('Link shared successfully!');
        linkInput.value = '';
      } else {
        alert('Error sharing link. Check your secret.');
      }
    });
  });

  receiveButton.addEventListener('click', () => {
    const secret = receiveSecretInput.value;

    fetch(`/getLink?secret=${secret}`)
      .then(response => response.json())
      .then(data => {
        if (data.link) {
          sharedLink.innerHTML = `<a href="${data.link}" target="_blank">${data.link}</a>`;
        } else {
          sharedLink.textContent = 'No link shared yet.';
        }
      })
      .catch(() => {
        sharedLink.textContent = 'Could not retrieve link. Check your secret.';
      });
  });

  uploadButton.addEventListener('click', () => {
    const secret = uploadSecretInput.value;
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('file', file);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        alert('File uploaded successfully!');
        fileInput.value = '';
      } else {
        alert('Error uploading file. Check your secret.');
      }
    });
  });

  fetchFilesButton.addEventListener('click', () => {
    const secret = downloadSecretInput.value;
    fetchFiles(secret);
  });

  function fetchFiles(secret) {
    fetch(`/files?secret=${secret}`)
      .then(response => response.json())
      .then(files => {
        fileList.innerHTML = '';
        if (files.length > 0) {
          files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.innerHTML = `<a href="/download/${file}?secret=${secret}" download>${file}</a>`;
            fileList.appendChild(fileElement);
          });
        } else {
          fileList.textContent = 'No files shared yet.';
        }
      })
      .catch(() => {
        fileList.textContent = 'Could not retrieve files. Check your secret.';
      });
  }
});
