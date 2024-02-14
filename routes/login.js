const router=require("express").Router();
var request = require('request');
var db = require('../db');


const accountSid = process.env.SMS_ACCOUNT_SID;
const authToken = process.env.SMS_ACCOUNT_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


//Login with mobile

router.post("/login_with_mob", async (req,res)=>{
    
    const { country_code,mobileno,api_type }=req.body;

    
    var status;
    var message;

    if(!country_code || !mobileno || !api_type) 
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
                if(api_type=='login')
                {
                    if(rows[0].status==1)
                    {
                        message="success";
                        status="success";
                        res.status(200).json({status:status,message:message,status_code:1});
                    }
                    else
                    {
                        message="Your account not approved by admin.";
                        status="error";
                        res.status(200).json({status:status,message:message,status_code:0});
                    }
                }
                else
                {
                    status="success";
                    message="Mobile number already exist";
                    res.status(200).json({status:status,message:message});
                }
                
                
            }
            else
            {
                message="Mobile number wasn't exist. Please Create your profile first.";
                status="error";
                res.status(200).json({status:status,message:message,});
            }
        });
    }
});

//Login with email

router.post("/login_with_email", async (req,res)=>{
    
    const { email,api_type }=req.body;

    
    var status;
    var message;

    if(!email || !api_type) 
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
                if(api_type=='login')
                {
                    if(rows[0].status==1)
                    {
                        message="success";
                        status="success";
                        
                        res.status(200).json({status:status,message:message,status_code:1});
                    }
                    else
                    {
                        message="Your account wasn't approved by admin.";
                        status="error";
                        res.status(200).json({status:status,message:message,status_code:0});
                    }
                  
                }
                else
                {
                    status="success";
                    message="Email already exist";
                    res.status(200).json({status:status,message:message});
                }
            }
            else
            {
                message="Email not exist. Please Create your profile first.";
                status="error";
                res.status(200).json({status:status,message:message});
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
                body: "Welcome to the One Percent Dating Club, where exceptional connections await. Your personal OTP for entry is "+OTP+". Please enter this code within the next 5 minutes to confirm your identity and proceed to a world of exclusive dating experiences. We're thrilled to have you join our distinguished community.",
                to: "+"+country_code+""+mobileno, // Text your number
                from: '+13465531781', // From a valid Twilio number
            });


            var sql="INSERT INTO tbl_otp (mobile_no,otp,entry_date) VALUES (?, ?, ?)";
            db.query(sql,[(country_code+""+mobileno),OTP,new Date()] , function (err, rows) {
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
                    res.status(200).json({status:status,message:message});
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
                       
                        if(err)
                        {
                            message=err;
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                        else
                        {
                            message="success";
                            status="Otp has been verified";
                            res.status(200).json({status:status,message:message});
                        }

                       
                    });
                    
                    
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
        var extra_sql='';
        if(country_code && mobileno)
        {
            extra_sql=`(country_code = ${country_code} AND mobileno='${mobileno}')`;
        }
        else
        {
            extra_sql=`email = '${email}'`;
        }
        db.query(`SELECT u.*,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age FROM tbl_users u 
        LEFT JOIN tbl_users_photos up ON up.user_id=u.id WHERE ${extra_sql} GROUP BY u.id ORDER BY id DESC LIMIT 1`
        , function (err, rows) {
              
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            
            if(rows.length > 0)
            { 
                db.query(`SELECT image,id FROM tbl_users_photos WHERE user_id=${rows[0].id}`, (err, photos) => {
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
                            image:photos[p]['image'],
                            photo_id:photos[p]['id']
                        }
                        second_image_array.push(image);
                    }
                    
                    let userInfo={
                        id: rows[0]['id'],
                        firstname: rows[0]['firstname'],
                        lastname: rows[0]['lastname'],
                        country_code: rows[0]['country_code'],
                        mobileno: rows[0]['mobileno'],
                        email: rows[0]['email'],
                        gender: rows[0]['gender'],
                        dob: rows[0]['dob'],
                        height_feet: rows[0]['height_feet'],
                        height_inch: rows[0]['height_inch'],
                        linkedin: rows[0]['linkedin'],
                        latest_degree: rows[0]['latest_degree'],
                        study: rows[0]['study'],
                        institute: rows[0]['institute'],
                        company_name: rows[0]['company_name'],
                        industry: rows[0]['industry'],
                        designation: rows[0]['designation'],
                        interests: rows[0]['interests'],
                        bio: rows[0]['bio'],
                        city: rows[0]['city'],
                        country: rows[0]['country'],
                        distance: rows[0]['distance_prefrences'],
                        age: rows[0]['Age'],
                        referralCode: rows[0]['referralCode'],
                        gender_prefrences: rows[0]['gender_prefrences'],
                        age_prefrences_min: rows[0]['age_prefrences_min'],
                        age_prefrences_max: rows[0]['age_prefrences_max'],
                        educational_prefrences: rows[0]['educational_prefrences'],
                        used_referral: rows[0]['used_referral'],
                        latitude: rows[0]['latitude'],
                        longitude: rows[0]['longitude'],
                        status: rows[0]['status'],
                        photo: second_image_array,
                    };
                    message="success";
                    status="User found";
                    res.status(200).json({status:status,message:message,details:userInfo});
                });
                
                
                
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