const nodemailer = require('nodemailer')

class EmailService {
  constructor() {
    this.defaultTransporter = null
    this.adminTransporters = new Map()
    this.initDefaultTransporter()
  }

  initDefaultTransporter() {
    this.defaultTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER || '', 
        pass: process.env.SMTP_PASS || ''  
      }
    })
  }

  createAdminTransporter(adminEmailConfig) {
    if (!adminEmailConfig || !adminEmailConfig.email || !adminEmailConfig.smtp_password) {
      return null
    }

    try {
      return nodemailer.createTransport({
        host: adminEmailConfig.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: adminEmailConfig.smtp_port || process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: adminEmailConfig.email,
          pass: adminEmailConfig.smtp_password
        }
      })
    } catch (error) {
      console.error('Failed to create admin transporter:', error)
      return null
    }
  }

  getTransporter(adminEmailConfig = null) {
    if (adminEmailConfig) {
      const adminKey = adminEmailConfig.email
      if (!this.adminTransporters.has(adminKey)) {
        const adminTransporter = this.createAdminTransporter(adminEmailConfig)
        if (adminTransporter) {
          this.adminTransporters.set(adminKey, adminTransporter)
        }
      }
      
      const adminTransporter = this.adminTransporters.get(adminKey)
      if (adminTransporter) {
        return { transporter: adminTransporter, fromEmail: adminEmailConfig.email }
      }
    }

    const hasSystemSMTP = process.env.SMTP_USER && process.env.SMTP_PASS && 
                         process.env.SMTP_USER.trim() !== '' && 
                         process.env.SMTP_PASS.trim() !== ''

    if (!hasSystemSMTP) {
      console.log('No SMTP configuration available - emails will be simulated')
      return null
    }

    return { 
      transporter: this.defaultTransporter, 
      fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER 
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null, adminEmailConfig = null, cc = null, bcc = null, attachments = null) {
    try {
      const transporterResult = this.getTransporter(adminEmailConfig)
      if (!transporterResult || !transporterResult.transporter) {
        console.log('=== EMAIL SIMULATION (No SMTP configured) ===')
        console.log('To:', to)
        if (cc) console.log('CC:', cc)
        if (bcc) console.log('BCC:', bcc)
        console.log('Subject:', subject)
        console.log('HTML Content:', htmlContent)
        if (attachments && attachments.length > 0) {
          console.log('Attachments:', attachments.map(a => a.filename).join(', '))
        }
        console.log('=== END EMAIL SIMULATION ===')
        return { 
          success: true, 
          messageId: 'simulated-' + Date.now(),
          simulated: true,
          message: 'Email simulated - no SMTP configuration available'
        }
      }
      
      const { transporter, fromEmail } = transporterResult
      
      const mailOptions = {
        from: fromEmail,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent)
      }

      if (cc && cc.trim()) {
        mailOptions.cc = cc.trim()
      }

      if (bcc && bcc.trim()) {
        mailOptions.bcc = bcc.trim()
      }

      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        mailOptions.attachments = attachments
      }

      const result = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Error sending email:', error)
      console.log('=== EMAIL SIMULATION (Send failed) ===')
      console.log('To:', to)
      if (cc) console.log('CC:', cc)
      if (bcc) console.log('BCC:', bcc)
      console.log('Subject:', subject)
      console.log('Error:', error.message)
      console.log('=== END EMAIL SIMULATION ===')
      
      return { 
        success: true, 
        error: error.message,
        simulated: true,
        message: 'Email simulated due to send failure'
      }
    }
  }

  async sendSuspensionNotification(userEmail, userName, suspendedBy, suspensionReason, adminEmailConfig = null) {
    const subject = 'Account Suspended - PG Micro ISOMS'
    const adminEmail = adminEmailConfig?.email || process.env.SMTP_FROM || 'admin@pgmicro.com'
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Account Suspended</h1>
            <div style="width: 60px; height: 4px; background-color: #dc2626; margin: 10px auto;"></div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Dear ${userName},</h2>
            <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
              Your PG Micro ISOMS account has been temporarily suspended by an administrator.
            </p>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">Suspension Details</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Suspended by:</strong> ${suspendedBy}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Reason:</strong> ${suspensionReason}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div style="margin: 25px 0;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">What This Means</h3>
            <ul style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
              <li>You cannot access the PG Micro ISOMS system until the suspension is lifted</li>
              <li>All your data and settings remain safe and unchanged</li>
              <li>You will be notified when your account is reactivated</li>
            </ul>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 25px 0;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Need Help or Have Questions?</h3>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 15px;">
              If you believe this suspension was made in error or have questions about the reason, 
              please contact your system administrator immediately.
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #d1d5db;">
              <p style="margin: 5px 0; color: #374151;"><strong>Administrator Email:</strong> 
                <a href="mailto:${adminEmail}" style="color: #2563eb; text-decoration: none;">${adminEmail}</a>
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                Please include your account email (${userEmail}) when contacting support.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              This is an automated message from PG Micro ISOMS. Please do not reply to this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2025 PG Micro ISOMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `

    return await this.sendEmail(userEmail, subject, htmlContent, null, adminEmailConfig)
  }

  async sendAccountReactivationNotification(userEmail, userName, reactivatedBy, adminEmailConfig = null) {
    const subject = 'Account Reactivated - PG Micro ISOMS'
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 28px;">Account Reactivated</h1>
            <div style="width: 60px; height: 4px; background-color: #059669; margin: 10px auto;"></div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Dear ${userName},</h2>
            <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
              Great news! Your PG Micro ISOMS account has been reactivated and you can now access the system again.
            </p>
          </div>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">Reactivation Details</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Reactivated by:</strong> ${reactivatedBy}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5176'}" 
               style="display: inline-block; background-color: #059669; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Access PG Micro ISOMS
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              This is an automated message from PG Micro ISOMS. Please do not reply to this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2025 PG Micro ISOMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `

    return await this.sendEmail(userEmail, subject, htmlContent, null, adminEmailConfig)
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
  }
}

module.exports = new EmailService()