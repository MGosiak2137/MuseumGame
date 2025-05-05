function goHome() {
    hideAllScreens();
    document.getElementById('main-screen').classList.remove('hidden');
    currentMode = null;
}

function hideAllScreens() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
}
function showJoinScreen() {
    hideAllScreens();
    document.getElementById('join-screen').classList.remove('hidden');
}