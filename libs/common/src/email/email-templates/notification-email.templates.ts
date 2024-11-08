import { EmailTemplate } from '../types/email.types';

export const propertyCreatedEmailTemplate = (): EmailTemplate => ({
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
          <title>New Property Added to Your Organization</title>
          <style>
            body {
              font-family: 'Maven Pro', sans-serif;
              background-color: #f7f7f7;
            }
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
          <div class="container" style="padding: 30px 10px; border-radius: 8px;">
            <div style="display: flex; justify-content: center; align-items: center; width: fit-content; gap: 8px; margin-block: 50px; margin-bottom: 24px;">
              <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be52a3b-a911-46f1-8a4f-c19fa4f9c73b.png" width="35" height="35" alt="klubiq logo" />
              <div style="color:#002147; margin-left: 8px; font-size: 24px;">Klubiq</div>
            </div>
            <h1 style="font-size: 20px; font-weight: 600; padding-bottom: 10px">New Property Added to Your Organization</h1>
            <p>Hello <strong>{{ username }},</strong></p>
            <p>We’re excited to inform you that a new property has been successfully added to your organization!</p>
            <p><strong>Here are the details of the new property:</strong></p>
            <ul>
                <li><strong>Property Name:</strong> {{ property_name }}</li>
                <li><strong>Property Address:</strong> {{ property_address }}</li>
                <li><strong>Number of Units:</strong> {{ unit_count }}</li>
            </ul>
            <p>This new property is now available within your organization’s dashboard. You can start managing its units, leases, and other related tasks directly through Klubiq.</p>
            <p><strong>Next Steps: </strong></p>
            <ul>
                <li><strong>Manage Units:</strong> Review or update the details of each unit associated with this property.</li>
                <li><strong>Assign Leases:</strong> Easily assign or renew leases for your tenants within each unit.</li>
                <li><strong>Manage Properties:</strong> Review or update the details of each property associated with your organization.</li>
            </ul>
            <p><a href="{{view_property_link}}" style="color: #002147; text-decoration: none;">View Property</a></p>
            <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href="mailto:{{ support_email }}" style="color: #002147; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
            <p>Thank you for choosing Klubiq to streamline your property management!</p>
            <p>Best Regards,</p>
            <p>The Klubiq Team</p>
          </div>
        </body>
      </html>
    `,
	subject: 'New Property Added to Your Organization',
});
