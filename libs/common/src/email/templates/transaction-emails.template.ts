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
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <meta http-equiv="ScreenOrientation" content="autoRotate:disabled">
          <meta name="theme-color" content="#002147" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400..600&display=swap" rel="stylesheet"/>
          <title>Klubiq Email Verification</title>
          <style>
            .container {
              width: 90%;
              margin: 0 auto;
            }
            p,
            button {
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 150%;
            }
          </style>
        </head>
        <body style="padding-inline: 3em; color: #002147;">
          <div class="container" style="padding: 30px 40px; border-radius: 8px;">
            <div style="display: flex; justify-content: center; align-items: center; width: fit-content; gap: 8px; margin-block: 50px; margin-bottom: 24px;">
              <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be52a3b-a911-46f1-8a4f-c19fa4f9c73b.png" width="35" height="35" alt="klubiq logo" />
              <div style="color:#002147; margin-left: 8px; font-size: 24px;">Klubiq</div>
            </div>
            <h1 style="font-size: 20px; font-weight: 600; padding-bottom: 10px"> Verify your email address</h1>
            <p>Hello <strong>{{ username }},</strong></p>
            <p>
              Thanks for registering with Klubiq! To complete your registration and ensure your email address is correct, 
              please verify your email by clicking on the button below:
            </p>
            <div style="margin-top: 20px; margin-bottom: 20px;">
            <a href="{{action_link}}" style="text-decoration: none; color: #FFFFFF;">
              <button
                style="
                  background-color: #002147;
                  color: #FFFFFF;
                  border-radius: 4px;
                  padding: 8px 32px;
                  font-weight: 500;
                  font-size: 16px;
                  outline: none;
                  border: none;
                  cursor: pointer;
                ">
                Verify Email Address
              </button>
            </a>
            </div>
            <div style="margin-bottom: 30px;">
              <p>This link will expire in an hour. If you did not create an account with Klubiq, please disregard this message.</p>
              <p>Welcome to Klubiq, and we look forward to having you with us!</p>
              <p><strong>Warm regards,</strong></p>
              <p>The Klubiq Team.</p>
            </div>
            <div style="padding-top: 20px; border-top: 1px solid #eaeaea;"></div>
            <div style="padding-bottom: 20px;"> 
                <p><strong>Need help?</strong> If you have any questions, please contact us by email at {{support_email}}</p>
            </div>
          </div>
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
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <meta http-equiv="ScreenOrientation" content="autoRotate:disabled">
          <meta name="theme-color" content="#002147" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400..600&display=swap" rel="stylesheet"/>
          <title>Reset Your Klubiq Password</title>
          <style>
            .container {
              width: 90%;
              margin: 0 auto;
            }
            p,
            button {
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 150%;
            }
          </style>
        </head>
        <body style="padding-inline: 3em; color: #002147;">
          <div class="container" style="padding: 30px 40px; border-radius: 8px;">
            <div style="display: flex; justify-content: center; align-items: center; width: fit-content; gap: 8px; margin-block: 50px; margin-bottom: 24px;">
              <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be52a3b-a911-46f1-8a4f-c19fa4f9c73b.png" width="35" height="35" alt="klubiq logo" />
              <div style="color:#002147; margin-left: 8px; font-size: 24px;">Klubiq</div>
            </div>
            <p>Dear <strong>{{ username }},</strong></p>
            <p>
              We received a request to reset the password for your Klubiq account. 
              If you did not make this request, please ignore this email. 
              Otherwise, you can reset your password by clicking the link below:
            </p>
            <div style="margin-top: 20px; margin-bottom: 20px;">
            <a
              href="{{action_link}}"
              style="
                text-decoration: none;
                color: #FFFFFF;
              "
            >
              <button
                style="
                  background-color: #002147;
                  color: #FFFFFF;
                  border-radius: 4px;
                  padding: 8px 32px;
                  font-weight: 500;
                  font-size: 16px;
                  outline: none;
                  border: none;
                  cursor: pointer;
                "
              >
                Reset Password
              </button>
            </a>
            </div>

            <div style="margin-bottom: 30px;">
              <p>This link will expire in 24 hours for security purposes.</p>
              <p>If did not request a password reset, you can disregard this email.</p>
              <p><strong>Thank you,</strong></p>
              <p>The Klubiq Team.</p>
            </div>

            <div style="padding-top: 20px; border-top: 1px solid #eaeaea;"></div>
            <div style="padding-bottom: 20px;"> 
                <p><strong>Need help?</strong> If you have any questions, please contact us by email at {{support_email}}</p>
            </div>
            
          </div>
        </body>
      </html>
    `,
	subject: 'Reset your Klubiq password',
});
