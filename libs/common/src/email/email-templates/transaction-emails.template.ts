import { EmailTemplate } from '../types/email.types';
import { emailHtmlHead } from './email-statics';

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
      ${emailHtmlHead('Klubiq Email Verification')}
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
      ${emailHtmlHead('Reset Your Klubiq Password')}
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
      ${emailHtmlHead('🔑 Unlock Your Klubiq Access')}
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
