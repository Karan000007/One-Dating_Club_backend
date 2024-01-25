const cron = require('node-cron');
var db = require('./db');
const { createTransport } = require('nodemailer');


function run() 
{
    db.query('SELECT * FROM smtp_setting'
            , function (err, smtpData) {

                
            
    var qry='';
    qry="SELECT u.email,u.id FROM tbl_users u INNER JOIN tbl_filterdata tf ON (tf.college=u.institute OR tf.company=u.company_name) OR (tf.college=u.institute AND tf.company=u.company_name) WHERE u.status=0";


    db.query(qry
            , function (err, rows) {

            if (err) {
                console.log(err);
            }

            var transporter = createTransport({
                host:smtpData[0].smtp_host,
                port: smtpData[0].smtp_port,
                auth: {
                    user: smtpData[0].smtp_user,
                    pass:smtpData[0].smtp_detail,
                },
            });

            if(rows.length > 0)
            {

                for(var i = 0; i < rows.length; i++)
                {
                    
                    var mailOptions = {
                        from: smtpData[0].from_detail,
                        to: rows[i].email,
                        subject: `Account Approved By OnePercent Dating Club`,
                        text: `Dear User, Your account has been approved by admin. now you can find your best matches.`
                    };
        
                    var user_id=rows[i].id;
                    db.query("UPDATE tbl_users SET status=1,is_phase2=1 WHERE id="+user_id+"");

                    transporter.sendMail(mailOptions, async function(error, info){
                        if (error) {
                           console.log(error);
                        } 
                   });
                }
                
            }
        });

    });
    
}

let my_job=cron.schedule('* * * * *', () => {

    run();
});   

