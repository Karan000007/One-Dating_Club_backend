const router=require("express").Router();
var request = require('request');
var db = require('../db');

const { createTransport } = require('nodemailer');



router.get("/Approve",async (req, res, next) => {

    
    const { to_email,user_name }=req.body;
    
    var status;
    var message;
     
    if(!to_email) 
    {
        message="Please Enter destination email address";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  


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
                to: to_email,
                subject: `Account Approved By OnePercent Dating Club`,
                html: `<!DOCTYPE  html >
                <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
                   <head>
                      <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                      <style type="text/css"> * {margin:0; padding:0; text-indent:0; }
                         p { color: #374050; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; margin:0pt; }
                         .s1 { color: black; font-family:Verdana, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
                         .a { color: #1A61FF; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: underline; font-size: 12pt; }
                         .s2 { color: #1A61FF; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 12pt; }
                      </style>
                   </head>
                   <body style="border:1px solid black;padding:5px">
                    <p style="margin-left:40%;text-indent: 0pt;text-align: left;">
                   
                    <img width="225" style="" height="124" src="https://onepercentdating.club/logo.png"/></p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-top: 6pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Subject: Exclusive Access Granted: Welcome to One Percent Dating Club</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">Dear ${user_name},</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p class="s1" style="padding-left: 5pt;text-indent: 0pt;text-align: left;">Celebrating Your Arrival at One Percent Dating Club</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">We are thrilled to extend to you a warm welcome to the One Percent Dating Club community.</p>
                      <p style="padding-top: 4pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Following a thorough review of your profile, we are delighted to inform you that you have</p>
                      <p style="padding-top: 4pt;padding-left: 5pt;text-indent: 0pt;line-height: 136%;text-align: left;">been selected to join our exclusive circle of distinguished members. Congratulations, you are now part of a world where excellence and allure meet.</p>
                      <p class="s1" style="padding-top: 10pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Discover the Essence of One Percent Dating Club</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-left: 5pt;text-indent: 0pt;line-height: 133%;text-align: left;">At One Percent Dating Club, we pride ourselves on maintaining an environment that is both selective and diverse, uniting individuals who are not only intelligent and creative but also share a relentless drive for ambition. Our mission revolves around nurturing connections</p>
                      <p style="padding-left: 5pt;text-indent: 0pt;line-height: 136%;text-align: left;">among those who seek partners of equal calibre. Delve deeper into our mission [insert link to mission statement] to understand the core of our community.</p>
                      <p class="s1" style="padding-top: 10pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Maximizing Your One Percent Dating Club Experience</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-left: 5pt;text-indent: 0pt;line-height: 132%;text-align: justify;">The initial days within our community are pivotal. Our advanced algorithms are fine-tuning to your interactions - the prospects you find appealing and those who reciprocate your interest. To enhance this calibration, we encourage you to upload six high-resolution photographs that capture your essence and complete your profile with an engaging bio.</p>
                      <p class="s1" style="padding-top: 11pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Navigating Your Exclusive Journey</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-left: 5pt;text-indent: 0pt;line-height: 130%;text-align: justify;">Envision a vibrant, happy hour singles scene, tailored just for you. Each day, at the designated happy hour, we present a curated selection of potential matches. The quantity ranges from 1-4, tailored to your preferences and profile specifics. Indicate your interest with a Heart, or</p>
                      <p style="padding-left: 5pt;text-indent: 0pt;line-height: 133%;text-align: left;">pass with an X. Mutual Hearts? Congratulations, a Match is made, opening the door to conversations filled with charm and wit. Patience is key, as our selective process means only a handful of prospects are showcased daily.</p>
                      <p class="s1" style="padding-top: 10pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Your Voice Matters</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <p style="padding-left: 5pt;text-indent: 0pt;text-align: left;">Your journey with us is not just about making connections; it&#39;s about shaping the future of</p>
                      <p style="padding-top: 4pt;padding-left: 5pt;text-indent: 0pt;line-height: 130%;text-align: left;">One Percent Dating Club. We value your insights and feedback immensely. Encounter a bug? Have a suggestion or an idea? Or simply wish to share your thoughts? Reach out to us at</p>
                      <p style="padding-top: 5pt;padding-left: 5pt;text-indent: 0pt;line-height: 130%;text-align: left;"><a href="mailto:contact@Onepercentdatingclub.com" class="a" target="_blank">contact</a><a href="mailto:contact@Onepercentdatingclub.com" class="s2" target="_blank">@</a><a href="mailto:contact@Onepercentdatingclub.com" class="a" target="_blank">Onepercentdatingclub.com</a>. Your input is the catalyst for our innovation and growth.</p>
                      <p style="padding-top: 12pt;padding-left: 5pt;text-indent: 0pt;line-height: 130%;text-align: left;">Welcome to an exclusive realm where being exceptional is the norm. We are excited to have you with us.</p>
                      <p style="text-indent: 0pt;text-align: left;"><br/></p>
                      <br/><br/>
                      <p style="padding-top: 12pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">Best Regards,</p>
                      <p style="padding-top: 4pt;padding-left: 5pt;text-indent: 0pt;text-align: left;">The One Percent Dating Club Team</p>
                   </body>
                </html>`
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    message=error;
                    status="error";
                    res.status(200).json({status:status,message:message});
                } else {
                    message="Email has been send successfully.";
                    status="success";
                    res.status(200).json({status:status,message:message});
                }
            });
        });
       
    }
   
});


router.get("/Reject",async (req, res, next) => {

    
    const { to_email,reason }=req.body;
    
    var status;
    var message;
     
    if(!to_email) 
    {
        message="Please Enter destination email address";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  


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
                to: to_email,
                subject: `Account Rejected By OnePercent Dating Club`,
                text: `Dear User, Your account has been rejected by admin. Becuase of `+reason
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    message=error;
                    status="error";
                    res.status(200).json({status:status,message:message});
                } else {
                    message="Email has been send successfully.";
                    status="success";
                    res.status(200).json({status:status,message:message});
                }
            });
        });
       
    }
   
});
module.exports=router 