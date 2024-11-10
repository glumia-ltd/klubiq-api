import { EmailTemplate } from '../types/email.types';

export const verifyEmailTemplate = (): EmailTemplate => ({
	text: ` 
  Verify your Email
            
            Thanks for joining Klubiq. To finish you registration, please clicking the button below to verify your account.
           
            If you did not initiate this request, kindly ignore this email.

            Thank you,

            The Klubiq team
    `,
	html: `
    <!DOCTYPE html>
      <html lang="en">
        <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400..600&display=swap" rel="stylesheet"/>
    <title>Klubiq Email Verification</title>
          <style>
       img {
  border: none;
  -ms-interpolation-mode: bicubic;
  max-width: 100%;
}

body {
  background-color: #eaebed;
  font-family: 'Maven Pro', sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  padding: 0;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

table {
  border-collapse: separate;
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  min-width: 100%;
  width: 100%; }
  table td {
    font-family: 'Maven Pro', sans-serif;
    font-size: 14px;
    vertical-align: top;
}

/* -------------------------------------
    BODY & CONTAINER
------------------------------------- */

.body {
  background-color: #eaebed;
  color: #002147;
  width: 100%;
}

/* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
.container {
  display: block;
  Margin: 0 auto !important;
  /* makes it centered */
  max-width: 580px;
  padding: 10px;
  width: 580px;
}

/* This should also be a block element, so that it will fill 100% of the .container */
.content {
  box-sizing: border-box;
  display: block;
  Margin: 0 auto;
  max-width: 580px;
  padding: 10px;
}

/* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
.main {
  background: #ffffff;
  border-radius: 3px;
  width: 100%;
}

.header {
  padding: 20px 0;
}

.wrapper {
  box-sizing: border-box;
  padding: 20px;
}

.content-block {
  padding-bottom: 10px;
  padding-top: 10px;
}

.footer {
  clear: both;
  Margin-top: 10px;
  text-align: center;
  width: 100%;
}
  .footer td,
  .footer p,
  .footer span,
  .footer a {
    color: #9a9ea6;
    font-size: 12px;
    text-align: center;
}


/* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
h1,
h2,
h3,
h4 {
  color: #002147;
  font-family: sans-serif;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  margin-bottom: 30px;
}

h1 {
  font-size: 35px;
  font-weight: 300;
  text-align: center;
  text-transform: capitalize;
}

p,
ul,
ol {
  font-family: sans-serif;
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  margin-bottom: 15px;
}
  p li,
  ul li,
  ol li {
    list-style-position: inside;
    margin-left: 5px;
}

a {
  color: #002147;
  text-decoration: underline;
}
li::marker {
  color: red;
}

/* -------------------------------------
    BUTTONS
------------------------------------- */
.btn {
  box-sizing: border-box;
  width: 100%; }
  .btn > tbody > tr > td {
    padding-bottom: 15px; }
  .btn table {
    min-width: auto;
    width: auto;
}
  .btn table td {
    background-color: #ffffff;
    border-radius: 5px;
    text-align: center;
}
  .btn a {
    background-color: #ffffff;
    border: solid 1px #002147;
    border-radius: 5px;
    box-sizing: border-box;
    color: #002147;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    padding: 12px 25px;
    text-decoration: none;
    text-transform: capitalize;
}

.btn-primary table td {
  background-color: #002147;
}

.btn-primary a {
  background-color: #002147;
  border-color: #002147;
  color: #ffffff;
}

/* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
------------------------------------- */
.last {
  margin-bottom: 0;
}

.first {
  margin-top: 0;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

.align-left {
  text-align: left;
}

.clear {
  clear: both;
}

.mt0 {
  margin-top: 0;
}

.mb0 {
  margin-bottom: 0;
}

.preheader {
  color: transparent;
  display: none;
  height: 0;
  max-height: 0;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  mso-hide: all;
  visibility: hidden;
  width: 0;
}

.powered-by a {
  text-decoration: none;
}

hr {
  border: 0;
  border-bottom: 1px solid #f6f6f6;
  Margin: 20px 0;
}

/* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
@media only screen and (max-width: 620px) {
  table[class=body] h1 {
    font-size: 28px !important;
    margin-bottom: 10px !important;
  }
  table[class=body] p,
  table[class=body] ul,
  table[class=body] ol,
  table[class=body] td,
  table[class=body] span,
  table[class=body] a {
    font-size: 16px !important;
  }
  table[class=body] .wrapper,
  table[class=body] .article {
    padding: 10px !important;
  }
  table[class=body] .content {
    padding: 0 !important;
  }
  table[class=body] .container {
    padding: 0 !important;
    width: 100% !important;
  }
  table[class=body] .main {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-right-width: 0 !important;
  }
  table[class=body] .btn table {
    width: 100% !important;
  }
  table[class=body] .btn a {
    width: 100% !important;
  }
  table[class=body] .img-responsive {
    height: auto !important;
    max-width: 100% !important;
    width: auto !important;
  }
}

/* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
------------------------------------- */
@media all {
  .ExternalClass {
    width: 100%;
  }
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
    line-height: 100%;
  }
  .apple-link a {
    color: inherit !important;
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    text-decoration: none !important;
  }
  .btn-primary table td:hover {
    background-color: #002147 !important;
  }
  .btn-primary a:hover {
    background-color: #002147 !important;
    border-color: #002147 !important;
  }
}
          </style>
        </head>
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://postdrop.io">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="40" alt="Postdrop">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">Verify Your Email Address.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p>Hello <strong>{{ username }},</strong></p>
                        <p>
              Thanks for registering with Klubiq! To complete your registration and ensure your email address is correct,
              please verify your email by clicking on the button below:
            </p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="{{action_link}}" target="_blank">Verify Email Address</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                              <p>This link will expire in an hour. If you did not create an account with Klubiq, please disregard this message.</p>
<p>Welcome to Klubiq, and we look forward to having you with us!</p>
<p><strong>Warm regards,</strong></p>
<p>The Klubiq Team.</p>
<hr>
                                 <p><strong>Need help?</strong> If you have any questions please contact us by email at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">{{ copyright }}</span>
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
      </html>
    `,
	subject: 'Verify your email address',
});

