const router=require("express").Router();
var request = require('request');
var db = require('../db');

router.post("/list", async (req,res)=>{
    
    var status;
    var message;

        db.query('SELECT * FROM tbl_industry'
            , function (err, rows) {

                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }
            
                
            if(rows.length > 0)
            {   
                message="success";
                status="success";
                res.status(200).json({status:status,message:message,list:rows});
                
            }
            else
            {
                message="No any data found";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
    
});

module.exports=router 