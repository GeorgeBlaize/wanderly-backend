const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const prisma = require("./db");

// Google OAuth only activates once GOOGLE_CLIENT_ID/SECRET are set in .env.
// Facebook can be wired the same way with passport-facebook once app credentials exist.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"), null);

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName || "Traveler",
                email,
                provider: "GOOGLE",
                providerId: profile.id,
                avatarUrl: profile.photos?.[0]?.value || null,
              },
            });
          } else if (user.provider === "LOCAL") {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { provider: "GOOGLE", providerId: profile.id },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
