import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { userRoles, User, UserWithCompany, UserWithIndividual } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends UserWithCompany | UserWithIndividual {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "carbon-calculator-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmailWithProfile(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Credenciais inválidas" });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserWithProfile(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, name, sector, logoUrl } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Create user
      const user = await storage.createUser({
        email,
        password: await hashPassword(password),
        role: userRoles.COMPANY
      });

      // Create company profile
      const company = await storage.createCompany({
        userId: user.id,
        name,
        sector,
        logoUrl: logoUrl || null
      });

      // Get user with company profile
      const userWithCompany = await storage.getUserWithCompany(user.id);

      // Login the user
      req.login(userWithCompany, (err) => {
        if (err) return next(err);
        return res.status(201).json(userWithCompany);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/register-individual", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, phone, location, occupation } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Create user
      const user = await storage.createUser({
        email,
        password: await hashPassword(password),
        role: userRoles.INDIVIDUAL
      });

      // Create individual profile
      const individual = await storage.createIndividual({
        userId: user.id,
        firstName,
        lastName,
        phone: phone || null,
        location: location || null,
        occupation: occupation || null
      });

      // Get user with individual profile
      const userWithIndividual = await storage.getUserWithIndividual(user.id);

      // Login the user
      req.login(userWithIndividual, (err) => {
        if (err) return next(err);
        return res.status(201).json(userWithIndividual);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    res.json(req.user);
  });
}
