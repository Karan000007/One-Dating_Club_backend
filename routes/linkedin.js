const router=require("express").Router();
var request = require('request');
var db = require('../db');
const puppeteer = require('puppeteer');
const { convert } = require('html-to-text');
const fs = require("fs");

//Login with mobile

router.get("/", async (req,res)=>{

    var status;
    var message;
    //const education = fs.readFileSync("./education.html","utf8");

   const browser = await puppeteer.launch({ headless: false,defaultViewport:null,args:['--start-maximized'] }); // You can set headless to true for the script to run in the background
  const page = await browser.newPage();
  
  //await page.setViewport({ width: 1280, height: 800, isMobile: false });
  // Navigate to LinkedIn login page
  await page.goto('https://www.linkedin.com/login');

  // Enter your login credentials - replace 'your_username' and 'your_password' with your actual login details
  await page.type('#username', '8238375356');
  await page.type('#password', 'Bhavika@8595');

// await page.type('#username', '');
//   await page.type('#password', '');
  await page.click('.btn__primary--large');

await page.waitForNavigation();

const profileUrl = 'https://www.linkedin.com/in/bhavika-patoliya-642b181b9/';
await page.goto(profileUrl);

const education = await page.$$eval('.pvs-list', element => element[3].innerHTML);



var edu_text = convert(education, { wordwrap: 130 });
var edu_flt = edu_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
var edu_split=edu_flt.split("[")


var edu_arra = Array();

for (let i = 1; i < edu_split.length; i++) {
    
    if(edu_split[i])
    {
        edu_arra[i] = {
              text:edu_split[i],
              // author: author[i]
            }
    }
}

browser.close();
  message="success";
  status="success";
  res.status(200).json({status:status,message:message,details:edu_arra});
});





module.exports=router 