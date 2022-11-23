app.get("/item/listing", (req,res) => {
    var sqlQuery = { 
        text: `SELECT email, is_verified FROM public.profile a JOIN public.account b ON a.account_id = b.account_id WHERE a.account_id = $1`,
        values: [            
            req.session.user_id
        ]
    }

    client.query(sqlQuery, (error, result) => {
        if(error){
            console.log(error)
            res.send(error)
        }
        else if(!error){
            if(result.rows[0].is_verified == 0){
                var email = result.rows[0].email
                var otp = otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false });
                req.session.emailotp = otp
                
                async function main() {

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: "smtp.sendgrid.net",
                        port: 465,
                        auth: {
                            user: process.env.NM_USERNAME,
                            pass: process.env.NM_PASSWORD
                    },
                    });
                
                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                    from: '"Naedenglee" <naedenglee.capstone@gmail.com>', // sender address
                    to: `${email}`, // list of receivers
                    subject: "EMAIL OTP - Mang-Hiram", // Subject line
                    text: "Hello Nae", // plain text body
                    html: `<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
                    <table role="presentation"
                        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
                        <tbody>
                        <tr>
                            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
                            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                                <tbody>
                                <tr>
                                    <td style="padding: 40px 0px 0px;">
                                    <div style="text-align: left;">
                                        <div style="padding-bottom: 20px;"><img src="https://iili.io/HHBnlLb.md.png" alt="Company" style="width: 56px;"></div>
                                    </div>
                                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                                        <div style="color: rgb(0, 0, 0); text-align: left;">
                                        <h1 style="margin: 1rem 0">One-Time Password(OTP)</h1>
                                        <p style="padding-bottom: 16px">Please use the OTP code below to verify your account.</p>
                                        <p style="padding-bottom: 16px"><strong style="font-size: 130%">${req.session.emailotp}</strong></p>
                                        <p style="padding-bottom: 16px">If you did not request this, you can ignore this email.</p>
                                        <p style="padding-bottom: 16px">Thanks,<br>Mang-Hiram</p>
                                        </div>
                                    </div>
                                    <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                                        <p style="padding-bottom: 16px">This is an automated message. Please do not reply.</p>
                                    </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </body>`, // html body
                    });
                
                    console.log("Message sent: %s", info.messageId);
                    res.render('pages/try_validateemail', { email })
                }
                
                main().catch(console.error);
            }
            else if(result.rows[0].is_verified == 1){
                res.render('pages/item_list')
            }
        }
    })    
})

app.get('/item/listing', (req,res) => {
    var sqlQuery = { 
        text: `SELECT email, is_verified FROM public.profile a JOIN public.account b ON a.account_id = b.account_id WHERE a.account_id = $1`,
        values: [            
            req.session.user_id
        ]
    }

    client.query(sqlQuery, (error, result) => {
        if(error){
            console.log(error)
            res.send(error)
        }
        else if(!error){
            req.session.email = result.rows[0].email
            res.redirect('/emailcheck')
        }
    })
})

app.get('/emailcheck', (req,res) => {
    var email = req.session.email
                var otp = otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false });
                req.session.emailotp = otp
                
                async function main() {

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: "smtp.sendgrid.net",
                        port: 465,
                        auth: {
                            user: process.env.NM_USERNAME,
                            pass: process.env.NM_PASSWORD
                    },
                    });
                
                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                    from: '"Naedenglee" <naedenglee.capstone@gmail.com>', // sender address
                    to: `${email}`, // list of receivers
                    subject: "EMAIL OTP - Mang-Hiram", // Subject line
                    text: "Hello Nae", // plain text body
                    html: `<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
                    <table role="presentation"
                        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
                        <tbody>
                        <tr>
                            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
                            <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                                <tbody>
                                <tr>
                                    <td style="padding: 40px 0px 0px;">
                                    <div style="text-align: left;">
                                        <div style="padding-bottom: 20px;"><img src="https://iili.io/HHBnlLb.md.png" alt="Company" style="width: 56px;"></div>
                                    </div>
                                    <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                                        <div style="color: rgb(0, 0, 0); text-align: left;">
                                        <h1 style="margin: 1rem 0">One-Time Password(OTP)</h1>
                                        <p style="padding-bottom: 16px">Please use the OTP code below to verify your account.</p>
                                        <p style="padding-bottom: 16px"><strong style="font-size: 130%">${req.session.emailotp}</strong></p>
                                        <p style="padding-bottom: 16px">If you did not request this, you can ignore this email.</p>
                                        <p style="padding-bottom: 16px">Thanks,<br>Mang-Hiram</p>
                                        </div>
                                    </div>
                                    <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                                        <p style="padding-bottom: 16px">This is an automated message. Please do not reply.</p>
                                    </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </body>`, // html body
                    });
                
                    console.log("Message sent: %s", info.messageId);
                    res.render('pages/try_validateemail', { email })
                }
                
                main().catch(console.error);
})