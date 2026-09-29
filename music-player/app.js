// Base de datos de Playlists estilo Spotify con mínimo 6 canciones
const PLAYLISTS = [
  {
    id: "pl-lofi",
    name: "Lo-Fi Study Beats",
    desc: "Música tranquila para concentración y estudio.",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80",
    songs: [
      {
        title: "Lofi Study Beat",
        artist: "FASSounds",
        cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
      },
      {
        title: "Deep Focus Ambient",
        artist: "Coma-Media",
        cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
        src: "https://cdn.pixabay.com/download/audio/2021/11/24/audio_824892c90c.mp3?filename=the-beat-of-nature-122841.mp3"
      }
    ]
  },
  {
    id: "pl-chill",
    name: "Acoustic & Nature",
    desc: "Guitarras acústicas y sonidos relajantes.",
    cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
    songs: [
      {
        title: "Chill Acoustic Guitar",
        artist: "Olexy",
        cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitars-ambient-uplifting-11200.mp3"
      },
      {
        title: "Spirit Blossom",
        artist: "ZakharValaha",
        cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80",
        src: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=spirit-blossom-15285.mp3"
      }
    ]
  },
  {
    id: "pl-electronic",
    name: "Retro Synth & Future",
    desc: "Ondas electrónicas y sintetizadores retro.",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
    songs: [
      {
        title: "Synthwave Sunset",
        artist: "AlexiAction",
        cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3"
      },
      {
        title: "Future Beats",
        artist: "Lesfm",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
        src: "https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=electronic-future-beats-117997.mp3"
      }
    ]
  },
  {
    id: "pl-user",
    name: "Tus Subidas",
    desc: "Tus canciones subidas al servidor.",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    songs: []
  }
];

// Estado
const State = {
  currentUser: null,
  activePlaylistIndex: 0,
  currentSongIndex: 0,
  isPlaying: false,
  theme: "dark"
};

