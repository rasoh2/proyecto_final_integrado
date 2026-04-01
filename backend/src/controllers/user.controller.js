const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.sendResponse('error', 'El correo ya está en uso', null, 400);
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario. El saldo 100,000 se asigna automáticamente por el modelo
    const nuevoUsuario = await User.create({
      nombre,
      correo,
      password: hashedPassword
    });

    res.sendResponse('success', 'Usuario registrado exitosamente con saldo inicial', {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      saldo: nuevoUsuario.saldo
    }, 201);
  } catch (error) {
    res.sendResponse('error', 'Error al registrar el usuario', error.message, 500);
  }
};

// Login de usuario y generación de JWT
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await User.findOne({ where: { correo } });
    if (!usuario) {
      return res.sendResponse('error', 'Credenciales inválidas', null, 401);
    }

    // Validar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.sendResponse('error', 'Credenciales inválidas', null, 401);
    }

    // Crear Token JWT
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Expira en 1 día
    );

    res.sendResponse('success', 'Inicio de sesión exitoso', {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        saldo: usuario.saldo
      }
    });
  } catch (error) {
    res.sendResponse('error', 'Error al iniciar sesión', error.message, 500);
  }
};

// Obtener perfil (Ruta protegida)
exports.getProfile = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // No retornar el hash de la contraseña jamás
    });

    if (!usuario) {
      return res.sendResponse('error', 'Usuario no encontrado', null, 404);
    }

    res.sendResponse('success', 'Perfil recuperado con éxito', usuario);
  } catch (error) {
    res.sendResponse('error', 'Error al buscar el perfil', error.message, 500);
  }
};

// Subida de imagen de perfil de Multer (Ruta protegida)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.sendResponse('error', 'Debe subir un archivo de imagen', null, 400);
    }

    // Generar ruta relativa accesible por la aplicación Express
    const imagePath = `uploads/${req.file.filename}`;
    
    // Actualizar el avatar del usuario actual
    await User.update({ avatar: imagePath }, { where: { id: req.user.id } });

    res.sendResponse('success', 'Avatar de usuario actualizado correctamente', { avatar: imagePath });
  } catch (error) {
    res.sendResponse('error', 'Error al cargar imagen', error.message, 500);
  }
};