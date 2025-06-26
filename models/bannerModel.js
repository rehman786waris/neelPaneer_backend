const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        bannerImages: {
            type: [String], // Array of image URLs
            required: true,
            validate: [arrayLimit, '{PATH} must have at least one image.'],
        },
    },
    { timestamps: true }
);

// Custom validator to ensure array is not empty
function arrayLimit(val) {
    return val.length > 0;
}

module.exports = mongoose.model('Banner', bannerSchema);
