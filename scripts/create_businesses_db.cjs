// Script para crear y poblar la base de datos SQLite con los negocios
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../businesses.db");
const jsonPath = path.join(__dirname, "../public/data/businesses.json");

// Eliminar la base de datos si ya existe
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new sqlite3.Database(dbPath);

const businesses = JSON.parse(fs.readFileSync(jsonPath, "utf8")).businesses;

db.serialize(() => {
  db.run(`CREATE TABLE businesses (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    category TEXT,
    island TEXT,
    location TEXT,
    coverImage TEXT,
    logo TEXT,
    rating REAL,
    priceRange TEXT,
    featured INTEGER,
    owner_id INTEGER -- Nuevo campo para asociar el negocio a un usuario
  )`);

  db.run(`CREATE TABLE contacts (
    business_id INTEGER,
    phone TEXT,
    email TEXT,
    website TEXT,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
  )`);

  db.run(`CREATE TABLE amenities (
    business_id INTEGER,
    amenity TEXT,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
  )`);

  db.run(`CREATE TABLE gallery (
    business_id INTEGER,
    image TEXT,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
  )`);

  db.run(`CREATE TABLE coordinates (
    business_id INTEGER,
    lat REAL,
    lng REAL,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER,
    title TEXT,
    content TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    business_id INTEGER,
    post_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    business_id INTEGER,
    post_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    business_id INTEGER,
    post_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    business_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    type TEXT,
    name TEXT,
    avatar TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    business_id INTEGER,
    rating INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const businessStmt = db.prepare(
    `INSERT INTO businesses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const contactStmt = db.prepare(`INSERT INTO contacts VALUES (?, ?, ?, ?)`);
  const amenityStmt = db.prepare(`INSERT INTO amenities VALUES (?, ?)`);
  const galleryStmt = db.prepare(`INSERT INTO gallery VALUES (?, ?)`);
  const coordStmt = db.prepare(`INSERT INTO coordinates VALUES (?, ?, ?)`);

  businesses.slice(0, 15).forEach((biz) => {
    businessStmt.run(
      biz.id,
      biz.name,
      biz.description,
      biz.category,
      biz.island,
      biz.location,
      biz.coverImage,
      biz.logo,
      biz.rating,
      biz.priceRange,
      biz.featured ? 1 : 0
    );
    if (biz.contact) {
      contactStmt.run(
        biz.id,
        biz.contact.phone || null,
        biz.contact.email || null,
        biz.contact.website || null
      );
    }
    if (Array.isArray(biz.amenities)) {
      biz.amenities.forEach((a) => amenityStmt.run(biz.id, a));
    }
    if (Array.isArray(biz.gallery)) {
      biz.gallery.forEach((img) => galleryStmt.run(biz.id, img));
    }
    if (biz.coordinates) {
      coordStmt.run(biz.id, biz.coordinates.lat, biz.coordinates.lng);
    }
  });

  businessStmt.finalize();
  contactStmt.finalize();
  amenityStmt.finalize();
  galleryStmt.finalize();
  coordStmt.finalize();

  db.close();
  console.log("Base de datos creada y poblada exitosamente con 15 negocios.");
});
