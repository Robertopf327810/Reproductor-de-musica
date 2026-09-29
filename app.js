// Base de datos por defecto (Mínimo 6 canciones sin copyright)
const DEFAULT_PLAYLISTS = [
  {
    id: "col-lofi",
    name: "Focus & Chill Vibes",
    desc: "Melodías suaves para programación y concentración profunda.",
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
    id: "col-acoustic",
    name: "Acoustic Horizon",
    desc: "Cuerdas y armonías relajantes.",
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
    id: "col-synth",
    name: "Synth Neon Wave",
    desc: "Retrofuturismo y sintetizadores.",
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
    id: "col-user",
    name: "Mis Subidas",
    desc: "Pistas subidas localmente.",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    songs: []
  }
];

// Motor de Base de Datos Nativo (IndexedDB)
const DB = {
  dbName: "PulseMusicDB",
  version: 1,
  instance: null,

  init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "username" });
        }
        if (!db.objectStoreNames.contains("playlists")) {
          const plStore = db.createObjectStore("playlists", { keyPath: "id" });
          plStore.createIndex("username", "username", { unique: false });
        }
        if (!db.objectStoreNames.contains("user_songs")) {
          const sStore = db.createObjectStore("user_songs", { keyPath: "id", autoIncrement: true });
          sStore.createIndex("username", "username", { unique: false });
        }
      };
      req.onsuccess = (e) => {
        this.instance = e.target.result;
        resolve();
      };
      req.onerror = (e) => reject(e);
    });
  },

  saveUser(username, password) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(["users"], "readwrite");
      const store = tx.objectStore("users");
      const user = { username, password, theme: "dark", volume: 0.8 };
      const req = store.add(user);
      req.onsuccess = () => resolve(user);
      req.onerror = () => reject("El usuario ya existe");
    });
  },

  getUser(username) {
    return new Promise((resolve) => {
      const tx = this.instance.transaction(["users"], "readonly");
      const req = tx.objectStore("users").get(username);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  },

  updatePreferences(username, theme, volume) {
    return new Promise((resolve) => {
      const tx = this.instance.transaction(["users"], "readwrite");
      const store = tx.objectStore("users");
      const req = store.get(username);
      req.onsuccess = () => {
        const u = req.result;
        if (u) {
          u.theme = theme;
          u.volume = volume;
          store.put(u);
        }
        resolve();
      };
    });
  },

  savePlaylist(username, playlist) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(["playlists"], "readwrite");
      const store = tx.objectStore("playlists");
      const record = { username, ...playlist };
      const req = store.add(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  },

  getUserPlaylists(username) {
    return new Promise((resolve) => {
      const tx = this.instance.transaction(["playlists"], "readonly");
      const req = tx.objectStore("playlists").index("username").getAll(username);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  saveSong(username, song) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(["user_songs"], "readwrite");
      const req = tx.objectStore("user_songs").add({ username, ...song });
      req.onsuccess = () => resolve(song);
      req.onerror = (e) => reject(e);
    });
  },

  getUserSongs(username) {
    return new Promise((resolve) => {
      const tx = this.instance.transaction(["user_songs"], "readonly");
      const req = tx.objectStore("user_songs").index("username").getAll(username);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }
};

let collections = [...DEFAULT_PLAYLISTS];

const State = {
  currentUser: null,
  activeColIndex: 0,
  playingColIndex: 0,
  currentSongIndex: 0,
  isPlaying: false,
  theme: "dark"
};

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
  nowPlayingBlock: document.querySelector(".now-playing"),
  playlistNav: document.getElementById("playlist-nav"),
  tracksGrid: document.getElementById("tracks-grid"),
  currentPlName: document.getElementById("current-pl-name"),
  currentPlDesc: document.getElementById("current-pl-desc"),
  currentPlCover: document.getElementById("current-pl-cover"),
  trackCountBadge: document.getElementById("track-count-badge"),
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
  themeToggle: document.getElementById("theme-toggle"),
  openCreatePlBtn: document.getElementById("open-create-pl-btn"),
  playlistModal: document.getElementById("playlist-modal"),
  playlistForm: document.getElementById("playlist-form"),
  plNameInput: document.getElementById("pl-name-input"),
  plDescInput: document.getElementById("pl-desc-input"),
  closePlModal: document.getElementById("close-pl-modal")
};

function renderSidebar() {
  DOM.playlistNav.innerHTML = "";
  collections.forEach((col, idx) => {
    const li = document.createElement("li");
    li.className = idx === State.activeColIndex ? "active" : "";
    li.innerHTML = `<i class="fa-solid fa-shapes"></i> <span>${col.name}</span>`;
    li.addEventListener("click", () => {
      State.activeColIndex = idx;
      renderSidebar();
      renderCollectionContent();
    });
    DOM.playlistNav.appendChild(li);
  });
}

function renderCollectionContent() {
  const col = collections[State.activeColIndex];
  DOM.currentPlName.textContent = col.name;
  DOM.currentPlDesc.textContent = col.desc;
  DOM.currentPlCover.src = col.cover;
  DOM.trackCountBadge.innerHTML = `<i class="fa-solid fa-music"></i> ${col.songs.length} pistas`;

  DOM.tracksGrid.innerHTML = "";

  if (col.songs.length === 0) {
    DOM.tracksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; color: var(--text-dim); padding: 30px; text-align: center;">
        No hay pistas en esta playlist. ¡Sube canciones o agrégalas!
      </div>`;
    return;
  }

  col.songs.forEach((song, idx) => {
    const isPlayingThis = (State.playingColIndex === State.activeColIndex) && (State.currentSongIndex === idx);
    const card = document.createElement("div");
    card.className = `song-card ${isPlayingThis ? "playing" : ""}`;
    card.innerHTML = `
      <div class="card-cover">
        <img src="${song.cover}" alt="cover">
        <div class="card-play-overlay">
          <i class="fa-solid ${isPlayingThis && State.isPlaying ? "fa-pause" : "fa-play"}"></i>
        </div>
      </div>
      <div class="card-title">${song.title}</div>
      <div class="card-artist">${song.artist}</div>
    `;

    card.addEventListener("click", () => {
      if (isPlayingThis) {
        togglePlay();
      } else {
        State.playingColIndex = State.activeColIndex;
        loadAndPlay(idx);
      }
    });

    DOM.tracksGrid.appendChild(card);
  });
}

function loadAndPlay(idx) {
  const col = collections[State.playingColIndex];
  if (!col || !col.songs[idx]) return;

  State.currentSongIndex = idx;
  const song = col.songs[idx];

  DOM.audio.src = song.src;
  DOM.playerTitle.textContent = song.title;
  DOM.playerArtist.textContent = song.artist;
  DOM.playerThumb.src = song.cover;

  renderCollectionContent();
  playAudio();
}

function playAudio() {
  State.isPlaying = true;
  DOM.audio.play();
  DOM.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  DOM.nowPlayingBlock.classList.add("is-rotating");
}

function pauseAudio() {
  State.isPlaying = false;
  DOM.audio.pause();
  DOM.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  DOM.nowPlayingBlock.classList.remove("is-rotating");
}

function togglePlay() {
  if (State.isPlaying) pauseAudio();
  else playAudio();
  renderCollectionContent();
}

function nextSong() {
  const col = collections[State.playingColIndex];
  if (!col || col.songs.length === 0) return;
  let next = State.currentSongIndex + 1;
  if (next >= col.songs.length) next = 0;
  loadAndPlay(next);
}

function prevSong() {
  const col = collections[State.playingColIndex];
  if (!col || col.songs.length === 0) return;
  let prev = State.currentSongIndex - 1;
  if (prev < 0) prev = col.songs.length - 1;
  loadAndPlay(prev);
}

function formatSecs(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

DOM.fileUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const audioUrl = URL.createObjectURL(file);
  const newSong = {
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: State.currentUser ? State.currentUser.username : "Pista Local",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
    src: audioUrl
  };

  collections[State.activeColIndex].songs.push(newSong);
  State.playingColIndex = State.activeColIndex;

  if (State.currentUser) {
    await DB.saveSong(State.currentUser.username, newSong);
  }

  renderCollectionContent();
  loadAndPlay(collections[State.activeColIndex].songs.length - 1);
});

DOM.openCreatePlBtn.addEventListener("click", () => {
  if (!State.currentUser) {
    alert("Debes iniciar sesión para crear y guardar tus playlists.");
    return;
  }
  DOM.playlistModal.classList.remove("hidden");
});

DOM.closePlModal.addEventListener("click", () => DOM.playlistModal.classList.add("hidden"));

DOM.playlistForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = DOM.plNameInput.value.trim();
  const desc = DOM.plDescInput.value.trim();

  const newPl = {
    id: "pl-" + Date.now(),
    name,
    desc: desc || "Playlist creada por el usuario",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
    songs: []
  };

  if (State.currentUser) {
    await DB.savePlaylist(State.currentUser.username, newPl);
  }

  collections.push(newPl);
  State.activeColIndex = collections.length - 1;
  renderSidebar();
  renderCollectionContent();
  DOM.playlistModal.classList.add("hidden");
  DOM.playlistForm.reset();
});

DOM.audio.addEventListener("timeupdate", () => {
  if (DOM.audio.duration) {
    DOM.progressBar.value = (DOM.audio.currentTime / DOM.audio.duration) * 100;
    DOM.currentTime.textContent = formatSecs(DOM.audio.currentTime);
  }
});

DOM.audio.addEventListener("loadedmetadata", () => {
  DOM.duration.textContent = formatSecs(DOM.audio.duration);
});

DOM.progressBar.addEventListener("input", () => {
  if (DOM.audio.duration) {
    DOM.audio.currentTime = (DOM.progressBar.value / 100) * DOM.audio.duration;
  }
});

DOM.audio.addEventListener("ended", nextSong);

DOM.volumeBar.addEventListener("input", (e) => {
  DOM.audio.volume = e.target.value / 100;
  if (State.currentUser) {
    DB.updatePreferences(State.currentUser.username, State.theme, DOM.audio.volume);
  }
});

DOM.playBtn.addEventListener("click", togglePlay);
DOM.nextBtn.addEventListener("click", nextSong);
DOM.prevBtn.addEventListener("click", prevSong);

function applyTheme(theme) {
  State.theme = theme;
  document.body.className = theme === "light" ? "theme-light" : "theme-dark";
  DOM.themeToggle.innerHTML = theme === "light" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

DOM.themeToggle.addEventListener("click", () => {
  const nextTheme = State.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  if (State.currentUser) {
    DB.updatePreferences(State.currentUser.username, nextTheme, DOM.audio.volume);
  }
});

let isRegisterMode = false;

function renderUserBadge() {
  if (State.currentUser) {
    DOM.authSection.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <small style="color:var(--text-dim); display:block;">Conectado</small>
          <b>${State.currentUser.username}</b>
        </div>
        <button id="logout-btn" style="background:none; border:none; color:var(--text-dim); cursor:pointer;"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", logout);
  } else {
    DOM.authSection.innerHTML = `<button class="submit-btn" id="open-auth-btn" style="margin-top:0;">Identificarse</button>`;
    document.getElementById("open-auth-btn").addEventListener("click", () => openModal(false));
  }
}

function openModal(register = false) {
  isRegisterMode = register;
  DOM.modalTitle.textContent = isRegisterMode ? "Crear Perfil" : "Iniciar Sesión";
  DOM.modalSubmitBtn.textContent = isRegisterMode ? "Registrar" : "Entrar";
  DOM.authSwitchPrompt.textContent = isRegisterMode ? "¿Tienes cuenta?" : "¿Nuevo aquí?";
  DOM.authSwitchLink.textContent = isRegisterMode ? "Inicia Sesión" : "Crea tu cuenta";
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

  if (isRegisterMode) {
    try {
      const user = await DB.saveUser(username, password);
      await loginSuccess(user);
      closeModal();
    } catch (err) {
      alert(err);
    }
  } else {
    const user = await DB.getUser(username);
    if (user && user.password === password) {
      await loginSuccess(user);
      closeModal();
    } else {
      alert("Credenciales incorrectas");
    }
  }
});

async function loginSuccess(user) {
  State.currentUser = user;
  renderUserBadge();

  if (user.theme) applyTheme(user.theme);
  if (user.volume !== undefined) {
    DOM.audio.volume = user.volume;
    DOM.volumeBar.value = user.volume * 100;
  }

  const userSongs = await DB.getUserSongs(user.username);
  collections[3].songs = userSongs;

  const userPlaylists = await DB.getUserPlaylists(user.username);
  collections = [...DEFAULT_PLAYLISTS.slice(0, 4), ...userPlaylists];

  renderSidebar();
  renderCollectionContent();
}

function logout() {
  State.currentUser = null;
  collections = [...DEFAULT_PLAYLISTS];
  collections[3].songs = [];
  applyTheme("dark");
  renderUserBadge();
  renderSidebar();
  renderCollectionContent();
}

window.addEventListener("DOMContentLoaded", async () => {
  await DB.init();
  renderUserBadge();
  renderSidebar();
  renderCollectionContent();
  loadAndPlay(0);
  DOM.audio.volume = DOM.volumeBar.value / 100;
});