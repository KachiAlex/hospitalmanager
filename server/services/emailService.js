/**
 * Email Service Module
 * Handles welcome emails and other patient registration communications
 */

const nodemailer = require('nodemailer');

// Email templates
const emailTemplates = {
  welcomeEmail: (patientName, recordNumber, hospitalName) => ({
    subject: `Welcome to ${hospitalName} - Your Patient Record Number`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e5a96; color: white; padding: 20px; text-align: center;">
          <h1>${hospitalName}</h1>
          <p>Patient Registration Confirmation</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Dear ${patientName},</p>
          
          <p>Welcome to ${hospitalName}! We're pleased to have you as a patient.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #1e5a96; margin: 20px 0;">
            <p><strong>Your Patient Record Number:</strong></p>
            <p style="font-size: 18px; font-weight: bold; color: #1e5a96;">${recordNumber}</p>
            <p style="font-size: 12px; color: #666;">Please keep this number for your records. You'll need it for all future appointments and communications.</p>
          </div>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Schedule your first appointment by calling our reception desk</li>
            <li>Bring your insurance information to your first visit</li>
            <li>Arrive 15 minutes early for your appointment</li>
            <li>Complete any required medical history forms</li>
          </ul>
          
          <h3>Contact Information:</h3>
          <p>
            <strong>Phone:</strong> (555) 123-4567<br>
            <strong>Email:</strong> info@${hospitalName.toLowerCase().replace(/\s+/g, '')}.com<br>
            <strong>Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM
          </p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          <strong>${hospitalName} Patient Services Team</strong></p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${hospitalName}. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Welcome to ${hospitalName}!

Dear ${patientName},

Welcome to ${hospitalName}! We're pleased to have you as a patient.

Your Patient Record Number: ${recordNumber}
Please keep this number for your records. You'll need it for all future appointments and communications.

Next Steps:
- Schedule your first appointment by calling our reception desk
- Bring your insurance information to your first visit
- Arrive 15 minutes early for your appointment
- Complete any required medical history forms

Contact Information:
Phone: (555) 123-4567
Email: info@${hospitalName.toLowerCase().replace(/\s+/g, '')}.com
Hours: Monday - Friday, 8:00 AM - 6:00 PM

If you have any questions, please don't hesitate to contact us.

Best regards,
${hospitalName} Patient Services Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${hospitalName}. All rights reserved.
    `
  })
};

/**
 * Email Service Class
 * Manages email delivery with proper error handling
 */
class EmailService {
  constructor(config = {}) {
    this.config = {
      host: config.host || process.env.EMAIL_HOST || 'localhost',
      port: config.port || process.env.EMAIL_PORT || 1025,
      secure: config.secure || process.env.EMAIL_SECURE === 'true' || false,
      auth: config.auth || (process.env.EMAIL_USER ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      } : null),
      from: config.from || process.env.EMAIL_FROM || 'noreply@hospital.local'
    };

    this.transporter = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the email transporter
   */
  async initialize() {
    try {
      this.transporter = nodemailer.createTransport(this.config);
      
      // Verify connection
      await this.transporter.verify();
      this.isInitialized = true;
      console.log('Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Send welcome email to patient
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.patientName - Patient's full name
   * @param {string} options.recordNumber - Patient's record number
   * @param {string} options.hospitalName - Hospital name
   * @returns {Promise<Object>} Email send result
   */
  async sendWelcomeEmail(options) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      throw new Error('Email service is not available');
    }

    const { to, patientName, recordNumber, hospitalName = 'CareWell Hospital' } = options;

    if (!to || !patientName || !recordNumber) {
      throw new Error('Missing required email parameters: to, patientName, recordNumber');
    }

    try {
      const template = emailTemplates.welcomeEmail(patientName, recordNumber, hospitalName);
      
      const mailOptions = {
        from: this.config.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        recipient: to
      };
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  /**
   * Send generic email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Email send result
   */
  async sendEmail(options) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      throw new Error('Email service is not available');
    }

    const { to, subject, html, text } = options;

    if (!to || !subject) {
      throw new Error('Missing required email parameters: to, subject');
    }

    try {
      const mailOptions = {
        from: this.config.from,
        to,
        subject,
        html: html || text,
        text: text || html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        recipient: to
      };
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  /**
   * Check if email service is available
   */
  isAvailable() {
    return this.isInitialized;
  }
}

// Create singleton instance
let emailServiceInstance = null;

/**
 * Get or create email service instance
 */
function getEmailService(config) {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService(config);
  }
  return emailServiceInstance;
}

module.exports = {
  EmailService,
  getEmailService,
  emailTemplates
};
