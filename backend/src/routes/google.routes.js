const router = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { clientID, json_token, node_env } = require('../config');

const client = new OAuth2Client(clientID);

const isProduction = node_env === 'production';

// Ruta única para autenticación con Google (desde frontend)
router.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    // 1. Verificar el token de Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // 2. Buscar o crear usuario local
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length === 0) {
      // Crear nuevo usuario (sin contraseña, porque usa Google)
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, password, google_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, created_at`,
        [name, email, 'google_oauth', googleId]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
      // Si el usuario existe pero no tiene google_id, actualizar (opcional)
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
      }
    }

    // 3. Generar JWT con el ID local
    const userJwt = jwt.sign({ id: user.id }, json_token, { expiresIn: '7d' });

    // 4. Establecer cookie HttpOnly
    res.cookie('token', userJwt, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Devolver usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Autenticación con Google exitosa',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error en /auth/google:', error);
    res.status(401).json({ message: 'Token de Google inválido o expirado' });
  }
});

module.exports = router;