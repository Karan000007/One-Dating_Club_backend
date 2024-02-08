const router=require("express").Router();
var request = require('request');
const multer = require('multer');
const multerS3 = require("multer-s3");
var db = require('../db');
var requestIp = require('request-ip');
const path = require('path'); 
const { S3Client  } = require('@aws-sdk/client-s3');
const { createTransport } = require('nodemailer');
const {Rekognition} = require('aws-sdk')

const rekognition = new Rekognition({region: process.env.AWS_REGION})

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

const nonS3Upload = multer({ storage: multer.memoryStorage() })

//console.log("location",upload)

//face recognization api
router.post("/face_detect", nonS3Upload.array('images'), async (req, res, next) => {
    
    var status;
    var message;
    const response_data = [];

    
    try {
    
    const uploadPromises = req.files.map(file => {
        
        return new Promise((resolve, reject) => {
            rekognition.detectFaces({
                Attributes:["ALL"],
                Image:{
                        Bytes: file.buffer
                    }
                },(err,data) => {
                    if(err)
                    {
                        console.log(err,err.stack);
                        reject(err)
                        // message=err;
                        // status="error";
                        // res.status(200).json({status:status,message:message,});
                    } else {
                        if(data.FaceDetails.length > 0){
                            response_data.push(file.originalname)
                            resolve(data.FaceDetails)
                        }else {
                            resolve(data.FaceDetails)
                        }
                    }
                }
            );
        })

       
    });

   await Promise.all(uploadPromises);

    res.status(200).json({message:message,data:response_data});
    
    
   } catch (error) {
    console.log('error===',error);
    res.status(500).json({message: error})
   }
});


