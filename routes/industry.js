const router=require("express").Router();
var request = require('request');
var db = require('../db');

router.post("/list", async (req,res)=>{
    
    var status;
    var message;

        db.query('SELECT sub_industry FROM tbl_industry'
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



router.post("/field_of_study_list", async (req,res)=>{
    
    var status;
    var message;

        db.query('SELECT study FROM tbl_field_of_study'
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

router.post("/degreeList", async (req,res)=>{
    
    var status;
    var message;

        db.query('SELECT degree FROM tbl_degreelist'
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