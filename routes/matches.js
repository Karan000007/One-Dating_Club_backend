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
            ,function (err, rows) {
                var res_data = [];
                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }

                if(rows.length > 0)
                {

                    // if(rows[0].today_matches_show == 0)
                    // {
                        var i=0;
                        var match_sql1=`SELECT * FROM tbl_users WHERE gender='${rows[0].gender_prefrences}' AND educational_prefrences='${rows[0].educational_prefrences}'
                        AND TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) BETWEEN (${rows[0].age_prefrences_min} AND ${rows[0].age_prefrences_max}) AND
                        industry='${rows[0].industry}' AND interests LIKE '%${rows[0].interests}%' AND status=1 AND id <> ${rows[0].id} ORDER BY rand() LIMIT 2`;
                        
                        db.query(match_sql1, function(err,rows1){
                        
                            if (err) {
                                db.end();
                                message=err;
                                status="error";
                                res.status(200).json({status:status,message:message,});
                            }
                           
                            if(rows1.length > 0)
                            {
                                for(var index in rows1)
                                {
                                    db.query(`SELECT image FROM tbl_users_photos WHERE user_id=${rows1[index]['id']}`,function(err,photos){
                                        
                                        var image_array=[];
                                        for(var p in photos)
                                        {
                                            var image={
                                                image:photos[p]['image']
                                            }
                                            image_array.push(image);
                                        }
                                        var userInfo = {
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
                                            photo: image_array,
                                          }
                                         
                                          res_data.push(userInfo);
                                    });
                                } 
                                    
                            }

                            
                            var nex_matches_len=4;
                            if(rows1.length > 0) {
                                nex_matches_len=4-rows1.length;
                            }

                            var match_sql2=`SELECT * FROM tbl_users WHERE status=1 AND id <> 1 AND id <> ${rows[0].id} ORDER BY rand() LIMIT ${nex_matches_len}`;
                            db.query(match_sql2, function (err, rows2) {
                                if (err) {
                                    db.end();
                                    message = err;
                                    status = "error";
                                    res.status(200).json({ status: status, message: message, });
                                } else {
                                
                                    res_data=rows1.concat(rows2);

                                }

                                db.query(`UPDATE tbl_users SET today_matches_show=1 WHERE id=${rows[0].id}`);
                                message="Data Found";
                                status="success";
                                res.status(200).json({status:status,message:message,res_data});
                            
                            });
                            
                            
                            
                        });
                    // }
                    // else
                    // {
                    //     message="Today's matches profile limit is over";
                    //     status="error";
                    //     res.status(200).json({status:status,message:message});
                    // }
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