export const verifyEmailTemplate = () => ({
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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter&family=Ubuntu:wght@300;400&display=swap"
            rel="stylesheet"
          />
          <title>Klubiq Email Verification</title>
          <style>
            .container {
              width: 95%;
              max-width: 700px;
              margin: 0 auto;
            }
            p,
            button {
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 150%;
              margin-bottom: 1.1em;
            }
          </style>
        </head>
        <body style="padding-inline: 3em; color: #000; font-family: 'Google Sans'">
          <div class="container">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                width: fit-content;
                gap: 8px;
                margin-block: 50px;
              "
            >
              <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be52a3c-7c0d-46fe-8485-7fd6305053bb.png" width="50" height="50" alt="klubiq logo" />
            </div>
            <h2 style="font-size: 24px; font-weight: 700; padding-bottom: 10px">
              Verify Your Email Address
            </h2>
            <p>Hello <strong>{{ username }}!</strong></p>
            <p>
              Thanks for joining Klubiq. To finish you registration, please clicking the button below to verify your account.
            </p>
            <p>If you did not initiate this request, kindly ignore this email.</p>
            <div
            style="
                margin-top: 15px;
              ">
            <a
              href="{{verification_link}}"
              style="
                text-decoration: none;
                color: white;
              "
            >
              <button
                style="
                  background-color: #005CFF;
                  color: white;
                  border-radius: 8px;
                  padding: 10px 15px;
                  outline: none;
                  border: none;
                  cursor: pointer;
                  font-weight: 500;
                "
              >
                Verify email address
              </button>
            </a>
            </div>
            <div
              style="
                margin-bottom: 30px;
              "
            >
              <p><strong>Thank you,</strong></p>
              <p>The Klubiq Team.</p>
            </div>
            <div 
            style="
                padding-top: 20px;
                border-top: 1px solid #eaeaea;
              "></div>
            <div
            style="
                padding-bottom: 20px;
              "> 
              <p><strong>Need help?</strong></p>
              <p>If you have any questions, please contact us by email at {{support_email}}.</p>
              </div>
            
          </div>
        </body>
      </html>
    `,
});
