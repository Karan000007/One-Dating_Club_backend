const router=require("express").Router();
var request = require('request');
var db = require('../db');
const moment = require('moment');
const Entry_date=moment().format("YYYY-MM-DD HH:mm:ss");
router.post("/", async (req, res, next) => {
    
    const { user_id }=req.body;

    var status;
    var message;
    let first_array=[];
    let second_array=[];
    var matches_user=[];
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
              
                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message,});
                }

                if(rows?.length > 0)
                {

                    if(rows[0].today_matches_show == 0)
                    {
                        var i=0;
                        
                        var genderextra_query='';
                        if(rows[0].gender_prefrences != 'Both')
                        {
                            genderextra_query=` AND gender_prefrences='${rows[0].gender}' AND gender='${rows[0].gender_prefrences}'`;
                        }
                        if(rows[0].distance_prefrences > 0)
                        {
                            var match_sql1=`SELECT tmp.* FROM(SELECT *,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age,round(( 6371 * acos( cos( radians(round(${rows[0].latitude},2)) ) * cos( radians( latitude) ) *
                            cos( radians( longitude) - radians(round(${rows[0].longitude},2)) ) + sin( radians(round(${rows[0].latitude},2)) ) * sin( radians(latitude) ) ) )) AS distance
                            FROM tbl_users WHERE (study_main_cat='${rows[0].study_main_cat}' OR industry_main_cat='${rows[0].industry_main_cat}' OR interests LIKE '%${rows[0].interests}%')
                            ${genderextra_query}
                            AND status=1 AND is_pause=0 AND id <> ${rows[0].id}
                            AND id NOT IN (SELECT profile_id FROM tbl_profile_like WHERE user_id=${rows[0].id})
                            AND id NOT IN (SELECT profile_id FROM tbl_profile_reject WHERE user_id=${rows[0].id})
                            ) AS tmp WHERE tmp.distance <= ${rows[0].distance_prefrences} 
                            AND tmp.Age >= ${rows[0].age_prefrences_min} AND tmp.Age <= ${rows[0].age_prefrences_max} ORDER BY tmp.distance ASC LIMIT 2`;
                        }
                        else
                        {
                            var match_sql1=`SELECT tmp.* FROM (SELECT *,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age,round(( 6371 * acos( cos( radians(round(${rows[0].latitude},2)) ) * cos( radians( latitude) ) *
                            cos( radians( longitude) - radians(round(${rows[0].longitude},2)) ) + sin( radians(round(${rows[0].latitude},2)) ) * sin( radians(latitude) ) ) )) AS distance
                            FROM tbl_users WHERE (study_main_cat='${rows[0].study_main_cat}' OR industry_main_cat='${rows[0].industry_main_cat}' OR interests LIKE '%${rows[0].interests}%')
                            ${genderextra_query}
                            AND status=1 AND is_pause=0 AND id <> ${rows[0].id}
                            AND id NOT IN (SELECT profile_id FROM tbl_profile_like WHERE user_id=${rows[0].id})
                            AND id NOT IN (SELECT profile_id FROM tbl_profile_reject WHERE user_id=${rows[0].id}) ) AS tmp
                            WHERE tmp.Age >= ${rows[0].age_prefrences_min} AND tmp.Age <= ${rows[0].age_prefrences_max}
                            ORDER BY tmp.distance ASC LIMIT  2`;
                        }
                        
                        
                        
                        db.query(match_sql1, function(err,rows1){
                        
                            if (err) {
                                db.end();
                                message=err;
                                status="error";
                                res.status(200).json({status:status,message:message,});
                            }
                            
                            var extra_qry='AND id NOT IN(1,'+user_id+'';
                            if(rows1.length > 0)
                            {
                                
                                for(let index in rows1)
                                {
                                    if(+index === rows1.length - 1) {
                                        extra_qry+=","+rows1[index]['id']+')'
                                    }
                                    else
                                    {
                                        extra_qry+=","+rows1[index]['id']
                                    }
                                    
                                    
                                    db.query(`SELECT image FROM tbl_users_photos WHERE user_id=${rows1[index]['id']}`, (err, photos, fields) => {
                                        if (err) {
                                            db.end();
                                            message = err;
                                            status = "error";
                                            res.status(200).json({ status: status, message: message, });
                                        }

                                        let image_array=[];
                                        for(var p in photos)
                                        {
                                            let image={
                                                image:photos[p]['image']
                                            }
                                            image_array.push(image);
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
                                            photo: image_array,
                                            }
                                            
                                            first_array.push(userInfo);
                                            matches_user.push(rows1[index]['id']);
                                    });
                                } 

                               
                                
                                    
                            }
                            else
                            {
                                extra_qry+=')';
                            }
                            
                            var nex_matches_len=4;
                            if(rows1.length > 0) {
                                nex_matches_len=4-rows1.length;
                            }

                            if(rows[0].distance_prefrences > 0)
                            {
                                var match_sql2=`SELECT tmp.* FROM(SELECT *,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age,round(( 6371 * acos( cos( radians(round(${rows[0].latitude},2)) ) * cos( radians( latitude) ) *
                                cos( radians( longitude) - radians(round(${rows[0].longitude},2)) ) + sin( radians(round(${rows[0].latitude},2)) ) * sin( radians(latitude) ) ) )) AS distance
                                 FROM tbl_users WHERE status=1 ${genderextra_query} AND is_pause=0 AND id <> 1 AND id <>  ${rows[0].id} ${extra_qry}
                                 AND id NOT IN (SELECT profile_id FROM tbl_profile_like WHERE user_id=${rows[0].id})
                                 AND id NOT IN (SELECT profile_id FROM tbl_profile_reject WHERE user_id=${rows[0].id})
                                 ) AS tmp WHERE tmp.distance <= ${rows[0].distance_prefrences} ORDER BY tmp.distance,rand() LIMIT ${nex_matches_len}`;
                            }
                            else
                            {
                                var match_sql2=`SELECT tmp.* FROM(SELECT *,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age,round(( 6371 * acos( cos( radians(round(${rows[0].latitude},2)) ) * cos( radians( latitude) ) *
                                cos( radians( longitude) - radians(round(${rows[0].longitude},2)) ) + sin( radians(round(${rows[0].latitude},2)) ) * sin( radians(latitude) ) ) )) AS distance
                                 FROM tbl_users WHERE status=1 ${genderextra_query} AND is_pause=0 AND id <> 1 AND id <>  ${rows[0].id} ${extra_qry} 
                                 AND id NOT IN (SELECT profile_id FROM tbl_profile_like WHERE user_id=${rows[0].id})
                                 AND id NOT IN (SELECT profile_id FROM tbl_profile_reject WHERE user_id=${rows[0].id}) ) AS tmp
                                 ORDER BY tmp.distance,rand() LIMIT ${nex_matches_len}`;
                            }
                            
                            db.query(match_sql2, async (err, rows2) => {
                                if (err) {
                                    db.end();
                                    message = err;
                                    status = "error";
                                    res.status(200).json({ status: status, message: message, });
                                } else {
                                
                              const secondArrResponse = await new Promise((resolve, reject) => {

                                if(rows2?.length > 0)
                                {
                                    for(let second_index in rows2)
                                    {
                                        db.query(`SELECT image FROM tbl_users_photos WHERE user_id=${rows2[second_index]['id']}`, (err, photos) => {
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
                                                id: rows2[second_index]['id'],
                                                firstname: rows2[second_index]['firstname'],
                                                lastname: rows2[second_index]['lastname'],
                                                country_code: rows2[second_index]['country_code'],
                                                mobileno: rows2[second_index]['mobileno'],
                                                email: rows2[second_index]['email'],
                                                gender: rows2[second_index]['gender'],
                                                dob: rows2[second_index]['dob'],
                                                height_feet: rows2[second_index]['height_feet'],
                                                height_inch: rows2[second_index]['height_inch'],
                                                linkedin: rows2[second_index]['linkedin'],
                                                latest_degree: rows2[second_index]['latest_degree'],
                                                study: rows2[second_index]['study'],
                                                institute: rows2[second_index]['institute'],
                                                company_name: rows2[second_index]['company_name'],
                                                industry: rows2[second_index]['industry'],
                                                designation: rows2[second_index]['designation'],
                                                interests: rows2[second_index]['interests'],
                                                bio: rows2[second_index]['bio'],
                                                city: rows2[second_index]['city'],
                                                country: rows2[second_index]['country'],
                                                distance: rows2[second_index]['distance'],
                                                age: rows2[second_index]['Age'],
                                                referralCode: rows2[second_index]['referralCode'],
                                                photo: second_image_array,
                                            
                                            }
                                            
                                            matches_user.push(rows2[second_index]['id']);

                                            second_array.push(userInfo);
                                            if(+second_index === rows2.length - 1) {
                                                resolve(second_array)
                                            }
                                         
                                        });
                                    }
                                }
                                else
                                {
                                    resolve([])
                                }
                               });
                              
                                var res_data=first_array.concat(secondArrResponse);
                                
                                var today_matches=matches_user.join(",");
                                db.query(`UPDATE tbl_users SET today_matches_show=1,today_matches_profile='${today_matches}' WHERE id=${rows[0].id}`);
                                message="Data Found";
                                status="success";
                                res.status(200).json({status:status,message:message,res_data});
                                
                                }
                            });
                            
                            
                            
                        });
                    }
                    else
                    {
                        var match_sql1=`SELECT tmp.* FROM(SELECT *,TIMESTAMPDIFF(YEAR, str_to_date(dob, '%d/%m/%Y'), CURDATE()) AS Age,round(( 6371 * acos( cos( radians(round(${rows[0].latitude},2)) ) * cos( radians( latitude) ) *
                        cos( radians( longitude) - radians(round(${rows[0].longitude},2)) ) + sin( radians(round(${rows[0].latitude},2)) ) * sin( radians(latitude) ) ) )) AS distance
                            FROM tbl_users WHERE status=1 AND FIND_IN_SET(id,'${rows[0].today_matches_profile}') 
                            AND id NOT IN (SELECT profile_id FROM tbl_profile_like WHERE user_id=${rows[0].id})
                            AND id NOT IN (SELECT profile_id FROM tbl_profile_reject WHERE user_id=${rows[0].id}) ) AS tmp
                            ORDER BY tmp.distance`;

                            
                            db.query(match_sql1, async(err,rows1) => {
                        
                                if (err) {
                                    db.end();
                                    message=err;
                                    status="error";
                                    res.status(200).json({status:status,message:message,});
                                }
                                
                                if(rows1?.length > 0)
                                {
                                    const resultArrResponse = await new Promise((resolve, reject) => {

                                    for(let index in rows1)
                                    {
                                        
                                        db.query(`SELECT image FROM tbl_users_photos WHERE user_id=${rows1[index]['id']}`, (err, photos, fields) => {
                                            if (err) {
                                                db.end();
                                                message = err;
                                                status = "error";
                                                res.status(200).json({ status: status, message: message, });
                                            }
    
                                            let image_array=[];
                                            for(var p in photos)
                                            {
                                                let image={
                                                    image:photos[p]['image']
                                                }
                                                image_array.push(image);
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
                                                photo: image_array,
                                                }
                                                
                                                first_array.push(userInfo);

                                                if(+index === rows1.length - 1) {
                                                    resolve(first_array)
                                                }
                                                
                                                
                                        });
                                    } 
                                    });

                                    message="Data Found";
                                    status="success";
                                    res.status(200).json({status:status,message:message,res_data:resultArrResponse});
                                }
                                else
                                {
                                    message="Today's matches profile limit is over";
                                    status="error";
                                    res.status(200).json({status:status,message:message});
                                }
                                });
                        
                    }
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

