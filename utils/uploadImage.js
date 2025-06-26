const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../firebase/firebaseAdmin');
const path = require('path');
const fs = require('fs');


///Upload profile image
exports.uploadImageToFirebase = async (file) => {
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


///Uploads multiply images
exports.uploadMultipleImagesToFirebase = async (files) => {
  const uploadPromises = files.map((file) => {
    const fileName = `banners/${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (err) => reject(err));
      stream.on("finish", async () => {
        await fileUpload.makePublic(); // Optional: make public
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });
      stream.end(file.buffer);
    });
  });

  return Promise.all(uploadPromises);
};


///Upload product image
exports.uploadSingleImageToFirebase = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `products/${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", reject);
    stream.on("finish", async () => {
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};

