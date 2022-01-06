import crypto from 'crypto';
import debug from 'debug';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  throw dotenvResult.error;
}

const log: debug.IDebugger = debug('app:auth-controller');

const jwtSecret: string = dotenvResult?.parsed?.JWT_SECRET ?? '';
console.log({ jwtSecret });
const tokenExpirationInSeconds = 36000;

class AuthController {
  async createJWT(req: express.Request, res: express.Response) {
    try {
      const refreshId = (req.body.userId as string) + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto
        .createHmac('sha512', salt)
        .update(refreshId)
        .digest('base64');
      req.body.refreshKey = salt.export();
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });
      return res.status(201).send({ accessToken: token, refreshToken: hash });
    } catch (err) {
      log('createJWT error: %O', err);
      return res.status(500).send();
    }
  }
}

export default new AuthController();
