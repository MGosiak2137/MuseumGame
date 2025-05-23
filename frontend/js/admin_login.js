document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const pwdInput = document.getElementById('password');
    const pwd = pwdInput.value;
    if (pwd === 'admin') {
      window.location.href = 'admin.html';
    } else {
      alert('Niepoprawne hasło');
      pwdInput.value = '';
      pwdInput.focus();
    }
  });
});
//INSTRUKCJA
function showInstructionOverlay() {
  fetch('./instruction.html')
    .then(res => res.text())
    .then(html => {
      const overlay = document.getElementById('instruction-overlay');
      overlay.innerHTML = html;
      overlay.classList.remove('hidden');
    })
    .catch(err => {
      console.error('Błąd ładowania instrukcji:', err);
    });
}

function closeInstructionOverlay() {
  const overlay = document.getElementById('instruction-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
function loadPage(pageName) {
  fetch(`./${pageName}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
    });
}
window.addEventListener('DOMContentLoaded', () => {
  const pageFromHash = window.location.hash?.substring(1) || '';
  if (pageFromHash) {
    loadPage(pageFromHash);
  }
});