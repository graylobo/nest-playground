import * as nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export const sendEmail = async (email, subject, payload, template) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), 'utf8');
    const compiledTemplate = handlebars.compile(source);

    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    return new Promise((resolve, reject) => {
      transporter.sendMail(options(), (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    throw error;
  }
};