export const resetPasswordEmailTemplate = (): EmailTemplate => ({
	text: ` 
  Reset password
            
            We received a request to reset the password for your KlubIQ account. 
            If you did not make this request, please ignore this email. 
            Otherwise, you can reset your password by clicking the link below:

            This link will expire in 24 hours for security purposes.

            If you have any issues or did not request a password reset, please contact our support team at support@klubiq.com.

            Thank you for being a part of KlubIQ!

            Best regards,
            The KlubIQ Team
    `,
	html: `
  <!DOCTYPE html>
      <html lang="en">
        <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400..600&display=swap" rel="stylesheet"/>
    <title>Reset Your Klubiq Password</title>
          <style>
       img {
  border: none;
  -ms-interpolation-mode: bicubic;
  max-width: 100%;
}

body {
  background-color: #eaebed;
  font-family: 'Maven Pro', sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  padding: 0;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

table {
  border-collapse: separate;
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  min-width: 100%;
  width: 100%; }
  table td {
    font-family: 'Maven Pro', sans-serif;
    font-size: 14px;
    vertical-align: top;
}

/* -------------------------------------
    BODY & CONTAINER
------------------------------------- */

.body {
  background-color: #eaebed;
  color: #002147;
  width: 100%;
}

/* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
.container {
  display: block;
  Margin: 0 auto !important;
  /* makes it centered */
  max-width: 580px;
  padding: 10px;
  width: 580px;
}

/* This should also be a block element, so that it will fill 100% of the .container */
.content {
  box-sizing: border-box;
  display: block;
  Margin: 0 auto;
  max-width: 580px;
  padding: 10px;
}

/* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
.main {
  background: #ffffff;
  border-radius: 3px;
  width: 100%;
}

.header {
  padding: 20px 0;
}

.wrapper {
  box-sizing: border-box;
  padding: 20px;
}

.content-block {
  padding-bottom: 10px;
  padding-top: 10px;
}

.footer {
  clear: both;
  Margin-top: 10px;
  text-align: center;
  width: 100%;
}
  .footer td,
  .footer p,
  .footer span,
  .footer a {
    color: #9a9ea6;
    font-size: 12px;
    text-align: center;
}


/* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
h1,
h2,
h3,
h4 {
  color: #002147;
  font-family: sans-serif;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  margin-bottom: 30px;
}

h1 {
  font-size: 35px;
  font-weight: 300;
  text-align: center;
  text-transform: capitalize;
}

p,
ul,
ol {
  font-family: sans-serif;
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  margin-bottom: 15px;
}
  p li,
  ul li,
  ol li {
    list-style-position: inside;
    margin-left: 5px;
}

a {
  color: #002147;
  text-decoration: underline;
}
li::marker {
  color: red;
}

/* -------------------------------------
    BUTTONS
------------------------------------- */
.btn {
  box-sizing: border-box;
  width: 100%; }
  .btn > tbody > tr > td {
    padding-bottom: 15px; }
  .btn table {
    min-width: auto;
    width: auto;
}
  .btn table td {
    background-color: #ffffff;
    border-radius: 5px;
    text-align: center;
}
  .btn a {
    background-color: #ffffff;
    border: solid 1px #002147;
    border-radius: 5px;
    box-sizing: border-box;
    color: #002147;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    padding: 12px 25px;
    text-decoration: none;
    text-transform: capitalize;
}

.btn-primary table td {
  background-color: #002147;
}

.btn-primary a {
  background-color: #002147;
  border-color: #002147;
  color: #ffffff;
}

/* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
------------------------------------- */
.last {
  margin-bottom: 0;
}

.first {
  margin-top: 0;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

.align-left {
  text-align: left;
}

.clear {
  clear: both;
}

.mt0 {
  margin-top: 0;
}

.mb0 {
  margin-bottom: 0;
}

.preheader {
  color: transparent;
  display: none;
  height: 0;
  max-height: 0;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  mso-hide: all;
  visibility: hidden;
  width: 0;
}

.powered-by a {
  text-decoration: none;
}

hr {
  border: 0;
  border-bottom: 1px solid #f6f6f6;
  Margin: 20px 0;
}

/* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
@media only screen and (max-width: 620px) {
  table[class=body] h1 {
    font-size: 28px !important;
    margin-bottom: 10px !important;
  }
  table[class=body] p,
  table[class=body] ul,
  table[class=body] ol,
  table[class=body] td,
  table[class=body] span,
  table[class=body] a {
    font-size: 16px !important;
  }
  table[class=body] .wrapper,
  table[class=body] .article {
    padding: 10px !important;
  }
  table[class=body] .content {
    padding: 0 !important;
  }
  table[class=body] .container {
    padding: 0 !important;
    width: 100% !important;
  }
  table[class=body] .main {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-right-width: 0 !important;
  }
  table[class=body] .btn table {
    width: 100% !important;
  }
  table[class=body] .btn a {
    width: 100% !important;
  }
  table[class=body] .img-responsive {
    height: auto !important;
    max-width: 100% !important;
    width: auto !important;
  }
}

/* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
------------------------------------- */
@media all {
  .ExternalClass {
    width: 100%;
  }
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
    line-height: 100%;
  }
  .apple-link a {
    color: inherit !important;
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    text-decoration: none !important;
  }
  .btn-primary table td:hover {
    background-color: #002147 !important;
  }
  .btn-primary a:hover {
    background-color: #002147 !important;
    border-color: #002147 !important;
  }
}
          </style>
        </head>
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://postdrop.io">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="40" alt="Postdrop">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">Reset Your Klubiq Password.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p>Hello <strong>{{ username }},</strong></p>
                        <p>
              We received a request to reset the password for your Klubiq account.
              If you did not make this request, please ignore this email.
              Otherwise, you can reset your password by clicking the link below:
            </p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="{{action_link}}" target="_blank">Reset Password</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p>This link will expire in 24 hours for security purposes.</p>
                                <p>If did not request a password reset, you can disregard this email.</p>
                                <p><strong>Thank you,</strong></p>
                                <p>The Klubiq Team.</p>
<hr>
                                 <p><strong>Need help?</strong> If you have any questions please contact us by email at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">{{ copyright }}</span>
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
      </html>
    `,
	subject: 'Reset your Klubiq password',
});

