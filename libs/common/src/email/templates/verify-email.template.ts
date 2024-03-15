export const verifyEmailTemplate = (verificationLink: string) => ({
	text: ` 
  Verify your Email
            
              To complete the registration process, we need to verify your email
              address. Kindly click the button below to verify your email address.
           
            If you did not initiate this request, kindly ignore this email.

            Warm regards,

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
          <title>Klubiq</title>
          <style>
            .container {
              width: 95%;
              max-width: 500px;
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
        <body style="padding-inline: 3em; color: #222; font-family: Inter">
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
              <img src="" alt="klubiq logo" />
            </div>
            <h2 style="font-size: 24px; font-weight: 700; padding-bottom: 10px">
              Verify your Email
            </h2>
            <p>
              To complete the registration process, we need to verify your email
              address. Kindly click the button below to verify your email address.
            </p>
            <p>If you did not initiate this request, kindly ignore this email.</p>
            <div
              style="
                display: flex;
                flex-direction: column;
                gap: 3px;
                margin-bottom: 30px;
              "
            >
              <span style="">Warm Regards,</span>
              <br />
              <span>The Klubiq Team.</span>
            </div>
            <a
              href="${verificationLink}"
              style="
                text-decoration: none;
                color: white;
              "
            >
              <button
                style="
                  background-color: #2f8132;
                  color: white;
                  border-radius: 8px;
                  padding: 10px 15px;
                  outline: none;
                  border: none;
                  cursor: pointer;
                  font-weight: 500;
                "
              >
                Verify Email
              </button>
            </a>
          </div>
        </body>
      </html>
    `,
});