// DOM
const DOM = {
  audio: document.getElementById("audio-engine"),
  playBtn: document.getElementById("play-btn"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  progressBar: document.getElementById("progress-bar"),
  volumeBar: document.getElementById("volume-bar"),
  currentTime: document.getElementById("current-time"),
  duration: document.getElementById("duration"),
  playerTitle: document.getElementById("player-title"),
  playerArtist: document.getElementById("player-artist"),
  playerThumb: document.getElementById("player-thumb"),
  playlistTabs: document.getElementById("playlist-tabs"),
  tracksListView: document.getElementById("tracks-list-view"),
  currentPlName: document.getElementById("current-pl-name"),
  currentPlDesc: document.getElementById("current-pl-desc"),
  currentPlCover: document.getElementById("current-pl-cover"),
  fileUpload: document.getElementById("file-upload"),
  authSection: document.getElementById("auth-section"),
  authModal: document.getElementById("auth-modal"),
  authForm: document.getElementById("auth-form"),
  modalTitle: document.getElementById("modal-title"),
  usernameInput: document.getElementById("username-input"),
  passwordInput: document.getElementById("password-input"),
  modalSubmitBtn: document.getElementById("modal-submit-btn"),
  authSwitchLink: document.getElementById("auth-switch-link"),
  authSwitchPrompt: document.getElementById("auth-switch-prompt"),
  closeModal: document.getElementById("close-modal"),
  themeToggle: document.getElementById("theme-toggle")
};

// Renderizar lista de Playlists en el Sidebar
function renderPlaylistsSidebar() {
  DOM.playlistTabs.innerHTML = "";
  PLAYLISTS.forEach((pl, idx) => {
    const li = document.createElement("li");
    li.className = idx === State.activePlaylistIndex ? "active" : "";
    li.innerHTML = `<i class="fa-solid fa-music"></i> <span>${pl.name}</span>`;
    li.addEventListener("click", () => {
      State.activePlaylistIndex = idx;
      renderActivePlaylist();
      renderPlaylistsSidebar();
    });
    DOM.playlistTabs.appendChild(li);
  });
}

// Renderizar canciones de la Playlist seleccionada
function renderActivePlaylist() {
  const pl = PLAYLISTS[State.activePlaylistIndex];
  DOM.currentPlName.textContent = pl.name;
  DOM.currentPlDesc.textContent = pl.desc;
  DOM.currentPlCover.src = pl.cover;

  DOM.tracksListView.innerHTML = "";

  if (pl.songs.length === 0) {
    DOM.tracksListView.innerHTML = `<li style="padding: 20px; color: var(--text-sub);">No hay canciones aquí todavía. ¡Sube una!</li>`;
    return;
  }

  pl.songs.forEach((song, idx) => {
    const li = document.createElement("li");
    const isPlayingCurrent = State.activePlaylistIndex === State.playingPlaylistIndex && idx === State.currentSongIndex;
    li.className = `track-row ${isPlayingCurrent ? "active" : ""}`;
    li.innerHTML = `
      <span class="num">${idx + 1}</span>
      <span class="title">${song.title}</span>
      <span class="artist">${song.artist}</span>
    `;
    li.addEventListener("click", () => {
      State.playingPlaylistIndex = State.activePlaylistIndex;
      loadAndPlay(idx);
    });
    DOM.tracksListView.appendChild(li);
  });
}

function loadAndPlay(songIndex) {
  const pl = PLAYLISTS[State.playingPlaylistIndex || State.activePlaylistIndex];
  if (!pl || !pl.songs[songIndex]) return;

  State.currentSongIndex = songIndex;
  const song = pl.songs[songIndex];

  DOM.audio.src = song.src;
  DOM.playerTitle.textContent = song.title;
  DOM.playerArtist.textContent = song.artist;
  DOM.playerThumb.src = song.cover;

  renderActivePlaylist();
  playTrack();
}

function playTrack() {
  State.isPlaying = true;
  DOM.audio.play();
  DOM.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

function pauseTrack() {
  State.isPlaying = false;
  DOM.audio.pause();
  DOM.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function togglePlay() {
  if (State.isPlaying) pauseTrack();
  else playTrack();
}

function nextTrack() {
  const pl = PLAYLISTS[State.playingPlaylistIndex ?? State.activePlaylistIndex];
  if (!pl || pl.songs.length === 0) return;
  let next = State.currentSongIndex + 1;
  if (next >= pl.songs.length) next = 0; // bucle
  loadAndPlay(next);
}

function prevTrack() {
  const pl = PLAYLISTS[State.playingPlaylistIndex ?? State.activePlaylistIndex];
  if (!pl || pl.songs.length === 0) return;
  let prev = State.currentSongIndex - 1;
  if (prev < 0) prev = pl.songs.length - 1;
  loadAndPlay(prev);
}

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// Subida de Canciones
DOM.fileUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!State.currentUser) {
    alert("Inicia sesión para registrar canciones en la base de datos.");
    return;
  }

  const formData = new FormData();
  formData.append("audio", file);
  formData.append("userId", State.currentUser.id);
  formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
  formData.append("artist", State.currentUser.username);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const newSong = await res.json();
    PLAYLISTS[3].songs.push(newSong); // Agregar a 'Tus Subidas'
    State.activePlaylistIndex = 3;
    renderPlaylistsSidebar();
    renderActivePlaylist();
    loadAndPlay(PLAYLISTS[3].songs.length - 1);
  } catch (err) {
    alert("Error al subir pista.");
  }
});

// Eventos de barra y progreso
DOM.audio.addEventListener("timeupdate", () => {
  if (DOM.audio.duration) {
    DOM.progressBar.value = (DOM.audio.currentTime / DOM.audio.duration) * 100;
    DOM.currentTime.textContent = formatTime(DOM.audio.currentTime);
  }
});

