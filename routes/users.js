const router=require("express").Router();
var request = require('request');
const multer = require('multer');
const multerS3 = require("multer-s3");
var db = require('../db');
var requestIp = require('request-ip');
const path = require('path'); 
const { S3Client } = require('@aws-sdk/client-s3');

const config = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}

//console.log('aws config ===>', config)

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
            cb(null, `user_photos/${fileName}${path.extname(file.originalname)}`);
           // console.log('cof-------',file.originalname);
        }    })
});

//console.log("location",upload)

router.post("/register", upload.array('images',10), async (req, res, next) => {

    //console.log('Console check ===>', req.files)
  
    const { firstname, lastname, gender, dob,height_feet,height_inch,linkedin,
        latest_degree,study,institute,company_name,industry,designation,interests,gender_prefrences,age_prefrences_min,age_prefrences_max,educational_prefrences,bio,mobileno,country_code,email,used_referral,latitude,longitude,city,country,main_cat}=req.body;

    var ip = requestIp.getClientIp(req);
    var status;
    var message;
    
    if(!firstname || !lastname || !gender || !dob || !height_feet || !height_inch || !latest_degree || !study || !institute || !company_name || !industry || !designation || !interests
        || !gender_prefrences || !age_prefrences_min || !age_prefrences_max || !latitude || !longitude || !city || !country || !educational_prefrences || !bio || !mobileno || !email || !country_code || !used_referral || !main_cat) 
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
                var query= db.query('SELECT * FROM tbl_users WHERE referralCode = ?', [used_referral]
                    , function (err, ref_rows) {
                        
                        if (err) {
                            db.end();
                            console.log(err);
                            message=err;
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                    
                        
                    if(ref_rows.length > 0)
                    {   
                         var is_valid=1;
                            db.query('SELECT * FROM tbl_users WHERE used_referral = ?', [used_referral]
                            ,function (err, rows_used) {
            
                                    if (err) {
                                        db.end();
                                        console.log(err);
                                        message=err;
                                        status="error";
                                        res.status(200).json({status:status,message:message,});
                                    }
                                    

                                    if(ref_rows[0].status != 1)
                                    {
                                        if(rows_used.length < 3)
                                        {
                                            is_valid=1;
                                        }
                                        else
                                        {
                                            is_valid=0;
                                        }
                                    }
                                    
                                if(is_valid==1)
                                {
                                    
                                    var referral=Math.random().toString(36).slice(-6);

                                    var sql = `INSERT INTO tbl_users (firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                                    gender_prefrences, age_prefrences_min,age_prefrences_max,educational_prefrences, bio, country_code, mobileno, email,ip,referralCode,used_referral,latitude,longitude,city,country,main_category
                                        )
                                        VALUES
                                        (
                                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?
                                        )`;

                                        
                                        db.query(sql, [firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                                        gender_prefrences, age_prefrences_min,age_prefrences_max, educational_prefrences, bio, country_code, mobileno, email,ip,referral,used_referral,latitude,longitude,city,country,main_cat], function (err, data) {
                                        
                                            if (err) {
                                            console.log(err)
                                        } else {
                                            
                                            
                                            if(req.files.length > 0)
                                            {
                                                var last_id=data.insertId;
                                                try {
                                                    const uploadPromises = req.files.map(async file => {
                                                    
                                                        var sql2="INSERT INTO tbl_users_photos(user_id,image) VALUES (?,?)";
                                                        db.query(sql2,[last_id,file.location], function (err, data)
                                                        {
                                                            if (err) {
                                                                console.log(err)
                                                            } 
                                                        });
                                                    });
                                                
                                                    Promise.all(uploadPromises);
                                                    
                                                    //res.send('Files uploaded successfully');
                                                    } catch (error) {
                                                    
                                                    message="Error uploading file to S3";
                                                    status="error";
                                                    res.status(200).json({status:status,message:error});
                                                    }
                                                
                                            }
                                        
                                            message="Data has been inserted successfully";
                                            status="success";
                                            res.status(200).json({status:status,message:message});
                                        }
                                    });
                                    
                                }
                                else
                                {
                                    message="Referral code limits exceeded. Only 3 users can used this code";
                                    status="error";
                                    res.status(200).json({status:status,message:message,});
                                }
                            });
                        
                        
                    }
                    else
                    {
                        message="Invalid referral code.";
                        status="error";
                        res.status(200).json({status:status,message:message,});
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

                db.query('SELECT * FROM tbl_users WHERE used_referral = ?', [used_referral]
                , function (err, rows_used) {

                    if (err) {
                        db.end();
                        console.log(err);
                        message=err;
                        status="error";
                        res.status(200).json({status:status,message:message,});
                    }

                    if(rows[0].id != 1)
                    {
                        if(rows_used.length < 3)
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
                        message="Valid referral code.";
                        status="success";
                        res.status(200).json({status:status,message:message});
                    }
                });

                
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


//check refferal code

router.post("/waitlist", async (req,res)=>{
    
    const { email }=req.body;

    
    var status;
    var message;

    if(!email) 
    {
        message="Please Enter Email Address.";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  

        db.query('SELECT id,city,country,status FROM tbl_users WHERE email = ?', [email]
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

              
                if(rows[0].status == 0)
                {
                    var city=rows[0].city;
                    var country=rows[0].country;
                    
                    var sql="SELECT (SELECT count(id) FROM tbl_users WHERE status = 0 AND city='"+rows[0].city+"') AS total_users_in_city,\n"+
                    "(SELECT count(id) FROM tbl_users WHERE id > "+rows[0].id+" AND status =0 AND city='"+rows[0].city+"') AS you_are_in_city,\n"+
                    "(SELECT count(id) FROM tbl_users WHERE status = 0 AND country='"+rows[0].country+"')  AS total_users_in_country,\n"+
                    "(SELECT count(id) FROM tbl_users WHERE id > "+rows[0].id+" AND status =0 AND country='"+rows[0].country+"') you_are_in_country";
                    
                    db.query(sql,function(err,rows){
                        if (err) {
                            db.end();
                            console.log(err);
                            message=err;
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                        else
                        {
                            
                            message="Data Found";
                            status="success";
                            res.status(200).json({status:status,message:message,
                                total_users_in_city:rows[0].total_users_in_city,
                                you_are_in_city:(rows[0].total_users_in_city-rows[0].you_are_in_city),
                                total_users_in_country:(rows[0].total_users_in_country),
                                you_are_in_country:(rows[0].total_users_in_country-rows[0].you_are_in_country),
                                you_are_in_country:(rows[0].total_users_in_country-rows[0].you_are_in_country),
                                city:city,
                                country:country,
                                is_approved:0
                            });
                        }

                    });
                }
                else if(rows[0].status == 1)
                {
                    message="Data Found";
                    status="success";
                    res.status(200).json({status:status,message:message,
                        is_approved:1 
                    });
                }
                else if(rows[0].status == 2)
                {
                    message="Data Found";
                    status="success";
                    res.status(200).json({status:status,message:message,
                        is_approved:2
                    });
                }
            }
            else
            {
                message="You are not in waitnglist.";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
    }
});

module.exports=router 