const router=require("express").Router();
var request = require('request');
const multer = require('multer');
var db = require('../db');
var requestIp = require('request-ip');



//insert problem feature

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/user_photos/');
    },
    filename: function (req, file, cb) {
        //console.log(file)
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0]);
    }
});

const upload = multer({ storage: storage })

router.post("/register", upload.array('images',10), async (req, res, next) => {
    const { firstname, lastname, gender, dob,height_feet,height_inch,linkedin,
        latest_degree,study,institute,company_name,industry,designation,interests,gender_prefrences,age_prefrences_min,age_prefrences_max,educational_prefrences,bio,mobileno,country_code,email,used_referral,latitude,longitude,city,country}=req.body;

    var ip = requestIp.getClientIp(req);
    var status;
    var message;
    
    if(!firstname || !lastname || !gender || !dob || !height_feet || !height_inch || !linkedin || !latest_degree || !study || !institute || !company_name || !industry || !designation || !interests
        || !gender_prefrences || !age_prefrences_min || !age_prefrences_max || !latitude || !longitude || !city || !country || !educational_prefrences || !bio || !mobileno || !email || !country_code || !used_referral ) 
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

                        db.query('SELECT * FROM tbl_users WHERE referralCode = ?', [used_referral]
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
                                db.query('SELECT * FROM tbl_users WHERE used_referral = ?', [used_referral]
                                , function (err, rows_used) {
                
                                        if (err) {
                                            db.end();
                                            console.log(err);
                                            message=err;
                                            status="error";
                                            res.status(200).json({status:status,message:message,});
                                        }
                    
                                    if(rows_used.length < 3)
                                    {
                                        
                                        var referral=Math.random().toString(36).slice(-6);

                                        var sql = `INSERT INTO tbl_users (firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                                        gender_prefrences, age_prefrences_min,age_prefrences_max,educational_prefrences, bio, country_code, mobileno, email,ip,referralCode,used_referral,latitude,longitude,city,country
                                            )
                                            VALUES
                                            (
                                                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                                            )`;

                                            
                                            db.query(sql, [firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                                            gender_prefrences, age_prefrences_min,age_prefrences_max, educational_prefrences, bio, country_code, mobileno, email,ip,referral,used_referral,latitude,longitude,city,country], function (err, data) {
                                            
                                                if (err) {
                                                console.log(err)
                                            } else {
                                                
                                                
                                                if(req.files.length > 0)
                                                {
                                                    var last_id=data.insertId;

                                                    for (var i=0; i < req.files.length; i++) {
                                                        var file = req.files[i].destination+""+req.files[i].filename;

                                                        var sql2="INSERT INTO tbl_users_photos(user_id,image) VALUES (?,?)";
                                                        db.query(sql2,[last_id,file], function (err, data)
                                                        {
                                                            if (err) {
                                                                console.log(err)
                                                            } 
                                                        });

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


    

        db.query('SELECT id,city,country FROM tbl_users WHERE email = ?', [email]
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
                var city=rows[0].city;
                var country=rows[0].country;
                
                var sql="SELECT (SELECT count(id) FROM tbl_users WHERE status = 0 AND city='"+rows[0].city+"') AS total_users_in_city,\n"+
                "(SELECT count(id) FROM tbl_users WHERE id > "+rows[0].id+" AND status =0 AND city='"+rows[0].city+"') AS you_are_in_city,\n"+
                "(SELECT count(id) FROM tbl_users WHERE status = 0 AND country='"+rows[0].country+"')  AS total_users_in_country,\n"+
                "(SELECT count(id) FROM tbl_users WHERE id > "+rows[0].id+" AND status =0 AND country='"+rows[0].country+"') you_are_in_country";
                console.log('sql-----',sql)
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
                        });
                    }

                });
                
            }
            else
            {
                message="You are not in waitnglist";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
    }
});

module.exports=router 