const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        city: { type: String, required: true },
        qrCode: { type: String }
    },
    {
        versionKey: false,
    }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };
