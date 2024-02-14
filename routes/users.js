const router=require("express").Router();
var request = require('request');
const multer = require('multer');
const multerS3 = require("multer-s3");
var db = require('../db');
var requestIp = require('request-ip');
const path = require('path'); 
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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
                                    gender_prefrences, age_prefrences_min,age_prefrences_max,educational_prefrences, bio, country_code, mobileno, email,ip,referralCode,used_referral,latitude,longitude,city,country,entry_date
                                        )
                                        VALUES
                                        (
                                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?
                                        )`;

                                        
                                        db.query(sql, [firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                                        gender_prefrences, age_prefrences_min,age_prefrences_max, educational_prefrences, bio, country_code, mobileno, email,ip,referral,used_referral,latitude,longitude,city,country,new Date()], function (err, data) {
                                        
                                            if (err) {
                                            console.log(err)
                                        } else {
                                            
                                            
                                            if(req.files.length > 0)
                                            {
                                                var last_id=data.insertId;
                                                try {
                                                    const uploadPromises = req.files.map(async file => {
                                                    
                                                        var sql2="INSERT INTO tbl_users_photos(user_id,image,entry_date) VALUES (?,?,?)";
                                                        db.query(sql2,[last_id,file.location,new Date()], function (err, data)
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

router.post("/edit_profile", async (req, res, next) => {

    
    let { user_id,height_feet,height_inch,linkedin,
        latest_degree,study,institute,company_name,industry,designation,interests,gender_prefrences,age_prefrences_min,
        age_prefrences_max,educational_prefrences,bio,distance,latitude,longitude,city,country}=req.body;

    
    var status;
    var message;
    
    if(!user_id) 
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
                var sql='';
                if(height_feet && height_inch)
                {
                    sql=`UPDATE tbl_users SET height_feet='${height_feet}',height_inch='${height_inch}'`;
                }
                else if(linkedin)
                {
                    sql=`UPDATE tbl_users SET linkedin='${linkedin}'`;
                }
                else if(latest_degree)
                {
                    sql=`UPDATE tbl_users SET latest_degree='${latest_degree}'`;
                }
                else if(study)
                {
                    sql=`UPDATE tbl_users SET study='${study}'`;
                }
                else if(institute)
                {
                    sql=`UPDATE tbl_users SET institute='${institute}'`;
                }
                else if(company_name)
                {
                    sql=`UPDATE tbl_users SET company_name='${company_name}'`;
                }
                else if(industry)
                {
                    sql=`UPDATE tbl_users SET industry='${industry}'`;
                }
                else if(designation)
                {
                    sql=`UPDATE tbl_users SET designation='${designation}'`;
                }
                else if(interests)
                {
                    sql=`UPDATE tbl_users SET interests='${interests}'`;
                }
                else if(gender_prefrences)
                {
                    sql=`UPDATE tbl_users SET gender_prefrences='${gender_prefrences}'`;
                }
                else if(age_prefrences_min && age_prefrences_max)
                {
                    sql=`UPDATE tbl_users SET age_prefrences_min='${age_prefrences_min}',age_prefrences_max='${age_prefrences_max}'`;
                }
                else if(educational_prefrences)
                {
                    sql=`UPDATE tbl_users SET educational_prefrences='${educational_prefrences}'`;
                }
                else if(bio)
                {
                    sql=`UPDATE tbl_users SET bio='${bio}'`;
                }
                else if(distance)
                {
                    sql=`UPDATE tbl_users SET distance_prefrences='${distance}'`;
                }
                else if(latitude && longitude && city && country)
                {
                    sql=`UPDATE tbl_users SET latitude='${latitude}',longitude='${longitude}',city='${city}',country='${country}'`;
                }

                if(sql)
                {
                    sql+=` WHERE id=${user_id}`;
                    db.query(sql, function (err, data) {
                        
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


router.post("/edit_photo",upload.single('image'), async (req, res, next) => {

    
    let { photo_id,user_id}=req.body;

    
    var status;
    var message;
    
    if(!user_id) 
    {
        message="Please fil in all required fields";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        if(photo_id)
        {   
            db.query(`SELECT * FROM tbl_users_photos WHERE id=${photo_id}`,async function(err,row){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    if(row.length > 0)
                    {
                        var image=row[0].image;
                        var split=image.split("https://onepercentdating.s3.ap-south-1.amazonaws.com/");
                        const params = {
                            Bucket: process.env.AWS_S3_BUCKET_NAME,
                            Key: split[1]
                        };
                        
                        const command = new DeleteObjectCommand(params);
                        await s3.send(command);
                        db.query(`DELETE FROM tbl_users_photos WHERE id=${photo_id}`);
                    }
                }

            });
            
        }
       
        var sql2="INSERT INTO tbl_users_photos(user_id,image,entry_date) VALUES (?,?,?)";
        db.query(sql2,[user_id,req.file.location,new Date()], function (err, data)
        {
            if (err) {
                message=err;
                status="error";
                res.status(200).json({status:status,message:message,});
            } 
            else
            {
                message="Image upload successfully";
                status="success";
                res.status(200).json({status:status,message:message});
            }
        });
        
        
        
    }
});

router.post("/delete_photo",async (req, res, next) => {

    
    let { photo_id}=req.body;

    
    var status;
    var message;
    
    if(!photo_id) 
    {
        message="Please fil in all required fields";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
           
        db.query(`SELECT * FROM tbl_users_photos WHERE id=${photo_id}`,async function(err,row){
            if(err)
            {
                message=err;
                status="error";
                res.status(200).json({status:status,message:message,});
            }
            else
            {
                if(row.length > 0)
                {
                    var image=row[0].image;
                    var split=image.split("https://onepercentdating.s3.ap-south-1.amazonaws.com/");
                    const params = {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: split[1]
                    };
                    
                    const command = new DeleteObjectCommand(params);
                    await s3.send(command);
                    db.query(`DELETE FROM tbl_users_photos WHERE id=${photo_id}`);
                }
            }

        });
        
        message="Image has been deleted successfully";
        status="success";
        res.status(200).json({status:status,message:message,});
         
        
        
        
    }
});

router.post("/delete_account", async (req, res, next) => {

    
    let { user_id,reason}=req.body;

    
    var status;
    var message;
    
    if(!user_id || !reason) 
    {
        message="Please add userid and reason";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        
        db.query(`SELECT * FROM tbl_users WHERE id=?`, [user_id]
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
                var ip = requestIp.getClientIp(req);
                var sql = `INSERT INTO tbl_deleted_users_account (user_id,firstname, lastname, gender, dob, height_feet, height_inch, linkedin, latest_degree, study, institute, company_name, industry,designation, interests,
                    gender_prefrences, age_prefrences_min,age_prefrences_max,educational_prefrences, bio, country_code, mobileno, email,ip,referralCode,used_referral,latitude,longitude,city,country,entry_date,deleted_reason,reject_reason,rejected_date,distance_prefrences
                        )
                        VALUES
                        (
                            ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?
                        )`;

                        
                        db.query(sql, [rows[0].id,rows[0].firstname, rows[0].lastname, rows[0].gender, rows[0].dob, rows[0].height_feet, rows[0].height_inch, rows[0].linkedin, rows[0].latest_degree, rows[0].study, rows[0].institute, rows[0].company_name, rows[0].industry,rows[0].designation, rows[0].interests,
                            rows[0].gender_prefrences, rows[0].age_prefrences_min,rows[0].age_prefrences_max, rows[0].educational_prefrences, rows[0].bio, rows[0].country_code, rows[0].mobileno, rows[0].email,ip,rows[0].referralCode,rows[0].used_referral,rows[0].latitude,rows[0].longitude,rows[0].city,rows[0].country,new Date(),reason,
                            rows[0].reject_reason, rows[0].rejected_date, rows[0].distance_prefrences,
                        ], function (err, data) {
                        
                            if (err) {
                            console.log(err)
                        } else {
                                db.query(`DELETE FROM tbl_users WHERE id=${rows[0].id}`);
                                message="Account has been deleted successfully.";
                                status="success";
                                res.status(200).json({status:status,message:message,});
                        }

                    });
            }
            else
            {
                message="Account not available.";
                status="success";
                res.status(200).json({status:status,message:message,});
            }
            

        });
        
    }
});


router.post("/like_you", async (req, res, next) => {

    
    let { user_id}=req.body;

    
    var status;
    var message;
    var first_array=[];
    if(!user_id) 
    {
        message="Please add userid";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
        
        db.query(`SELECT u.*,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age FROM tbl_users u
        INNER JOIN tbl_profile_like p ON p.profile_id=u.id
        WHERE p.user_id=${user_id} ORDER BY p.id DESC`
        , async (err, rows1) => {

            if (err) {
                db.end();
                console.log(err);
                message=err;
                status="error";
                res.status(200).json({status:status,message:message,});
            }

            if(rows1.length > 0)
            {
                
                const secondArrResponse = await new Promise((resolve, reject) => {

                    if(rows1.length > 0)
                    {
                        for(let index in rows1)
                        {
                            db.query(`SELECT image FROM tbl_users_photos WHERE user_id=${rows1[index]['id']}`, (err, photos) => {
                                if (err) {
                                    db.end();
                                    message = err;
                                    status = "error";
                                    res.status(200).json({ status: status, message: message, });
                                }
                                

                                let second_image_array=[];
                                for(let p in photos)
                                {
                                    let image={
                                        image:photos[p]['image']
                                    }
                                    second_image_array.push(image);
                                }
                                let userInfo = {
                                    id: rows1[index]['id'],
                                    firstname: rows1[index]['firstname'],
                                    lastname: rows1[index]['lastname'],
                                    country_code: rows1[index]['country_code'],
                                    mobileno: rows1[index]['mobileno'],
                                    email: rows1[index]['email'],
                                    gender: rows1[index]['gender'],
                                    dob: rows1[index]['dob'],
                                    height_feet: rows1[index]['height_feet'],
                                    height_inch: rows1[index]['height_inch'],
                                    linkedin: rows1[index]['linkedin'],
                                    latest_degree: rows1[index]['latest_degree'],
                                    study: rows1[index]['study'],
                                    institute: rows1[index]['institute'],
                                    company_name: rows1[index]['company_name'],
                                    industry: rows1[index]['industry'],
                                    designation: rows1[index]['designation'],
                                    interests: rows1[index]['interests'],
                                    bio: rows1[index]['bio'],
                                    city: rows1[index]['city'],
                                    country: rows1[index]['country'],
                                    distance: rows1[index]['distance'],
                                    age: rows1[index]['Age'],
                                    referralCode: rows1[index]['referralCode'],
                                    photo: second_image_array,
                                
                                }
                                
                                first_array.push(userInfo);
                                if(+index === rows1.length - 1) {
                                    resolve(first_array)
                                }
                             
                            });
                        }
                    }
                    else
                    {
                        resolve([])
                    }
                   });
                
                
                message="Data found";
                status="success";
                res.status(200).json({status:status,message:message,list:first_array});

            }
            else
            {
                message="No any person like to your profile.";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
        
        
    }
});



router.post("/pauseAccount", async (req, res, next) => {
    
    const { user_id }=req.body;

    var status;
    var message;
 
    if(!user_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        
        var sql=`UPDATE tbl_users SET is_pause=1 WHERE id=${user_id}`;
        db.query(sql, function (err, rows) {
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            else
            {
                status="success";
                message="Account has been paused successfully";
                res.status(200).json({status:status,message:message});
                
            }
        });
        
    }
});

router.post("/reactive_pauseAccount", async (req, res, next) => {
    
    const { user_id }=req.body;

    var status;
    var message;
 
    if(!user_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        
        var sql=`UPDATE tbl_users SET is_pause=0 WHERE id=${user_id}`;
        db.query(sql, function (err, rows) {
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            else
            {
                status="success";
                message="Account has been reactive successfully";
                res.status(200).json({status:status,message:message});
                
            }
        });
        
    }
});
module.exports=router 