router.post("/like", async (req, res, next) => {
    
    const { user_id,profile_id }=req.body;

    var status;
    var message;
 
    if(!user_id || !profile_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        db.query("DELETE FROM tbl_profile_like WHERE user_id = ? AND profile_id=?",[user_id,profile_id]);

        var sql="INSERT INTO tbl_profile_like (user_id,profile_id,entry_date) VALUES (?, ?, ?)";
        db.query(sql,[user_id,profile_id,Entry_date] , function (err, rows) {
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            else
            {
                let like_each_other=false;
                var sql="SELECT * FROM tbl_profile_like WHERE user_id=? AND profile_id=?";
                db.query(sql,[profile_id,user_id] , function (err, rows) {

                    if (err) {
                        db.end();
                        message=err;
                        status="error";
                        res.status(200).json({status:status,message:message});
                    }
                    else
                    {
                        if(rows.length > 0)
                        {
                            like_each_other=true;
                        }
                        
                        
                    }

                    message="success";
                    status="success";
                    res.status(200).json({status:status,message:message,like_each_other:like_each_other});
                });

                
            }
        });
        
    }
});


router.post("/reject_profile", async (req, res, next) => {
    
    const { user_id,profile_id }=req.body;

    var status;
    var message;
 
    if(!user_id || !profile_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        db.query("DELETE FROM tbl_profile_reject WHERE user_id = ? AND profile_id=?",[user_id,profile_id]);

        var sql="INSERT INTO tbl_profile_reject (user_id,profile_id,entry_date) VALUES (?, ?, ?)";
        db.query(sql,[user_id,profile_id,Entry_date] , function (err, rows) {
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            else
            {
                status="success";
                message="Profile has been rejected successfully";
                res.status(200).json({status:status,message:message});
                
            }
        });
        
    }
});


