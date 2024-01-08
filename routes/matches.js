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
                    var res_data=[];
                    var i=0;
                    var match_sql1="SELECT * FROM tbl_users WHERE gender='"+rows[0].gender_prefrences+"' AND educational_prefrences='"+rows[0].educational_prefrences+"' AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN '"+rows[0].age_prefrences_min+"' AND '"+rows[0].age_prefrences_max+"'"
                    "industry='"+rows[0].industry+"' AND interests LIKE '%"+rows[0].interests+"%' AND status=1 ORDER BY rand() LIMIT 2";

                    db.query(match_sql1, async function(err,rows1){
                       
                        if (err) {
                            db.end();
                            message=err;
                            status="error";
                            res.status(200).json({status:status,message:message,});
                        }
                        else
                        {

                            for(var i = 0; i < rows1.length; i++)
                            {
                                res_data.push(rows1[i])
                                
                                i++;
                            }
                            
                        }
                        

                        var nex_matches_len=4;
                        if(rows.length > 0)
                        {
                             nex_matches_len=4-rows.length;
                        }

                        var match_sql2="SELECT * FROM tbl_users WHERE status=1 ORDER BY rand() LIMIT "+nex_matches_len;
                        db.query(match_sql2, function (err, rows2) {

                            console.log('len', rows2.length);
                            if (err) {
                                db.end();
                                message = err;
                                status = "error";
                                res.status(200).json({ status: status, message: message, });
                            }

                            else {
                                for (var i = 0; i < rows2.length; i++) {
                                    res_data.push(rows2[i]);
                                    i++;
                                }
                            }

                        });
                        
                        message="Data Found";
                        status="success";
                        res.status(200).json({status:status,message:message,res_data});
                    });
                }
                else
                {
                    message="User not approved from the admin side";
                    status="error";
                    res.status(200).json({status:status,message:message});
                }
            });
        
        
    }
});


module.exports=router 