const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../firebase/firebaseAdmin');
const path = require('path');
const fs = require('fs');

const uploadImageToFirebase = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const fileName = `neelPaneer_images/${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    const fileStream = fs.createReadStream(file.path);

    fileStream.on("error", reject);
    stream.on("error", reject);

    stream.on("finish", async () => {
      try {
        await fileUpload.makePublic();
        resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
      } catch (error) {
        reject(error);
      }
    });

    fileStream.pipe(stream); // Read local file → Firebase
  });
};
module.exports = uploadImageToFirebase;
