const router=require("express").Router();
var request = require('request');
var db = require('../db');

router.post("/", async (req, res, next) => {
    
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

        db.query('SELECT * FROM tbl_users WHERE id=? AND status=1', [user_id]
            , function (err, rows) {
                
                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }

                if(rows.length > 0)
                {
                    var sql="SELECT * FROM tbl_users WHERE gender='"+rows[0].gender_prefrences+"' AND educational_prefrences='"+rows[0].educational_prefrences+"' AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN '"+rows[0].age_prefrences_min+"' AND '"+rows[0].age_prefrences_max+"'"
                    "";
                    console.log('qry----',sql);
                }
                else
                {
                    message="User not approved from the admin side";
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }
            });
        
        
    }
});


module.exports=router 