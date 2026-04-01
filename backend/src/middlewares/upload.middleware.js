const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio uploads exista
const dist = path.join(__dirname, '../../uploads');
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

// Configuración del almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dist);
  },
  filename: function (req, file, cb) {
    // Nombre de archivo con timestamp para evitar colisiones
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

// Filtro de imágenes
const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Solo se permiten archivos de imagen!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

module.exports = upload;