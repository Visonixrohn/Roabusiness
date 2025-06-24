// Backend Express para servir los negocios desde SQLite
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const getLocalExternalIp = require("./getLocalIp.cjs");
const multer = require("multer");

const app = express();
const LOCAL_IP = getLocalExternalIp();
const PORT = 3001;
const dbPath = path.join(__dirname, "../businesses.db");

const upload = multer({
  dest: path.join(__dirname, "../public/uploads"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.get("/api/businesses", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM businesses", [], (err, businesses) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    // Obtener contactos, amenities, gallery y coordinates para cada negocio
    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      db.close();
      return res.json([]);
    }
    db.all(
      `SELECT * FROM contacts WHERE business_id IN (${businessIds.map(() => "?").join(",")})`,
      businessIds,
      (err, contacts) => {
        db.all(
          `SELECT * FROM amenities WHERE business_id IN (${businessIds.map(() => "?").join(",")})`,
          businessIds,
          (err, amenities) => {
            db.all(
              `SELECT * FROM gallery WHERE business_id IN (${businessIds.map(() => "?").join(",")})`,
              businessIds,
              (err, gallery) => {
                db.all(
                  `SELECT * FROM coordinates WHERE business_id IN (${businessIds.map(() => "?").join(",")})`,
                  businessIds,
                  (err, coordinates) => {
                    db.all(
                      `SELECT * FROM schedule WHERE business_id IN (${businessIds.map(() => "?").join(",")})`,
                      businessIds,
                      (err, schedules) => {
                        db.close();
                        // Unir datos
                        const result = businesses.map((biz) => ({
                          ...biz,
                          contact:
                            contacts.find((c) => c.business_id === biz.id) ||
                            {},
                          amenities: amenities
                            .filter((a) => a.business_id === biz.id)
                            .map((a) => a.amenity),
                          gallery: gallery
                            .filter((g) => g.business_id === biz.id)
                            .map((g) => g.image),
                          coordinates:
                            coordinates.find((c) => c.business_id === biz.id) ||
                            null,
                          schedule: schedules
                            .filter((s) => s.business_id === biz.id)
                            .map((s) => ({
                              day: s.day,
                              open: s.open,
                              close: s.close,
                            })),
                        }));
                        res.json(result);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// Endpoint para registrar un nuevo negocio
app.post("/api/businesses", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const biz = req.body;
  if (!biz.name || !biz.category || !biz.island || !biz.location) {
    db.close();
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  db.serialize(() => {
    db.run(
      `INSERT INTO businesses (name, description, category, island, location, coverImage, logo, rating, priceRange, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        biz.name,
        biz.description || "",
        biz.category,
        biz.island,
        biz.location,
        biz.coverImage || "",
        biz.logo || "",
        biz.rating || null,
        biz.priceRange || "",
        biz.featured ? 1 : 0,
      ],
      function (err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: err.message });
        }
        const businessId = this.lastID;
        // Contacto
        if (biz.contact) {
          db.run(
            `INSERT INTO contacts (business_id, phone, email, website) VALUES (?, ?, ?, ?)`,
            [
              businessId,
              biz.contact.phone || "",
              biz.contact.email || "",
              biz.contact.website || "",
            ]
          );
        }
        // Amenidades
        if (Array.isArray(biz.amenities)) {
          biz.amenities.forEach((a) => {
            db.run(
              `INSERT INTO amenities (business_id, amenity) VALUES (?, ?)`,
              [businessId, a]
            );
          });
        }
        // Galería
        if (Array.isArray(biz.gallery)) {
          biz.gallery.forEach((img) => {
            db.run(`INSERT INTO gallery (business_id, image) VALUES (?, ?)`, [
              businessId,
              img,
            ]);
          });
        }
        // Coordenadas
        if (biz.coordinates && biz.coordinates.lat && biz.coordinates.lng) {
          db.run(
            `INSERT INTO coordinates (business_id, lat, lng) VALUES (?, ?, ?)`,
            [businessId, biz.coordinates.lat, biz.coordinates.lng]
          );
        }
        db.close();
        res.json({ success: true, id: businessId });
      }
    );
  });
});

// Obtener publicaciones de un negocio
app.get("/api/businesses/:id/posts", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.id;
  db.all(
    `SELECT 
      posts.*, 
      (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comments_count,
      (SELECT COUNT(*) FROM views WHERE post_id = posts.id) as views_count
     FROM posts WHERE business_id = ? ORDER BY created_at DESC`,
    [businessId],
    (err, posts) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json(posts);
    }
  );
});

// Crear publicación para un negocio
app.post("/api/businesses/:id/posts", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.id;
  const { title, content, image } = req.body;
  console.log(
    "Intentando crear post para negocio:",
    businessId,
    title,
    content,
    image
  );
  if (!title || !content) {
    db.close();
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  db.get("SELECT id FROM businesses WHERE id = ?", [businessId], (err, biz) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    if (!biz) {
      db.close();
      return res.status(404).json({ error: "Negocio no encontrado" });
    }
    db.run(
      "INSERT INTO posts (business_id, title, content, image) VALUES (?, ?, ?, ?)",
      [businessId, title, content, image || ""],
      function (err) {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        console.log("Post creado con id:", this.lastID);
        res.json({ success: true, id: this.lastID });
      }
    );
  });
});

// Editar publicación de un negocio
app.put("/api/posts/:postId", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const postId = req.params.postId;
  const { title, content, image } = req.body;
  db.run(
    "UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?",
    [title, content, image, postId],
    function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Eliminar publicación de un negocio
app.delete("/api/posts/:postId", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const postId = req.params.postId;
  db.run("DELETE FROM posts WHERE id = ?", [postId], function (err) {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Editar datos de un negocio
app.put("/api/businesses/:id", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.id;
  const biz = req.body;

  let pending = 1; // 1 por el update principal
  let errorOccurred = false;

  function done(err) {
    if (errorOccurred) return;
    if (err) {
      errorOccurred = true;
      db.close();
      return res.status(500).json({ error: err.message });
    }
    pending--;
    if (pending === 0) {
      db.close();
      res.json({ success: true });
    }
  }

  // Actualizar datos principales
  db.run(
    `UPDATE businesses SET name=?, description=?, category=?, island=?, location=?, coverImage=?, logo=?, rating=?, priceRange=?, featured=? WHERE id=?`,
    [
      biz.name,
      biz.description || "",
      biz.category,
      biz.island,
      biz.location,
      biz.coverImage || "",
      biz.logo || "",
      biz.rating || null,
      biz.priceRange || "",
      biz.featured ? 1 : 0,
      businessId,
    ],
    done
  );

  // Actualizar o insertar coordenadas
  if (biz.coordinates && biz.coordinates.lat && biz.coordinates.lng) {
    pending++;
    db.get(
      `SELECT * FROM coordinates WHERE business_id = ?`,
      [businessId],
      (err, row) => {
        if (err) return done(err);
        if (row) {
          db.run(
            `UPDATE coordinates SET lat=?, lng=? WHERE business_id=?`,
            [biz.coordinates.lat, biz.coordinates.lng, businessId],
            done
          );
        } else {
          db.run(
            `INSERT INTO coordinates (business_id, lat, lng) VALUES (?, ?, ?)`,
            [businessId, biz.coordinates.lat, biz.coordinates.lng],
            done
          );
        }
      }
    );
  }

  // Actualizar amenities (servicios y amenidades)
  if (Array.isArray(biz.amenities)) {
    pending++;
    db.run(
      `DELETE FROM amenities WHERE business_id = ?`,
      [businessId],
      (err) => {
        if (err) return done(err);
        if (biz.amenities.length === 0) return done();
        let amenityPending = biz.amenities.length;
        biz.amenities.forEach((a) => {
          db.run(
            `INSERT INTO amenities (business_id, amenity) VALUES (?, ?)`,
            [businessId, a],
            (err) => {
              if (err) return done(err);
              amenityPending--;
              if (amenityPending === 0) done();
            }
          );
        });
      }
    );
  }

  // Actualizar o insertar contacto
  if (biz.contact) {
    pending++;
    db.get(
      `SELECT * FROM contacts WHERE business_id = ?`,
      [businessId],
      (err, row) => {
        if (err) return done(err);
        if (row) {
          db.run(
            `UPDATE contacts SET phone=?, email=?, website=? WHERE business_id=?`,
            [
              biz.contact.phone || "",
              biz.contact.email || "",
              biz.contact.website || "",
              businessId,
            ],
            done
          );
        } else {
          db.run(
            `INSERT INTO contacts (business_id, phone, email, website) VALUES (?, ?, ?, ?)`,
            [
              businessId,
              biz.contact.phone || "",
              biz.contact.email || "",
              biz.contact.website || "",
            ],
            done
          );
        }
      }
    );
  }

  // Actualizar horarios (schedule)
  if (Array.isArray(biz.schedule)) {
    pending++;
    db.run(
      `DELETE FROM schedule WHERE business_id = ?`,
      [businessId],
      (err) => {
        if (err) return done(err);
        if (biz.schedule.length === 0) return done();
        let schPending = biz.schedule.length;
        biz.schedule.forEach((sch) => {
          db.run(
            `INSERT INTO schedule (business_id, day, open, close) VALUES (?, ?, ?, ?)`,
            [businessId, sch.day, sch.open, sch.close],
            (err) => {
              if (err) return done(err);
              schPending--;
              if (schPending === 0) done();
            }
          );
        });
      }
    );
  }
});

// Likes para publicaciones (toggle)
app.post("/api/posts/:postId/like", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { userId } = req.body;
  const postId = req.params.postId;
  db.get(
    "SELECT id FROM likes WHERE user_id = ? AND post_id = ?",
    [userId, postId],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        // Ya existe el like, eliminarlo (quitar me gusta)
        db.run("DELETE FROM likes WHERE id = ?", [row.id], function (err) {
          db.close();
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, removed: true });
        });
      } else {
        // No existe, agregar like
        db.run(
          "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
          [userId, postId],
          function (err) {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, added: true });
          }
        );
      }
    }
  );
});
app.get("/api/posts/:postId/likes", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const postId = req.params.postId;
  db.all("SELECT * FROM likes WHERE post_id = ?", [postId], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: rows.length, users: rows.map((r) => r.user_id) });
  });
});
// Comentarios para publicaciones
app.post("/api/posts/:postId/comments", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { userId, content } = req.body;
  const postId = req.params.postId;
  db.run(
    "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)",
    [userId, postId, content],
    function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});
app.get("/api/posts/:postId/comments", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const postId = req.params.postId;
  db.all(
    `SELECT c.*, u.name as userName, u.avatar as userAvatar, u.email as userEmail
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?`,
    [postId],
    (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});
// Eliminar comentario de un post
app.delete("/api/posts/:postId/comments/:commentId", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { postId, commentId } = req.params;
  db.run(
    "DELETE FROM comments WHERE id = ? AND post_id = ?",
    [commentId, postId],
    function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});
// Visualizaciones para negocios
app.post("/api/businesses/:id/view", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { userId } = req.body;
  const businessId = req.params.id;
  db.run(
    "INSERT INTO views (user_id, business_id) VALUES (?, ?)",
    [userId, businessId],
    function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});
app.get("/api/businesses/:id/views", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.id;
  db.all(
    "SELECT * FROM views WHERE business_id = ?",
    [businessId],
    (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ count: rows.length });
    }
  );
});
// Seguir negocio (solo una vez por usuario)
app.post("/api/businesses/:id/follow", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { userId } = req.body;
  const businessId = req.params.id;
  db.get(
    "SELECT * FROM followers WHERE user_id = ? AND business_id = ?",
    [userId, businessId],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        db.close();
        return res.json({ success: true, alreadyFollowing: true });
      }
      db.run(
        "INSERT INTO followers (user_id, business_id) VALUES (?, ?)",
        [userId, businessId],
        function (err) {
          db.close();
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  );
});
// Dejar de seguir negocio
app.post("/api/businesses/:id/unfollow", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { userId } = req.body;
  const businessId = req.params.id;
  db.run(
    "DELETE FROM followers WHERE user_id = ? AND business_id = ?",
    [userId, businessId],
    function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});
// Endpoint para obtener seguidores de un negocio
app.get("/api/businesses/:id/followers", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.id;
  db.all(
    "SELECT * FROM followers WHERE business_id = ?",
    [businessId],
    (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ count: rows.length, users: rows.map((r) => r.user_id) });
    }
  );
});

// Registro de usuario o negocio
app.post("/api/register", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { email, password, type, name, avatar, businessData } = req.body;
  if (!email || !password || !type) {
    db.close();
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      db.close();
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    db.run(
      "INSERT INTO users (email, password, type, name, avatar) VALUES (?, ?, ?, ?, ?)",
      [email, password, type, name || "", avatar || ""],
      function (err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: err.message });
        }
        const userId = this.lastID;
        // Si es negocio, crear el negocio y asociar el userId
        if (type === "business" && businessData) {
          db.run(
            `INSERT INTO businesses (name, description, category, island, location, coverImage, logo, rating, priceRange, featured, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              businessData.name,
              businessData.description || "",
              businessData.category,
              businessData.island,
              businessData.location,
              businessData.coverImage || "",
              businessData.logo || "",
              businessData.rating || null,
              businessData.priceRange || "",
              businessData.featured ? 1 : 0,
              userId,
            ],
            function (err) {
              db.close();
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true, userId, businessId: this.lastID });
            }
          );
        } else {
          db.close();
          res.json({ success: true, userId });
        }
      }
    );
  });
});
// Login de usuario o negocio
app.post("/api/login", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        db.close();
        return res
          .status(401)
          .json({ error: "Email o contraseña incorrectos" });
      }
      // Si es negocio, buscar el negocio asociado
      if (user.type === "business") {
        db.get(
          "SELECT * FROM businesses WHERE owner_id = ?",
          [user.id],
          (err, business) => {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, user, business });
          }
        );
      } else {
        db.close();
        res.json({ success: true, user });
      }
    }
  );
});

// Endpoint para obtener publicaciones recientes de todos los negocios
app.get("/api/posts", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  // Traer los 20 posts más recientes con datos del negocio y conteos
  db.all(
    `SELECT 
      posts.*,
      businesses.name as business_name,
      businesses.logo as business_logo,
      (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comments_count,
      (SELECT COUNT(*) FROM views WHERE post_id = posts.id) as views_count
     FROM posts 
     JOIN businesses ON posts.business_id = businesses.id 
     ORDER BY posts.created_at DESC LIMIT 20`,
    [],
    (err, posts) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json(posts);
    }
  );
});

// Guardar calificación para un negocio
app.post("/api/businesses/:businessId/rating", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { userId, rating } = req.body;
  const businessId = req.params.businessId;
  if (!userId || !rating) {
    db.close();
    return res.status(400).json({ error: "Faltan datos" });
  }
  // Permitir solo una calificación por usuario por negocio
  db.get(
    "SELECT id FROM ratings WHERE user_id = ? AND business_id = ?",
    [userId, businessId],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        // Actualizar calificación existente
        db.run(
          "UPDATE ratings SET rating = ? WHERE id = ?",
          [rating, row.id],
          function (err) {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, updated: true });
          }
        );
      } else {
        // Insertar nueva calificación
        db.run(
          "INSERT INTO ratings (user_id, business_id, rating) VALUES (?, ?, ?)",
          [userId, businessId, rating],
          function (err) {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, created: true });
          }
        );
      }
    }
  );
});

// Obtener promedio de calificaciones de un negocio
app.get("/api/businesses/:businessId/ratings/average", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.businessId;
  db.get(
    "SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE business_id = ?",
    [businessId],
    (err, row) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ average: row.average || 0, count: row.count });
    }
  );
});

// Obtener calificación de un usuario para un negocio
app.get("/api/businesses/:businessId/ratings/user/:userId", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const businessId = req.params.businessId;
  const userId = req.params.userId;
  db.get(
    "SELECT rating FROM ratings WHERE business_id = ? AND user_id = ?",
    [businessId, userId],
    (err, row) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({ rating: row ? row.rating : 0 });
    }
  );
});

// Endpoint para subir imágenes
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }
  // Devolver la URL accesible públicamente
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`API disponible en la red local: http://${LOCAL_IP}:${PORT}`);
});
