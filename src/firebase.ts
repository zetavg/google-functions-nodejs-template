import admin from 'firebase-admin';
import { Reference, DataSnapshot } from '@firebase/database-types';
import {
  FIREBASE_DATABASE_URL,
  FIREBASE_SERVICE_ACCOUNT_CREDENTIAL,
} from './config';

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT_CREDENTIAL),
  databaseURL: FIREBASE_DATABASE_URL,
});

export const db = admin.database();

/**
 * Helper function to get Firebase data once.
 */
export function getValue(ref: Reference): Promise<DataSnapshot> {
  return new Promise<DataSnapshot>((resolve, reject) => {
    ref.once('value', (snapshot) => resolve(snapshot)).catch((e) => reject(e));
  });
}

export { admin };
export default db;
