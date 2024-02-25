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


function handleWebSocketConnection(req, uniqueIdentifier) {
    // console.log("---====", uniqueIdentifier)
    // console.log(`User with uniqueIdentifier ${uniqueIdentifier} joined the room`);

    req.io.to(uniqueIdentifier).emit('custom-event', uniqueIdentifier);
}


sessionRouter.post('/generateQR', async (req, res) => {
    // console.log("req.body", req.body)
    const { uniqueIdentifier } = req.body

    const qrCodeImage = await QRCode.toDataURL(uniqueIdentifier);
    if (qrCodeImage !== null || qrCodeImage !== undefined) {

        const saveQRinDB = SessionModel({ qrCode: qrCodeImage, uniqueIdentifier: uniqueIdentifier })
        const result = await saveQRinDB.save()

        // console.log("result", result)
        if (result !== null) {
            res.status(200).send({ data: result })
        }


    }


})


sessionRouter.post('/verify', async (req, res) => {


    const { uniqueIdentifier, userID } = req.body

    console.log({ uniqueIdentifier })
    handleWebSocketConnection(req, uniqueIdentifier);

    const uniqueExists = await SessionModel.findOne({ uniqueIdentifier: uniqueIdentifier })



    if (!!uniqueExists.uniqueIdentifier) {
        const startMatch = await QRCode.toDataURL(uniqueIdentifier);

        if (startMatch == uniqueExists.qrCode) {
            uniqueExists.userID = userID
            const result = await uniqueExists.save()
            if (result !== null) {
                const query = await UserModel.findOneAndUpdate(
                    { _id: uniqueExists.userID },
                    { $set: { uniqueIdentifier: uniqueIdentifier } },
                    { new: true }
                );
                console.log("query", query)
                if (query !== null) {
                    handleWebSocketConnection(req, uniqueIdentifier);
                    res.send({ message: "Proces completed" })
                }
            }

        }

    }

})


// sessionRouter.post('/verify', async (req, res) => {
//     console.log("hello");

//     const { uniqueIdentifier, userID } = req.body;
//     let dataArray = [];
//     console.log({dataArray});

//     if (uniqueIdentifier) {
//         const uniqueExists = await SessionModel.findOne({ uniqueIdentifier });

//         if (uniqueExists && uniqueExists.qrCode) {
//             const startMatch = await QRCode.toDataURL(uniqueIdentifier);

//             if (startMatch == uniqueExists.qrCode) {
//                 uniqueExists.userID = userID;
//                 const result = await uniqueExists.save();

//                 if (result) {
//                     const query = await UserModel.findOne({ _id: uniqueExists.userID });

//                     console.log("query", query);

//                     if (query) {
//                         dataArray.push(query);

//                     }
//                 }
//             }
//         }
//     }

//     console.log("dataArray after query push", dataArray);

//     if (req.body.payload && req.body.payload.check) {
//         console.log("22222");
//         console.log("dataArray22", dataArray);

//         if (dataArray.length > 0) {
//             return res.status(200).send(dataArray);
//         } else {
//             return res.status(204).json({ message: "nothing yet" });
//         }
//     }
// });



sessionRouter.post('/verify-QR-viaApp', async (req, res) => {
    const { userID, autheticate, qrCode } = req.body
    const userExists = await SessionModel.findOne({ qrCode });
    if (userExists) {
        userExists.userID = userID
        const result = await userExists.save()
        if (result !== null) {
            const query = await UserModel.findOne({ _id: userExists.userID })
            if (query !== null) {
                req.io.emit('response', query);
                res.status(200).send(query)

            }
        }
    }

})











sessionRouter.post('/verify-QR-viaApp', async (req, res) => {
    const { userID, autheticate, qrCode } = req.body
    const userExists = await SessionModel.findOne({ qrCode });
    if (userExists) {
        userExists.userID = userID
        const result = await userExists.save()
        if (result !== null) {
            const query = await UserModel.findOne({ _id: userExists.userID })
            if (query !== null) {
                req.io.emit('response', query);
                res.status(200).send(query)

            }
        }
    }

})






module.exports = { sessionRouter };
