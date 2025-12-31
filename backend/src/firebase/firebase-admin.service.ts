import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: admin.app.App;

  async onModuleInit() {
    try {
      // Check if Firebase Admin SDK is already initialized
      if (admin.apps.length === 0) {
        // Initialize Firebase Admin with service account
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!serviceAccount) {
          this.logger.warn(
            'FIREBASE_SERVICE_ACCOUNT_KEY not found in environment variables. Firebase Auth will not work.',
          );
          return;
        }

        // Parse the service account JSON
        // Handle escaped newlines in the JSON string
        let serviceAccountJson;
        try {
          // First, try to parse as-is (for properly formatted JSON files)
          serviceAccountJson = JSON.parse(serviceAccount);
        } catch (parseError) {
          // If that fails, try replacing escaped newlines
          const cleanedServiceAccount = serviceAccount
            .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
            .replace(/^["']|["']$/g, '');  // Remove surrounding quotes if present

          serviceAccountJson = JSON.parse(cleanedServiceAccount);
        }

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        this.logger.log('Firebase Admin initialized successfully');
      } else {
        this.firebaseApp = admin.app();
        this.logger.log('Using existing Firebase Admin instance');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }

  getAuth(): admin.auth.Auth {
    return admin.auth(this.firebaseApp);
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.getAuth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      this.logger.error('Error verifying ID token:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
    try {
      const user = await this.getAuth().getUserByEmail(email);
      return user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      this.logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord | null> {
    try {
      const user = await this.getAuth().getUser(uid);
      return user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      this.logger.error('Error getting user by UID:', error);
      throw error;
    }
  }
}
