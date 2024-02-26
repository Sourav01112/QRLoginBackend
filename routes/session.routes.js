const express = require("express");
const bcrypt = require("bcrypt");
const http = require("http");

const sessionRouter = express.Router();
require("dotenv").config();
const { SessionModel } = require("../models/session.model");
const jwt = require("jsonwebtoken");
const QRCode = require('qrcode');
const { UserModel } = require("../models/user.model");
const { io } = require("../server");


function handleWebSocketConnection(req, uniqueIdentifier, extraParam) {
    if (extraParam) {
        req.io.to(uniqueIdentifier).emit('custom-event', uniqueIdentifier, extraParam);
    } else {
        req.io.to(uniqueIdentifier).emit('custom-event', uniqueIdentifier);

    }
}

sessionRouter.post('/generateQR', async (req, res) => {
    console.log("req.body", req.body)
    const { uniqueIdentifier } = req.body

    const qrCodeImage = await QRCode.toDataURL(uniqueIdentifier);
    if (qrCodeImage !== null || qrCodeImage !== undefined) {


        const saveQRinDB = SessionModel({
            qrCode: qrCodeImage,
            uniqueIdentifier: uniqueIdentifier,
            expirationTime: new Date(Date.now() + 5 * 60 * 1000)
        })
        const result = await saveQRinDB.save()
        if (result !== null) {
            res.status(200).send({ data: result })
        }
    }
})


sessionRouter.post('/verify', async (req, res) => {
    const { uniqueIdentifier, userID } = req.body
    const uniqueExists = await SessionModel.findOne({ uniqueIdentifier: uniqueIdentifier })

    if (uniqueExists && uniqueExists.uniqueIdentifier) {
        const startMatch = await QRCode.toDataURL(uniqueIdentifier);
        console.log("startMatch",startMatch == uniqueExists.qrCode)

        // if (startMatch == uniqueExists.qrCode ) {
        if (startMatch == uniqueExists.qrCode && new Date() < uniqueExists.expirationTime) {

            uniqueExists.userID = userID
            const result = await uniqueExists.save()
            if (result !== null) {
                const query = await UserModel.findOneAndUpdate(
                    { _id: uniqueExists.userID },
                    { $set: { uniqueIdentifier: uniqueIdentifier } },
                    { new: true }
                );
                if (query !== null) {
                    handleWebSocketConnection(req, uniqueIdentifier);
                    res.send({ message: "Proces completed" })
                }
            }
        } else {
            handleWebSocketConnection(req, uniqueIdentifier, "QR-expired");
            return res.status(400).send({ message: "QR Code Expired. Please Refresh", status: 400 })

        }
    }else{
        handleWebSocketConnection(req, uniqueIdentifier, "QR doesn't Match");
        return res.status(400).send({ message: "QR doesn't Match. Please try again", status: 400 })
    }
})













module.exports = { sessionRouter };
