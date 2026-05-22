import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formType, data } = req.body;

    if (!data.name || !data.email || !data.phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields"
      });
    }

    let confirmationMessage = "";
    let emailSubject = "";
    let emailBody = "";

    if (formType === "visit_form" || formType === "appointment_form") {
      confirmationMessage = `Thank you, ${data.name}! Your request has been received. Our CMO, Harshdeep Singh Saini, will contact you within 24 hours at ${data.phone}.`;
      emailSubject = `New ${formType === "visit_form" ? "Factory Visit" : "Appointment"} Request from ${data.name}`;
      emailBody = `New Request:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nCompany: ${data.company || 'N/A'}\nDate: ${data.date || 'N/A'}\n\nTimestamp: ${new Date().toLocaleString()}`;
    } else if (formType === "quotation_form") {
      confirmationMessage = `Thank you, ${data.name}! Your quotation request has been received. Mr. Ajeet Singh Saini will contact you within 24 hours.`;
      emailSubject = `New Quotation Request from ${data.name}`;
      emailBody = `New Quotation Request:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nCompany: ${data.company || 'N/A'}\n\nTimestamp: ${new Date().toLocaleString()}`;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.DAD_EMAIL,
      subject: emailSubject,
      text: emailBody
    });

    res.json({
      success: true,
      message: confirmationMessage
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting form"
    });
  }
}