DOM.audio.addEventListener("loadedmetadata", () => {
  DOM.duration.textContent = formatTime(DOM.audio.duration);
});

DOM.progressBar.addEventListener("input", () => {
  if (DOM.audio.duration) {
    DOM.audio.currentTime = (DOM.progressBar.value / 100) * DOM.audio.duration;
  }
});

// Cambio automático al finalizar
DOM.audio.addEventListener("ended", nextTrack);

DOM.volumeBar.addEventListener("input", (e) => {
  DOM.audio.volume = e.target.value / 100;
  saveUserPreferences();
});

DOM.playBtn.addEventListener("click", togglePlay);
DOM.nextBtn.addEventListener("click", nextTrack);
DOM.prevBtn.addEventListener("click", prevTrack);

// Tema
function applyTheme(theme) {
  State.theme = theme;
  document.body.className = theme === "light" ? "theme-light" : "theme-dark";
  DOM.themeToggle.innerHTML = theme === "light" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

DOM.themeToggle.addEventListener("click", () => {
  applyTheme(State.theme === "dark" ? "light" : "dark");
  saveUserPreferences();
});

async function saveUserPreferences() {
  if (!State.currentUser) return;
  await fetch("/api/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: State.currentUser.id,
      tema: State.theme,
      volumen: DOM.audio.volume
    })
  });
}

// Modal y Auth
let isRegisterMode = false;

function renderAuthHeader() {
  if (State.currentUser) {
    DOM.authSection.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.85rem;"><i class="fa-regular fa-user"></i> <b>${State.currentUser.username}</b></span>
        <button class="btn-secondary" id="logout-btn">Salir</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", logout);
  } else {
    DOM.authSection.innerHTML = `<button class="btn-primary" style="width:100%;" id="open-login-btn">Iniciar Sesión</button>`;
    document.getElementById("open-login-btn").addEventListener("click", () => openModal(false));
  }
}

function openModal(register = false) {
  isRegisterMode = register;
  DOM.modalTitle.textContent = isRegisterMode ? "Crear Cuenta" : "Iniciar Sesión";
  DOM.modalSubmitBtn.textContent = isRegisterMode ? "Registrar" : "Entrar";
  DOM.authSwitchPrompt.textContent = isRegisterMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
  DOM.authSwitchLink.textContent = isRegisterMode ? "Inicia Sesión" : "Regístrate";
  DOM.authModal.classList.remove("hidden");
}

function closeModal() {
  DOM.authModal.classList.add("hidden");
  DOM.authForm.reset();
}

DOM.closeModal.addEventListener("click", closeModal);
DOM.authSwitchLink.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(!isRegisterMode);
});

DOM.authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = DOM.usernameInput.value.trim();
  const password = DOM.passwordInput.value;
  const endpoint = isRegisterMode ? "/api/register" : "/api/login";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    loginSuccess(data);
    closeModal();
  } catch (err) {
    alert(err.message);
  }
});

async function loginSuccess(user) {
  State.currentUser = user;
  renderAuthHeader();

  if (user.tema) applyTheme(user.tema);
  if (user.volumen !== undefined) {
    DOM.audio.volume = user.volumen;
    DOM.volumeBar.value = user.volumen * 100;
  }

  // Traer canciones subidas de la BD
  const res = await fetch(`/api/songs/${user.id}`);
  const userSongs = await res.json();
  PLAYLISTS[3].songs = userSongs;
  renderActivePlaylist();
}

function logout() {
  State.currentUser = null;
  PLAYLISTS[3].songs = [];
  applyTheme("dark");
  renderAuthHeader();
  renderActivePlaylist();
}

window.addEventListener("DOMContentLoaded", () => {
  renderAuthHeader();
  renderPlaylistsSidebar();
  renderActivePlaylist();
  loadAndPlay(0);
  DOM.audio.volume = DOM.volumeBar.value / 100;
});