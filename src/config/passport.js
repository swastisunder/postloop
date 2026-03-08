const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const path = require("path");

const { readJSON } = require("../utils/fileHandler");

const USER_PATH = path.join(__dirname, "../data/users.json");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    try {
      const users = readJSON(USER_PATH);

      const user = users.find((u) => u.userId === jwt_payload.userId && !u.isDeleted);

      if (!user) return done(null, false);
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }),
);
