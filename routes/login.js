const router=require("express").Router();
var request = require('request');
var db = require('../db');


//Login with mobile

router.post("/login_with_mob", async (req,res)=>{
    
    const { country_code,mobileno }=req.body;

    
    var status;
    var message;

    if(!country_code || !mobileno) 
    {
        message="Please fil in all required fields.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        db.query('SELECT * FROM tbl_users WHERE country_code = ? AND mobileno=?', [country_code,mobileno]
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
                res.status(200).json({status:status,message:message});
                
            }
            else
            {
                message="Mobile number not exist. Please Create your profile first.";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
    }
});

//send otp
router.post("/send_otp", async (req,res)=>{
    
    const { country_code,mobileno}=req.body;

    
    var status;
    var message;

    if(!country_code || !mobileno) 
    {
        message="Please fil in all required fields.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  

        db.query("DELETE FROM tbl_otp WHERE mobile_no = ? AND is_verified=0",[(country_code+""+mobileno)]);

        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 6; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        

        var sql="INSERT INTO tbl_otp (mobile_no,otp) VALUES (?, ?)";
        db.query(sql,[(country_code+""+mobileno),OTP] , function (err, rows) {
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
                res.status(200).json({status:status,message:message,otp:OTP});
            }
        });

        
    }
});

//verify otp
router.post("/verify_otp", async (req,res)=>{
    
    const { country_code,mobileno,otp }=req.body;

    
    var status;
    var message;

    if(!country_code || !mobileno) 
    {
        message="Please fil in all required fields.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  

        
        db.query('SELECT * FROM tbl_otp WHERE mobile_no=? AND is_verified=0', [(country_code+""+mobileno)]
        , function (err, rows) {
              
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            
            if(rows.length > 0)
            { 
                if(rows[0].otp==otp)
                {
                    db.query('UPDATE tbl_otp SET is_verified=1 WHERE mobile_no=?', [(country_code+""+mobileno)] 
                    ,function (err,rows){
                        db.end();
                        message=err;
                        status="error";
                        res.status(200).json({status:status,message:message,});

                    });
                    
                    message="success";
                    status="Otp has been verified";
                    res.status(200).json({status:status,message:message});
                }
                else
                {
                    message="Invalid OTP.";
                    status="error";
                    res.status(200).json({status:status,message:message});
                }
            }
            else
            {
                message="Invalid OTP.";
                status="error";
                res.status(200).json({status:status,message:message});
            }
        });

    }
});


//get_login_Details
router.post("/get_login_details", async (req,res)=>{
    
    const { country_code,mobileno,email }=req.body;

    
    var status;
    var message;

    if(((country_code && mobileno) || (!email)) || ((email) && (!country_code && !mobileno)))
    {  
        db.query('SELECT * FROM tbl_users WHERE (country_code = ? AND mobileno=?) OR (email= ?)', [country_code,mobileno,email]
        , function (err, rows) {
              
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            
            if(rows.length > 0)
            { 
                message="success";
                status="User found";
                res.status(200).json({status:status,message:message,details:rows[0]});
            }
            else
            {
                message="User not exist";
                status="error";
                res.status(200).json({status:status,message:message});
            }
        });

    }
    else
    {
        message="Please fil in all required fields.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
});
module.exports=router 