export const inviteOrgUserTemplate = (): EmailTemplate => ({
	text: ` 
      🔑 Unlock Your Klubiq Access – Dive Into Property Management Fun!
            
            Exciting news! Your manager at {{ organization_name }} has invited you 
            to join thier team on the Klubiq. Get ready to streamline your tasks and manage properties with ease. 

            Setting up your account is a breeze and will only take a few seconds. 
            Click the link below to embark on your Klubiq journey.

            {{ action_link }}

            Don't miss out! This invitation expires after {{ expires_after }}. 
            We can’t wait for you to join us and start exploring all the fantastic features KlubIQ has to offer.

            If you have any questions or need assistance, our friendly support team is here to help. 
            Reach out to us at {{ support_email }}.

            Thank you for being a part of Klubiq!

            Best regards,
            The Klubiq Team
    `,
	html: `
    <!DOCTYPE html>
      <html lang="en">
        <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400..600&display=swap" rel="stylesheet"/>
    <title>🔑 Unlock Your Klubiq Access</title>
          <style>
       img {
  border: none;
  -ms-interpolation-mode: bicubic;
  max-width: 100%;
}

body {
  background-color: #eaebed;
  font-family: 'Maven Pro', sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  padding: 0;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

table {
  border-collapse: separate;
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
  min-width: 100%;
  width: 100%; }
  table td {
    font-family: 'Maven Pro', sans-serif;
    font-size: 14px;
    vertical-align: top;
}

/* -------------------------------------
    BODY & CONTAINER
------------------------------------- */

.body {
  background-color: #eaebed;
  color: #002147;
  width: 100%;
}

/* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
.container {
  display: block;
  Margin: 0 auto !important;
  /* makes it centered */
  max-width: 580px;
  padding: 10px;
  width: 580px;
}

/* This should also be a block element, so that it will fill 100% of the .container */
.content {
  box-sizing: border-box;
  display: block;
  Margin: 0 auto;
  max-width: 580px;
  padding: 10px;
}

/* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
.main {
  background: #ffffff;
  border-radius: 3px;
  width: 100%;
}

.header {
  padding: 20px 0;
}

.wrapper {
  box-sizing: border-box;
  padding: 20px;
}

.content-block {
  padding-bottom: 10px;
  padding-top: 10px;
}

.footer {
  clear: both;
  Margin-top: 10px;
  text-align: center;
  width: 100%;
}
  .footer td,
  .footer p,
  .footer span,
  .footer a {
    color: #9a9ea6;
    font-size: 12px;
    text-align: center;
}


/* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
h1,
h2,
h3,
h4 {
  color: #002147;
  font-family: sans-serif;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  margin-bottom: 30px;
}

h1 {
  font-size: 35px;
  font-weight: 300;
  text-align: center;
  text-transform: capitalize;
}

p,
ul,
ol {
  font-family: sans-serif;
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  margin-bottom: 15px;
}
  p li,
  ul li,
  ol li {
    list-style-position: inside;
    margin-left: 5px;
}

a {
  color: #002147;
  text-decoration: underline;
}
li::marker {
  color: red;
}

/* -------------------------------------
    BUTTONS
------------------------------------- */
.btn {
  box-sizing: border-box;
  width: 100%; }
  .btn > tbody > tr > td {
    padding-bottom: 15px; }
  .btn table {
    min-width: auto;
    width: auto;
}
  .btn table td {
    background-color: #ffffff;
    border-radius: 5px;
    text-align: center;
}
  .btn a {
    background-color: #ffffff;
    border: solid 1px #002147;
    border-radius: 5px;
    box-sizing: border-box;
    color: #002147;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    padding: 12px 25px;
    text-decoration: none;
    text-transform: capitalize;
}

.btn-primary table td {
  background-color: #002147;
}

.btn-primary a {
  background-color: #002147;
  border-color: #002147;
  color: #ffffff;
}

/* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
------------------------------------- */
.last {
  margin-bottom: 0;
}

.first {
  margin-top: 0;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

.align-left {
  text-align: left;
}

.clear {
  clear: both;
}

.mt0 {
  margin-top: 0;
}

.mb0 {
  margin-bottom: 0;
}

.preheader {
  color: transparent;
  display: none;
  height: 0;
  max-height: 0;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  mso-hide: all;
  visibility: hidden;
  width: 0;
}

.powered-by a {
  text-decoration: none;
}

hr {
  border: 0;
  border-bottom: 1px solid #f6f6f6;
  Margin: 20px 0;
}

/* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
@media only screen and (max-width: 620px) {
  table[class=body] h1 {
    font-size: 28px !important;
    margin-bottom: 10px !important;
  }
  table[class=body] p,
  table[class=body] ul,
  table[class=body] ol,
  table[class=body] td,
  table[class=body] span,
  table[class=body] a {
    font-size: 16px !important;
  }
  table[class=body] .wrapper,
  table[class=body] .article {
    padding: 10px !important;
  }
  table[class=body] .content {
    padding: 0 !important;
  }
  table[class=body] .container {
    padding: 0 !important;
    width: 100% !important;
  }
  table[class=body] .main {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-right-width: 0 !important;
  }
  table[class=body] .btn table {
    width: 100% !important;
  }
  table[class=body] .btn a {
    width: 100% !important;
  }
  table[class=body] .img-responsive {
    height: auto !important;
    max-width: 100% !important;
    width: auto !important;
  }
}

/* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
------------------------------------- */
@media all {
  .ExternalClass {
    width: 100%;
  }
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
    line-height: 100%;
  }
  .apple-link a {
    color: inherit !important;
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    text-decoration: none !important;
  }
  .btn-primary table td:hover {
    background-color: #002147 !important;
  }
  .btn-primary a:hover {
    background-color: #002147 !important;
    border-color: #002147 !important;
  }
}
          </style>
        </head>
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://postdrop.io">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="40" alt="Postdrop">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">🔑 Unlock Your Klubiq Access.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p>Hello <strong>{{ username }},</strong></p>
                         <p>
              Exciting news! Your manager at {{ organization_name }} has invited you
              to join their team on the Klubiq. Get ready to streamline your tasks and manage properties with ease.
            </p>
                  <p>
              Setting up your account is a breeze and will only take a few seconds.
              Click the button below to embark on your Klubiq journey.
              </p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="{{action_link}}" target="_blank">Accept Invitation ✉️</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                 <p>
                Don't miss out! This invitation expires after {{ expires_after }}.
                We can’t wait for you to join us and start exploring all the fantastic features KlubIQ has to offer.
              </p>
                                <p><strong>Thank you,</strong></p>
                                <p>The Klubiq Team.</p>
<hr>
                                 <p><strong>If you have any questions or need assistance, our friendly support team is here to help at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a></strong></p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">{{ copyright }}</span>
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
      </html>
    `,
	subject: '🔑 Unlock Your Klubiq Access – Dive Into Property Management Fun!',
});
