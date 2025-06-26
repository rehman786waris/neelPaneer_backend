const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    bannerImage: {
        type: String, // Stores the image URL (Cloudinary or local path)
        default: null,
    },
    bannerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'homeBanner', // References the 'User' collection
        required: true,
    },
},
    { timestamps: true } // Corrected from `timestamp: true`
);

module.exports = mongoose.model('Banner', postSchema);