const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { checkAuth, checkRole } = require("../middlewares/authentication");

const router = express.Router();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)"
      )
    );
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter,
});

/**
 * RUTAS PARA SUBIDA DE IMÁGENES
 */

// Subir una imagen
router.post(
  "/upload",
  checkAuth,
  checkRole(["admin", "owner"]),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No se proporcionó ningún archivo" });
      }

      // Información del archivo subido
      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/images/${req.file.filename}`,
        uploadedAt: new Date(),
      };

      res.status(200).json({
        message: "Imagen subida exitosamente",
        file: fileInfo,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// Subir múltiples imágenes
router.post(
  "/upload-multiple",
  checkAuth,
  checkRole(["admin", "owner"]),
  upload.array("images", 10), // máximo 10 imágenes
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No se proporcionaron archivos" });
      }

      // Información de los archivos subidos
      const filesInfo = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/images/${file.filename}`,
        uploadedAt: new Date(),
      }));

      res.status(200).json({
        message: `${req.files.length} imágenes subidas exitosamente`,
        files: filesInfo,
      });
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// Servir imágenes estáticas
router.get("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    // Verificar si el archivo existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    // Verificar que sea un archivo de imagen válido
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = path.extname(filename).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: "Tipo de archivo no válido" });
    }

    // Configurar headers para cache
    res.set({
      "Cache-Control": "public, max-age=31536000", // 1 año
      "Content-Type": `image/${fileExtension.substring(1)}`,
    });

    // Enviar el archivo
    res.sendFile(filepath);
  } catch (error) {
    console.error("Error al servir imagen:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar una imagen
router.delete(
  "/:filename",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(uploadsDir, filename);

      // Verificar si el archivo existe
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "Imagen no encontrada" });
      }

      // Eliminar el archivo
      fs.unlinkSync(filepath);

      res.status(200).json({
        message: "Imagen eliminada exitosamente",
        filename: filename,
      });
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// Listar todas las imágenes (para administración)
router.get("/", checkAuth, checkRole(["admin", "owner"]), async (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    });

    const imagesInfo = imageFiles.map((file) => {
      const filepath = path.join(uploadsDir, file);
      const stats = fs.statSync(filepath);

      return {
        filename: file,
        size: stats.size,
        uploadedAt: stats.birthtime,
        url: `/images/${file}`,
      };
    });

    // Ordenar por fecha de subida (más recientes primero)
    imagesInfo.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.status(200).json({
      message: "Lista de imágenes obtenida exitosamente",
      images: imagesInfo,
      total: imagesInfo.length,
    });
  } catch (error) {
    console.error("Error al listar imágenes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Middleware para manejar errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "El archivo es demasiado grande (máximo 5MB)" });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Demasiados archivos (máximo 10)" });
    }
  }

  if (error.message) {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = router;
