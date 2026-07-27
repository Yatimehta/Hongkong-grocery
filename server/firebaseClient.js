const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db };
