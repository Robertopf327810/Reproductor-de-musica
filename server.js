const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Directorios
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const DB_FILE = path.join(__dirname, 'database.json');

// Inicializar base de datos si no existe
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [],
    songs: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({ storage });

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'music-player')));
app.use('/uploads', express.static(uploadDir));

// --- RUTAS API ---

// 1. Registro
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Faltan datos" });

  const db = readDB();
  const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return res.status(400).json({ error: "El usuario ya existe" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: db.users.length > 0 ? db.users[db.users.length - 1].id + 1 : 1,
    username,
    password_hash: hash,
    tema: 'dark',
    volumen: 0.8
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ id: newUser.id, username: newUser.username, tema: newUser.tema, volumen: newUser.volumen });
});

// 2. Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: "Credenciales incorrectas" });

  res.json({ id: user.id, username: user.username, tema: user.tema, volumen: user.volumen });
});

// 3. Preferencias
app.put('/api/preferences', (req, res) => {
  const { userId, tema, volumen } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === parseInt(userId));

  if (user) {
    if (tema !== undefined) user.tema = tema;
    if (volumen !== undefined) user.volumen = volumen;
    writeDB(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Usuario no encontrado" });
});

// 4. Subir Canción
app.post('/api/upload', upload.single('audio'), (req, res) => {
  const { userId, title, artist } = req.body;
  if (!req.file) return res.status(400).json({ error: "No se subió archivo" });

  const db = readDB();
  const newSong = {
    id: db.songs.length > 0 ? db.songs[db.songs.length - 1].id + 1 : 1,
    usuario_id: parseInt(userId),
    title: title || req.file.originalname,
    artist: artist || "Desconocido",
    src: `/uploads/${req.file.filename}`,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80"
  };

  db.songs.push(newSong);
  writeDB(db);

  res.json(newSong);
});

// 5. Obtener Canciones del Usuario
app.get('/api/songs/:userId', (req, res) => {
  const db = readDB();
  const userSongs = db.songs.filter(s => s.usuario_id === parseInt(req.params.userId));
  res.json(userSongs);
});

app.listen(PORT, () => {
  console.log(`\nServidor corriendo en: http://localhost:${PORT}`);
});