const router=require("express").Router();
var request = require('request');
const multer = require('multer');
var db = require('../db');
var requestIp = require('request-ip');



//insert problem feature

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/problem_feature/');
    },
    filename: function (req, file, cb) {
        //console.log(file)
        cb(null, new Date().toISOString().replace(/:/g, '-') + "_" + file.originalname);
    }
});

const upload = multer({ storage: storage })

router.post("/register", upload.single('image'), async (req, res, next) => {
    const { firstname, lastname, gender, dob,height_feet,height_inch,linkedin,
        latest_degree,study,institute,company_name,designation,interests,gender_prefrences,age_prefrences,educational_prefrences,bio,mobileno,country_code,email,used_referral}=req.body;

    var ip = requestIp.getClientIp(req);
    var status;
    var message;
    
    if(!firstname || !lastname || !gender || !dob || !height_feet || !height_inch || !linkedin || !latest_degree || !study || !institute || !company_name || !designation || !interests
        || !gender_prefrences || !age_prefrences || !educational_prefrences || !bio || !mobileno || !email || !country_code || !used_referral) 
    {
        message="Please fil in all required fields";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        db.query('SELECT * FROM tbl_users WHERE email = ? OR (country_code=? AND mobileno=?)', [email,country_code,mobileno]
                    , function (err, rows) {

                       
                        if (err) {
                            db.end();
                            console.log(err);
                            message=err;
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                    
                        
                    if(!rows.length)
                    {    
                        var referral=Math.random().toString(36).slice(-6);

                         var sql = `INSERT INTO tbl_users (firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, designation, interests,
                        gender_prefrences, age_prefrences, educational_prefrences, bio, country_code, mobileno, email,ip,referralCode,used_referral
                            )
                            VALUES
                            (
                                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                            )`;
                            db.query(sql, [firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, designation, interests,
                            gender_prefrences, age_prefrences, educational_prefrences, bio, country_code, mobileno, email,ip,referral,used_referral], function (err, data) {
                            if (err) {
                                console.log(err)
                            } else {
                                message="Data has been inserted successfully";
                                status="success";
                                res.status(200).json({status:status,message:message});
                            }
                        });
                    }
                    else
                    {

                        if(rows[0].email==email)
                        {
                            message="Your email address already exist please try to login.";
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                        else if(rows[0].mobileno==mobileno && rows[0].country_code==country_code)
                        {
                            message="Your mobile number already exist please try to login.";
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                       
                    }

            });
        
        
    }
});


//check refferal code

router.post("/check_referral", async (req,res)=>{
    
    const { used_referral }=req.body;

    
    var status;
    var message;

    if(!used_referral) 
    {
        message="Please Enter referral code.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        db.query('SELECT * FROM tbl_users WHERE referralCode = ?', [used_referral]
            , function (err, rows) {

                if (err) {
                    db.end();
                    console.log(err);
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }
            
                
            if(rows.length > 0)
            {   
                db.query('SELECT * FROM tbl_users WHERE used_referral = ?)', [used_referral]
                , function (err, rows) {

                    if (err) {
                        db.end();
                        console.log(err);
                        message=err;
                        status="error";
                        res.status(200).json({status:status,message:message,});
                    }
                });

                if(rows.length < 3)
                {
                    message="Valid referral code.";
                    status="success";
                    res.status(200).json({status:status,message:message});
                
                }
                else
                {
                    message="Referral code limits exceeded. Only 3 users can used this code";
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }
            }
            else
            {
                message="Invalid referral code.";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
    }
});


module.exports=router 