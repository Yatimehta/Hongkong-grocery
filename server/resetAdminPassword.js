const { db } = require('./firebaseClient');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const email = 'admin@freshmarketgrocery.com';
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    const snapshot = await db.collection('adminUsers').where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      // Create new one if it doesn't exist
      await db.collection('adminUsers').add({
        name: 'Shop Owner (Super Admin)',
        email,
        passwordHash,
        role: 'super_admin',
        permissions: JSON.stringify(['all']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Created admin user ${email} with password: ${password}`);
    } else {
      const docId = snapshot.docs[0].id;
      await db.collection('adminUsers').doc(docId).update({
        passwordHash,
        updatedAt: new Date().toISOString()
      });
      console.log(`Successfully updated admin user ${email} password to: ${password}`);
    }
  } catch (err) {
    console.error('Failed to reset password:', err);
  }
}

resetPassword();
