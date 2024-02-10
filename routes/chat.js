const router=require("express").Router();
var db = require('../db');
const  {io}  = require("../index");


router.post('/create_chat', async (req,res)=>{
    var status;
    var message;

    var split=req?.body?.chat_participants?.toString().split(",");
    
    var check_exist=`SELECT id FROM chat WHERE FIND_IN_SET(${split[0]}, chat_participants) AND FIND_IN_SET(${split[1]}, chat_participants)`;

    
    db.query(check_exist, function (err, rows){
        if (err) {
            db.end();
            message=err;
            status="error";
            res.status(200).json({status:status,message:message});
        }
        if(rows.length > 0)
        {
            message="success";
            status="success";
            res.status(200).json({status:status,message:message,id:rows[0].id});
        }
        else
        {
            var sql="INSERT INTO chat (chat_participants) VALUES (?)";
            db.query(sql,[req?.body?.chat_participants?.toString()] , function (err, rows) {
                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message});
                }
                else
                {
                    message="success";
                    status="success";
                    res.status(200).json({status:status,message:message,id:rows.insertId});
                }
            });
        }
    });
    
}), 

router.post('/send_msg_api', async (req,res)=>{
    var status;
    var message;
    var sql="INSERT INTO message (text, sender_id, chat_id) VALUES (?, ? , ?)";
    db.query(sql,[req?.body?.text, req?.body?.sender_id, req?.body?.chat_id] , function (err, rows) {
        if (err) {
            db.end();
            message=err;
            status="error";
            res.status(200).json({status:status,message:message});
        }
        else
        {
            const data = {
                ...req?.body,
                id: rows?.insertId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            io.to(req.body?.chat_id).emit("chat_message", data);
            message="success";
            status="success";
            res.status(200).json({status:status,message:message, data: data});
        }
    });
}), 

router.post('/get_chat_msg', async (req,res)=>{
    var status;
    var message;
    var sql="SELECT * FROM message WHERE chat_id = ?";
    db.query(sql,[req?.body?.chat_id] , function (err, rows) {
        if (err) {
            db.end();
            message=err;
            status="error";
            res.status(200).json({status:status,message:message});
        }
        else
        {
            message="success";
            status="success";
            res.status(200).json({status:status,message:message, data : rows});
        }
    });
}), 



module.exports=router 