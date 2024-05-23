var express= require('express');
var validator = require("email-validator");
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();
app.use(bodyParser.json());

const checkMxRecord = (domain) => {
    return new Promise((resolve, reject) => {
        dns.resolveMx(domain, (err, addresses) => {
            if (err) {
                console.error("Error", err);
                reject(err);
            } else {
                console.log(`MX records for domain ${domain}:`, addresses);
                resolve(addresses && addresses.length > 0);
            }
        });
    });
};

app.post('/validate-email',async (req,res)=>{

    const email= req.body.email;

    if(!email){
        return res.status(400).json({message:"Please provide email"});
    }

    const isValidSyntax=validator.validate(email);
    let isValidDomain=false;

    if(isValidSyntax)
        {
            const domain=email.split('@')[1];

            try {
                isValidDomain=await checkMxRecord(domain);
            } catch (error) {
              isValidDomain=false;    
            }
        }

        return res.json({
            email: email,
            is_valid_syntax: isValidSyntax,
            is_valid_domain: isValidDomain,
            is_valid: isValidSyntax && isValidDomain
        });
})

app.listen(4000,()=>
{
    console.log('server is running on port 4000');
})