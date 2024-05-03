const cron = require('node-cron');
var db = require('./db');
const { createTransport } = require('nodemailer');
const axios = require('axios');


var sendNotification = function (data) {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic YjhiZGQ4ZWYtNDQ0MC00MDg5LWEyMTMtMTVmZGNjOGI0Mjdl"
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };

    var https = require('https');
    var req = https.request(options, function (res) {
        res.on('data', function (data) {
            //console.log("Response:");
            //console.log(JSON.parse(data));
        });
    });

    req.on('error', function (e) {
        console.log("ERROR:");
        console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();
};

var message = {
    app_id: "5039ccac-714d-4484-8958-70df23464b8f",
    contents: {"en": "New matches await! Open One% Dating Club to discover who's ready to connect with you today."},
    included_segments: [ "All"],
    
}

    


function run() 
{
    // db.query('SELECT * FROM smtp_setting'
    //         , function (err, smtpData) {

                
            
    var qry='';

    //WHERE u.status=0
    qry="SELECT DISTINCT u.email,u.id FROM tbl_users u INNER JOIN tbl_filterdata tf ON (tf.college=u.institute OR tf.company=u.company_name OR tf.withindia=u.company_name) OR (tf.college=u.institute AND tf.company=u.company_name) OR (tf.college=u.institute AND tf.withindia=u.company_name) WHERE u.status=0";


    db.query(qry
            , function (err, rows) {

            if (err) {
                console.log(err);
            }

            // var transporter = createTransport({
            //     host:smtpData[0].smtp_host,
            //     port: smtpData[0].smtp_port,
            //     auth: {
            //         user: smtpData[0].smtp_user,
            //         pass:smtpData[0].smtp_detail,
            //     },
            // });

            if(rows.length > 0)
            {

                for(var i = 0; i < rows.length; i++)
                {
                    var user_id=rows[i].id;
                    db.query("UPDATE tbl_users SET is_phase2=1 WHERE id="+user_id+"");
                //     var mailOptions = {
                //         from: smtpData[0].from_detail,
                //         to: rows[i].email,
                //         subject: `Account Approved By OnePercent Dating Club`,
                //         text: `Dear User, Your account has been approved by admin. now you can find your best matches.`
                //     };
        
                    

                //     transporter.sendMail(mailOptions, async function(error, info){
                //         if (error) {
                //            console.log(error);
                //         } 
                //    });
                }
                
            }
        });

    //});
    
}


async function matches_alg_run() 
{
    db.query("UPDATE tbl_users SET today_matches_show=0,today_matches_profile='' WHERE entry_date < NOW()");
    sendNotification(message);
    
}

let my_job=cron.schedule('* * * * *', () => {
    run();
});   

cron.schedule('0 18 * * *', () => {
    matches_alg_run();
});   