router.post("/matches_bychat", async (req, res, next) => {
    
    const { user_id }=req.body;

    var status;
    var message;
    var first_array=[];
    if(!user_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        var sql=`SELECT u.*,tmp.*,
        TIMESTAMPDIFF(YEAR, str_to_date(u.dob, '%d/%m/%Y'), CURDATE()) AS Age
        FROM
        (SELECT replace(replace(c.chat_participants,'${user_id}',''),',','') AS profile_id,IFNULL(DATEDIFF(CURRENT_DATE(), m.created_at),DATEDIFF(CURRENT_DATE(), c.created_at)) AS chat_days
        FROM chat c
        LEFT JOIN message m ON m.chat_id = c.id
        WHERE 
        FIND_IN_SET(${user_id}, c.chat_participants) ORDER BY m.id DESC LIMIT 1) AS tmp
        INNER JOIN tbl_users u ON u.id=tmp.profile_id WHERE tmp.chat_days <= 14 AND
        u.id NOT IN (SELECT profile_id FROM tbl_profile_block WHERE user_id=${user_id}) AND
        u.status=1 AND u.is_pause=0 ORDER BY chat_days ASC`;

        
        db.query(sql, async (err, rows1) => {
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            
            if(rows1.length > 0)
            {
                const secondArrResponse = await new Promise((resolve, reject) => {
                    if(rows1?.length > 0)
                    {
                        var fix_chat_days=14;
                        for(let index in rows1)
                        {
                        
                            db.query(`SELECT image FROM tbl_users_photos WHERE user_id=${rows1[index]['id']}`, (err, photos, fields) => {
                                if (err) {
                                    db.end();
                                    message = err;
                                    status = "error";
                                    res.status(200).json({ status: status, message: message, });
                                }

                                let image_array=[];
                                for(var p in photos)
                                {
                                    let image={
                                        image:photos[p]['image']
                                    }
                                    image_array.push(image);
                                }

                                let userInfo = {
                                    id: rows1[index]['id'],
                                    firstname: rows1[index]['firstname'],
                                    lastname: rows1[index]['lastname'],
                                    age: rows1[index]['Age'],
                                    city: rows1[index]['city'],
                                    country: rows1[index]['country'],
                                    email: rows1[index]['email'],
                                    gender: rows1[index]['gender'],
                                    height_feet: rows1[index]['height_feet'],
                                    height_inch: rows1[index]['height_inch'],
                                    latest_degree: rows1[index]['latest_degree'],
                                    study: rows1[index]['study'],
                                    institute: rows1[index]['institute'],
                                    company_name: rows1[index]['company_name'],
                                    industry: rows1[index]['industry'],
                                    designation: rows1[index]['designation'],
                                    interests: rows1[index]['interests'],
                                    bio: rows1[index]['bio'],
                                    photo: image_array,
                                    linkedin: rows1[index]['linkedin'],
                                    referralCode: rows1[index]['referralCode'],
                                    days_left: (fix_chat_days-rows1[index]['chat_days']),
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
                status="success";
                message="Data found";
                res.status(200).json({status:status,message:message,res_data:first_array});
                
            }
            else
            {
                message="No data found";
                status="error";
                res.status(200).json({status:status,message:message});
                
            }
        });
        
    }
});


router.post("/block", async (req, res, next) => {
    
    const { user_id,profile_id,reason }=req.body;

    var status;
    var message;
 
    if(!user_id || !profile_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        db.query("DELETE FROM tbl_profile_block WHERE user_id = ? AND profile_id=?",[user_id,profile_id]);

        var sql="INSERT INTO tbl_profile_block (user_id,profile_id,reason,entry_date) VALUES (?, ?, ?, ?)";
        db.query(sql,[user_id,profile_id,reason,Entry_date] , function (err, rows) {
            if (err) {
                db.end();
                message=err;
                status="error";
                res.status(200).json({status:status,message:message});
            }
            else
            {
                var sql="SELECT * FROM tbl_profile_block WHERE user_id=? AND profile_id=?";
                db.query(sql,[profile_id,user_id] , function (err, rows) {

                    if (err) {
                        db.end();
                        message=err;
                        status="error";
                        res.status(200).json({status:status,message:message});
                    }
                    else
                    {
                        message="success";
                        status="Profile has been blocked successfully";
                        res.status(200).json({status:status,message:message});
                        
                    }

                    
                });

                
            }
        });
        
    }
});


router.post("/expire", async (req, res, next) => {
    
    const { chat_id,user_id,profile_id,reason }=req.body;

    var status;
    var message;
 
    if(!chat_id) 
    {
        message="Something went wrong..!";
        status="error";
        res.status(200).json({status:status,message:message,});
    }
    else
    {  
       
        db.query("DELETE FROM message WHERE chat_id = ?",[chat_id]);

        db.query("DELETE FROM chat WHERE id = ?",[chat_id]);

        if(reason)
        {
            var sql="INSERT INTO tbl_chat_expire (user_id,profile_id,reason,entry_date) VALUES (?, ?, ?, ?)";
            db.query(sql,[user_id,profile_id,reason,Entry_date] , function (err, rows) {
                if (err) {
                    db.end();
                    message=err;
                    status="error";
                    res.status(200).json({status:status,message:message});
                }
            
            });
        }
        
        

        message="success";
        status="Chat has been expired successfully";
        res.status(200).json({status:status,message:message});
       
    }
});
module.exports=router 