const router=require("express").Router();
var request = require('request');
var db = require('../db');


const accountSid = process.env.SMS_ACCOUNT_SID;
const authToken = process.env.SMS_ACCOUNT_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


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
        db.query('SELECT * FROM tbl_users WHERE country_code = ? AND mobileno=? AND status=1', [country_code,mobileno]
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

//Login with email

router.post("/login_with_email", async (req,res)=>{
    
    const { email }=req.body;

    
    var status;
    var message;

    if(!email) 
    {
        message="Please fil in all required fields.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        db.query('SELECT * FROM tbl_users WHERE email=? AND status=1', [email]
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
                message="Email not exist. Please Create your profile first.";
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
        
        client.messages.create({
            body: 'Dear User, Do not share it with anyone to save yourself from fraud. Your one time password '+OTP+' One Percent Dating.',
            to: "+"+country_code+""+mobileno, // Text your number
            from: '+13465531781', // From a valid Twilio number
          });


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
        db.query('SELECT u.*,IFNULL(GROUP_CONCAT(image),"") AS user_image FROM tbl_users u LEFT JOIN tbl_users_photos up ON up.user_id=u.id WHERE (country_code = ? AND mobileno=?) OR (email= ?) GROUP BY u.id ORDER BY id DESC LIMIT 1', [country_code,mobileno,email]
        , function (err, rows) {
              
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            
            if(rows.length > 0)
            { 
                
                var spilt=rows[0].user_image.split(",");

                message="success";
                status="User found";
                res.status(200).json({status:status,message:message,details:rows[0],
                    user_photos:spilt,});
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