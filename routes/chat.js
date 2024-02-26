const router = require("express").Router();
var db = require('../db');
const { io } = require("../index");
const multer = require('multer');
const multerS3 = require("multer-s3");
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path'); 
const config = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}
const s3 = new S3Client(config);

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: (req, file, cb) => {   
            
            const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
            cb(null, `chat/${fileName}${path.extname(file.originalname)}`);
            //console.log('cof-------',file.originalname);
        }    })
});

router.post('/create_chat', async (req, res) => {
    var status;
    var message;

    var split = req?.body?.chat_participants?.toString().split(",");

    var check_exist = `SELECT id FROM chat WHERE FIND_IN_SET(${split[0]}, chat_participants) AND FIND_IN_SET(${split[1]}, chat_participants)`;


    db.query(check_exist, function (err, rows) {
        if (err) {
            db.end();
            message = err;
            status = "error";
            res.status(200).json({ status: status, message: message });
        }
        if (rows.length > 0) {
            message = "success";
            status = "success";
            res.status(200).json({ status: status, message: message, id: rows[0].id });
        }
        else {
            var sql = "INSERT INTO chat (chat_participants) VALUES (?)";
            db.query(sql, [req?.body?.chat_participants?.toString()], function (err, rows) {
                if (err) {
                    db.end();
                    message = err;
                    status = "error";
                    res.status(200).json({ status: status, message: message });
                }
                else {
                    const newChatid = rows.insertId

                    db.query(`SELECT IFNULL(chats,'') AS chat FROM tbl_users WHERE id='${split[0]}'`, function (err ,user1ExistingChatsResponse) {

                        db.query(`SELECT IFNULL(chats,'') AS chat FROM tbl_users WHERE id='${split[1]}'`, function(err, user2ExistingChatsResponse) {

                            var first_update_qry = "";

                            if (user1ExistingChatsResponse[0].chat != '') {
                                first_update_qry = `UPDATE tbl_users SET chats=CONCAT(chats,',','${newChatid}') WHERE id='${split[0]}'`;
                            }
                            else {
                                first_update_qry = `UPDATE tbl_users SET chats='${newChatid}' WHERE id='${split[0]}'`;
                            }

                            console.log('first_update_qry',first_update_qry);
                            db.query(first_update_qry, function(err, user1UpdateResponse) {


                                var second_update_qry = "";

                                if (user2ExistingChatsResponse[0].chat != '') {
                                    second_update_qry = `UPDATE tbl_users SET chats=CONCAT(chats,',','${newChatid}') WHERE id='${split[1]}'`;
                                }
                                else {
                                    second_update_qry = `UPDATE tbl_users SET chats='${newChatid}' WHERE id='${split[1]}'`;
                                }

                                db.query(second_update_qry, function(err,user2UpdateResponse)  {


                                    message = "success";
                                    status = "success";
                                    res.status(200).json({ status: status, message: message, id: newChatid });
                                })
                            })
                        })
                    })
                }
            });
        }
    });

}),

    router.post('/send_msg_api', async (req, res) => {
        var status;
        var message;
        var sql = "INSERT INTO message (text, sender_id, chat_id,media) VALUES (?, ? , ?, ?)";
        db.query(sql, [req?.body?.text, req?.body?.sender_id, req?.body?.chat_id,req?.body?.media], function (err, rows) {
            if (err) {
                console.log('err--------',err);
                db.end();
                message = err;
                status = "error";
                res.status(200).json({ status: status, message: message });
            }
            else {
                const data = {
                    ...req?.body,
                    id: rows?.insertId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
                io.to(req.body?.chat_id).emit("chat_message", JSON.stringify(data));
                message = "success";
                status = "success";
                res.status(200).json({ status: status, message: message, data: data });
            }
        });
    }),

    router.post('/get_chat_msg', async (req, res) => {
        var status;
        var message;
        var sql = "SELECT * FROM message WHERE chat_id = ?";
        db.query(sql, [req?.body?.chat_id], function (err, rows) {
            if (err) {
                db.end();
                message = err;
                status = "error";
                res.status(200).json({ status: status, message: message });
            }
            else {
                message = "success";
                status = "success";
                res.status(200).json({ status: status, message: message, data: rows });
            }
        });
    }),
  

   
    router.post("/chat_sendfile",upload.single('chatfile'), async (req, res, next) => {

        var status;
        var message;
        
        message="File has been upload successfully";
        status="success";
        res.status(200).json({status:status,message:message,file_location:req.file.location});
    });
    module.exports = router 