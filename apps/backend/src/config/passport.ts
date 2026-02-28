import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model';

export const configurePassport = () => {
  // Only configure Google OAuth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET && 
      process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
      process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret') {
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            let user = await User.findOne({ email: profile.emails?.[0].value });

            if (!user) {
              // Create new user with isNewUser flag
              user = await User.create({
                email: profile.emails?.[0].value,
                name: profile.displayName,
                googleId: profile.id,
                role: 'tenant', // Default role
                isNewUser: true, // Mark as new user
                subscriptionPlan: 'Gói Cơ Bản',
                subscriptionExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days free for tenant
              });
            } else if (!user.googleId) {
              // Link Google account to existing user
              user.googleId = profile.id;
              await user.save();
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
    
    console.log('✅ Google OAuth configured successfully');
  } else {
    console.log('⚠️  Google OAuth not configured - Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
    console.log('   See GOOGLE_OAUTH_SETUP.md for setup instructions');
  }
};
