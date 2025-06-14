const photos = [];
let answers = {};

function switchTab(id) {
  document.querySelectorAll('.onglet').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Gestion caméra et photos
async function startProcess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('video');
    video.srcObject = stream;
    video.style.display = 'block';

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let count = 0;
    const interval = setInterval(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      photos.push(canvas.toDataURL('image/png'));
      count++;
      if (count === 5) {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
        video.style.display = 'none';
        document.getElementById('form').style.display = 'block';
      }
    }, 1000);
  } catch (err) {
    alert('Accès caméra refusé : ' + err);
  }
}

// OpenAI call (clé supprimée pour sécurité)
async function askOpenAI(question) {
  // Remplacez 'VOTRE_CLE_API' par votre clé OpenAI côté client (non recommandé) ou utilisez un backend sécurisé.
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer VOTRE_CLE_API'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: question }],
      max_tokens: 100
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

document.getElementById('startBtn').addEventListener('click', startProcess);

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  answers = { name, timestamp: new Date().toLocaleString() };

  // Appel OpenAI
  const message = await askOpenAI(`Bonjour ${name}, merci d'avoir envoyé vos photos. Que puis-je faire pour vous ?`);
  alert(message);

  // Sauvegarde dans localStorage
  const existing = JSON.parse(localStorage.getItem('submissions') || '[]');
  existing.push({ answers, photos });
  localStorage.setItem('submissions', JSON.stringify(existing));

  document.getElementById('merci').innerText = '✅ Merci d'avoir répondu !';
  document.getElementById('form').style.display = 'none';
});

document.getElementById('adminBtn').addEventListener('click', () => {
  const pass = document.getElementById('adminPass').value;
  if (pass === 'admin123') {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    loadAdminData();
  } else {
    alert('Mot de passe incorrect.');
  }
});

function loadAdminData() {
  const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
  const container = document.getElementById('adminData');
  container.innerHTML = '';
  submissions.forEach((item, i) => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${i + 1}. ${item.answers.name} (${item.answers.timestamp})</strong><br>`;
    item.photos.forEach(photo => {
      const img = document.createElement('img');
      img.src = photo;
      div.appendChild(img);
    });
    container.appendChild(div);
  });
} 