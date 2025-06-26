const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "../neelpaneerapp-firebase-adminsdk-fbsvc-30b639a68e.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "neelpaneerapp.firebasestorage.app", // ✅ Use correct Firebase bucket (should end in .appspot.com)
});

const bucket = admin.storage().bucket();

// ✅ Export correctly
module.exports = { admin, bucket };