router.post("/register", upload.array('images',10), async (req, res, next) => {

    //console.log('Console check ===>', req.files)
  
    let { register_type,firstname, lastname, gender, dob,height_feet,height_inch,linkedin,
        latest_degree,study,institute,company_name,industry,designation,interests,gender_prefrences,age_prefrences_min,age_prefrences_max,educational_prefrences,bio,mobileno,country_code,email,used_referral,latitude,longitude,city,country}=req.body;

    var ip = requestIp.getClientIp(req);
    var status;
    var message;
    
    if(!register_type || !firstname || !lastname || !gender || !dob || !height_feet || !height_inch || !latest_degree || !study || !institute || !company_name || !industry || !designation || !interests
        || !gender_prefrences || !age_prefrences_min || !age_prefrences_max || !latitude || !longitude || !city || !country || !educational_prefrences || !email || !used_referral) 
    {
        message="Please fil in all required fields";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        var checkmobileno;
        
        if(register_type=='email')
        {
            mobileno='';
            country_code='';
            checkmobileno='notavaible';
        }
        
        db.query('SELECT * FROM tbl_users WHERE email = ? OR (country_code=? AND mobileno=?)', [email,country_code,checkmobileno]
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
                                            

                                            db.query('SELECT * FROM smtp_setting'
                                                , function (err, rows) {

                                                    
                                                if (err) {
                                                    db.end();
                                                    console.log(err);
                                                    message=err;
                                                    status="error";
                                                    res.status(200).json({status:status,message:message,});
                                                }
                                                

                                                var transporter = createTransport({
                                                    host:rows[0].smtp_host,
                                                    port: rows[0].smtp_port,
                                                    auth: {
                                                        user: rows[0].smtp_user,
                                                        pass:rows[0].smtp_detail,
                                                    },
                                                });
                                                
                                                var mailOptions = {
                                                    from: rows[0].from_detail,
                                                    to: email,
                                                    subject: `Welcome to the One Percent Dating Club - A World of Exclusive Connections Awaits`,
                                                    html: `<!DOCTYPE  html5>
                                                    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
                                                       <head>
                                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                                                          <style type="text/css"> * {margin:0; padding:0; text-indent:0; }
                                                             p { color: #374050; font-family:"Lucida Sans Unicode", sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; margin:0pt; }
                                                             .s1 { color: black; font-family:"Lucida Sans Unicode", sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
                                                          </style>
                                                       </head>
                                                       <body style="padding:5px">
                                                       <center><p style="text-indent: 0pt;">
                   
                                                       <img width="150" style="" height="90" src="https://onepercentdating.club/logo.png"/></p></center>
                                                          <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                                          <p style="text-indent: 0pt;text-align: left;"><br/></p>
                                                          <b style="padding-left: 5pt;text-indent: 0pt;text-align: left;">Dear ${firstname},</b>
                                                          <p class="s1" style="padding-top: 11pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">A Heartfelt Thank You for Your Interest</p>
                                                          <p style="padding-top: 12pt;padding-left: 5pt;text-indent: 0pt;line-height: 18pt;text-align: left;">We are delighted to welcome you to the One Percent Dating Club - an enclave where</p>
                                                          <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">brilliance, creativity, and ambition converge. Your support in our mission is invaluable. Our ethos is rooted in exclusivity and selectivity, creating a melting pot of intelligent, innovative, and driven individuals from a kaleidoscope of backgrounds. This is achieved through a blend of sophisticated in-app matching and curated offline group activities.</p>
                                                          <b class="s1" style="padding-top: 12pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Your Current Membership Status: Exclusive Waitlist</b>
                                                          <p style="padding-top: 11pt;padding-left: 5pt;text-indent: 0pt;line-height: 18pt;text-align: left;">In our quest to maintain equilibrium, diversity, and a high-caliber community, your</p>
                                                          <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">application has been carefully placed on our exclusive waitlist. This is a testament to our commitment to balanced ratios, varied member backgrounds, and a controlled admissions rate - all while fostering vibrant engagement within our community.</p>
                                                          <b class="s1" style="padding-top: 11pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">The Art of Gaining Membership</b>
                                                          <p style="padding-top: 11pt;padding-left: 5pt;text-indent: 0pt;line-height: 18pt;text-align: left;">How to ascend the waitlist? We meticulously analyze your LinkedIn profile, &#39;About Me&#39;</p>
                                                          <p style="padding-left: 5pt;text-indent: 0pt;line-height: 18pt;text-align: left;">section, and photo submissions. Our algorithm is fine-tuned to consider your educational</p>
                                                          <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">background, professional achievements, industry involvement, fields of study, and personal interests. This, coupled with our human Review Team&#39;s discerning eye, ensures that every</p>
                                                          <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">profile is not only accomplished but also carries a certain a indescribable charm. Quality, taste, and a reflection of your best self are paramount in this journey.</p>
                                                          <b class="s1" style="padding-top: 11pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Our Philosophy and Your Role</b>
                                                          <p style="padding-top: 12pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">At the heart of the One Percent Dating Club is a philosophy that intertwines fun, wit, and a refreshingly humorous approach with the pulse of our members&#39; desires. We are here not just to enhance your dating experience but to enrich your social tapestry. Your voice is our guiding star - tell us what you envision, and let us sculpt an experience that transcends the ordinary.</p>
                                                          <p style="padding-top: 12pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Welcome to a realm where exclusivity is not just a word, but an experience.</p>
                                                          <br><br>
                                                          <b style="padding-top: 3pt;padding-left: 5pt;text-indent: 0pt;line-height: 18pt;text-align: left;">Warm regards,</b>
                                                          <p style="padding-left: 5pt;text-indent: 0pt;line-height: 18pt;text-align: left;">The One Percent Dating Club Team</p>
                                                       </body>
                                                    </html>`
                                                };

                                                transporter.sendMail(mailOptions, function(error, info){
                                                    if (error) {
                                                        message=error;
                                                        status="error";
                                                        res.status(200).json({status:status,message:message});
                                                    } else {
                                                        
                                                    }
                                                });
                                            });


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
                    message="Email already exist please try to login";
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }
                else if(rows[0].mobileno==mobileno && rows[0].country_code==country_code)
                {
                    message="Mobile number already exist please try to login.";
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
    
    const { email,country_code,mobileno }=req.body;

    
    var status;
    var message;

    var isvalid=1;
    var qry="SELECT id,city,country,status FROM tbl_users WHERE email = '"+email+"'";

    if(!email) 
    {
        if(country_code && mobileno)
        {
            qry="SELECT id,city,country,status FROM tbl_users WHERE (country_code = '"+country_code+"' AND mobileno='"+mobileno+"')";
            isvalid==1; 
        }
        else
        {
            
            isvalid=0
            message="Please fill in all required fields";
            status="error";
            res.status(200).json({status:status,message:message,});
        }
        
    }


    if(isvalid==1) 
    {
        db.query(qry
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


router.post("/check_email", async (req,res)=>{
    
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
        db.query('SELECT * FROM tbl_users WHERE email=?', [email]
            , function (err, rows) {

                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }
            
                
            if(rows.length > 0)
            {   
                message="Email already exist. Please try to another.";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
            else
            {
                message="Email not exist.";
                status="success";
                res.status(200).json({status:status,message:message,});
            }
        });
    }
});

router.post("/edit_profile", upload.array('images',10), async (req, res, next) => {

    
    let { user_id,firstname, lastname, gender, dob,height_feet,height_inch,linkedin,
        latest_degree,study,institute,company_name,industry,designation,interests,gender_prefrences,age_prefrences_min,age_prefrences_max,educational_prefrences,bio,mobileno,country_code,email,latitude,longitude,city,country}=req.body;

    
    var status;
    var message;
    
    if(!user_id || !firstname || !lastname || !gender || !dob || !height_feet || !height_inch || !latest_degree || !study || !institute || !company_name || !industry || !designation || !interests
        || !gender_prefrences || !age_prefrences_min || !age_prefrences_max || !latitude || !longitude || !city || !country || !educational_prefrences || !email) 
    {
        message="Please fil in all required fields";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        
        db.query('SELECT * FROM tbl_users WHERE id=?', [user_id]
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
                var sql=`UPDATE tbl_users SET firstname=?,lastname=?,gender=?, dob=?, height_feet=?, height_inch=?, linkedin=?, latest_degree=?, study=?, institute=?, company_name=?, industry=?,designation=?, interests=?,
                gender_prefrences=?, age_prefrences_min=?,age_prefrences_max=?,educational_prefrences=?, bio=?, country_code=?, mobileno=?, email=?,latitude=?,longitude=?,city=?,country=? WHERE id=?`;

                    db.query(sql, [firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                        gender_prefrences, age_prefrences_min,age_prefrences_max, educational_prefrences, bio, country_code, mobileno, email,latitude,longitude,city,country,user_id], function (err, data) {
                        
                            if (err) {
                            console.log(err)
                        } else {
                            message="Profile has been updated successfully";
                            status="success";
                            res.status(200).json({status:status,message:message,});
                        }
                    });
            }
            else
            {
                message="Something Went Wrong..!";
                status="error";
                res.status(200).json({status:status,message:message,});
                
            }

    });
        
        
    }
});


router.post("/delete_account", upload.array('images',10), async (req, res, next) => {

    
    let { user_id}=req.body;

    
    var status;
    var message;
    
    if(!user_id) 
    {
        message="Please add userid";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        
        db.query('DELETE FROM tbl_users WHERE id=?', [user_id]
            , function (err, rows) {

                
            if (err) {
                db.end();
                console.log(err);
                message=err;
                status="error";
                res.status(200).json({status:status,message:message,});
            }
            
               
            message="Account has been deleted successfully.";
            status="success";
            res.status(200).json({status:status,message:message,});

    });
        
        
    }
});
module.exports=router 