import { EmailTemplate } from '../types/email.types';
import { emailHtmlHead } from './email-statics';

export const propertyCreatedEmailTemplate = (): EmailTemplate => ({
	html: `  <!DOCTYPE html>
      <html lang="en">
        ${emailHtmlHead('New Property Added')}
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://dev.klubiq.com">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="20" alt="Klubiq">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">New Property Added to Your Organization.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p>We’re excited to inform you that a new property has been successfully added to your organization!</p>
                        <p><strong>Here are the details of the new property:</strong></p>
                        <ul>
                          <li><strong>Property Name:</strong> {{ property_name }}</li>
                          <li><strong>Property Address:</strong> {{ property_address }}</li>
                          <li><strong>Number of Units:</strong> {{ unit_count }}</li>
                        </ul>
                        <p>This new property is now available within your property portfolio. You can start managing its units, leases, and other related tasks directly through Klubiq.</p>                        
                        <p><strong>Next Steps: </strong></p>
                        <ul>
                          <li><strong>Manage Units:</strong> Review or update the details of each unit associated with this property.</li>
                          <li><strong>Assign Leases:</strong> Easily assign or renew leases for your tenants within each unit.</li>
                          <li><strong>Manage Properties:</strong> Review or update the details of each property associated with your organization.</li>
                        </ul>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="{{view_property_link}}" target="_blank">View Property</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td> 
                                 <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p>The Klubiq Team</p>
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
      </html>`,
	subject: 'New Property Added to Your Organization',
});
export const propertyDeletedEmailTemplate = (): EmailTemplate => ({
	html: `  <!DOCTYPE html>
      <html lang="en">
         ${emailHtmlHead('Property Deletion Confirmation')}
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://dev.klubiq.com">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="20" alt="Klubiq">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">Property - <strong>{{property_name}}</strong> Removed from Klubiq.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p>We want to inform you that the property <strong>{{property_name}}</strong> has been successfully removed from your organization’s account in Klubiq.</p>
                        <p><strong>Property Details:</strong></p>
                        <ul>
                          <li><strong>Property Name:</strong> {{ property_name }}</li>
                          <li><strong>Property Address:</strong> {{ property_address }}</li>
                          <li><strong>Deleted By:</strong> {{ deleted_by }}</li>
                           <li><strong>Units:</strong> {{ unit_count }}</li>
                          <li><strong>Deleted Date:</strong> {{ deletion_date }}</li>
                        </ul>
                        <p><strong>What This Means</strong></p>
                        <p>
                          The property and all associated units, leases, and tenants have been removed from the Klubiq platform. 
                          Please note that any related data, including tenant information and documents associated with this property, is no longer accessible within the system.</p>
                        <p><strong>Next Steps: </strong></p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody
                            <tr>
                              <td> 
                                 <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
                                <p>We value your use of Klubiq for property management and are committed to making your experience as seamless as possible.</p>
                                </td>
                            </tr>
                          </tbody>
                        </table>
                        <p>The Klubiq Team</p>
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
      </html>`,
	subject: 'Property Deletion Confirmation.',
});

export const propertyAssignedEmailTemplate = (): EmailTemplate => ({
	html: `  <!DOCTYPE html>
      <html lang="en">
         ${emailHtmlHead('{{property_name}} Has Been Assigned to You')}
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://dev.klubiq.com">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="20" alt="Klubiq">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">{{property_name}} Has Been Assigned to You.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                      <p>Dear {{first_name}},</p>
                        <p>We’re excited to inform you that the property <strong>{{property_name}}</strong> has been assigned to you for management in Klubiq. 
                        You now have full access to oversee and manage this property.</p>
                        <p><strong>Property Details:</strong></p>
                        <ul>
                          <li><strong>Property Name:</strong> {{ property_name }}</li>
                          <li><strong>Location:</strong> {{ property_address }}</li>
                           <li><strong>Assigned By:</strong> {{ assigned_by }}</li>
                          <li><strong>Assignment Date:</strong> {{ event_date }}</li>
                        </ul>
                        <p><strong>What’s Next?</strong></p>
                        <p>As the assigned manager, you have access to manage the following aspects of the property:</p>
                        <ul>
                          <li>Tenant and Lease Management</li>
                          <li>Property Information and Updates</li>
                          <li>Reports and Insights</li>
                        </ul>
                        <p>To get started, log in to your Klubiq account and navigate to the {{ property_name }} section.</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody
                          <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="{{view_property_link}}" target="_blank">Manage Property Now</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td> 
                                 <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
                                <p>We value your use of Klubiq for property management and are committed to making your experience as seamless as possible.</p>
                                </td>
                            </tr>
                          </tbody>
                        </table>
                        <p>The Klubiq Team</p>
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
      </html>`,
	subject: 'A Property Has Been Assigned to You.',
});

export const leaseCreatedEmailTemplate = (): EmailTemplate => ({
	html: `  <!DOCTYPE html>
      <html lang="en">
         ${emailHtmlHead('New Lease Created for {{property_name}}.')}
          <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="header">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="align-center" width="100%">
                  <a href="https://dev.klubiq.com">
                  <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" height="20" alt="Klubiq">
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">New Lease Created for {{property_name}}.</span>
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                      <p>Dear {{first_name}},</p>
                        <p>We’re excited to inform you that a new lease has been successfully created in Klubiq for <strong>{{property_name}}</strong>.</p>
                        <p><strong>Lease Details:</strong></p>
                        <ul>
                          <li><strong>Property Name:</strong> {{ property_name }}</li>
                          <li><strong>Unit:</strong> {{ unit_number }}</li>
                          <li><strong>Tenant(s):</strong> {{ tenants }}</li>
                          <li><strong>Start Date:</strong> {{ start_date }}</li>
                          <li><strong>End Date:</strong> {{ end_date }}</li>
                          <li><strong>Payment Frequency:</strong> {{ payment_frequency }}</li>
                          <li><strong>Rent Amount:</strong> {{ rent_amount }}</li>
                        </ul>
                        <p><strong>What’s Next?</strong></p>
                        <ol type="1">
                          <li>Payment Schedule: The first payment is scheduled for {{first_payment_date}}. You can view the payment breakdown and history in the lease section.</li>
                          <li>Lease Management: As the lease progresses, you can manage updates, and communication directly through the Klubiq platform.</li>
                        </ol>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody
                          <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="{{view_lease_details_link}}" target="_blank">View Lease Details</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td> 
                                 <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href="mailto:{{ support_email }}" style="color: #002147; background: none; border: 0; padding: 0; text-decoration: none;">{{ support_email }}</a> or visit our website for more information.</p>
                                <p>We value your use of Klubiq for property management and are committed to making your experience as seamless as possible.</p>
                                </td>
                            </tr>
                          </tbody>
                        </table>
                        <p>The Klubiq Team</p>
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
      </html>`,
	subject: 'New Lease Created for {{ property_name }}.',
});
