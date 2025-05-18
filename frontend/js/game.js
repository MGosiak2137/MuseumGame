// Tutaj będzie logika rozgrywki (np. system rund, rzuty kostką, itp.).
console.log('Gra się rozpoczęła! Do zaimplementowania.');
//INSTEUKCJA
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