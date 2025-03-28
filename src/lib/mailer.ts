import nodemailer from 'nodemailer';

// Apenas para debug:
console.log(" GMAIL_USER:", process.env.GMAIL_USER);
console.log(" GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: `"SkyFly Organização" <${process.env.GMAIL_USER}>`, // usa mesmo user como remetente
    to,
    subject,
    html,
  });
};
