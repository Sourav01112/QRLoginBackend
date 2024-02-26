const mongoose = require("mongoose");

const { Schema } = mongoose;
const sessionSchema = new Schema(
    {
        userID: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            trim: true
        },
        uniqueIdentifier: { type: String, trim: true ,  required: true,},
        qrCode: { type: String, trim: true,  required: true, },
        expirationTime: {type:Number, required : true}
    },
    {
        versionKey: false,
    }
);

const SessionModel = mongoose.model("session", sessionSchema);

module.exports = { SessionModel };
