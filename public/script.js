
document.addEventListener('DOMContentLoaded', () => {
  const secretInput = document.getElementById('secretInput');
  const linkInput = document.getElementById('linkInput');
  const sendButton = document.getElementById('sendButton');
  const receiveSecretInput = document.getElementById('receiveSecretInput');
  const receiveButton = document.getElementById('receiveButton');
  const sharedLink = document.getElementById('sharedLink');

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
});
