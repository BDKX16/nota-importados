const express = require("express");
const router = express.Router();
const emailService = require("../infraestructure/services/emailService");
const { isValidEmail } = require("../infraestructure/services/emailUtils");

/**
 * POST /api/contact
 * Endpoint público para enviar consultas de contacto
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validaciones básicas
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "Todos los campos obligatorios deben ser completados",
        required: ["name", "email", "subject", "message"],
      });
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "El formato del email no es válido",
      });
    }

    // Limpiar y sanitizar datos
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
    };

    // Validar longitud de campos
    if (sanitizedData.name.length > 100) {
      return res.status(400).json({
        error: "El nombre no puede tener más de 100 caracteres",
      });
    }

    if (sanitizedData.subject.length > 200) {
      return res.status(400).json({
        error: "El asunto no puede tener más de 200 caracteres",
      });
    }

    if (sanitizedData.message.length > 2000) {
      return res.status(400).json({
        error: "El mensaje no puede tener más de 2000 caracteres",
      });
    }

    // Crear el contenido del email para administradores
    const adminEmailContent = createAdminEmailTemplate(sanitizedData);

    // Email para administradores
    const adminEmail = process.env.ADMIN_EMAIL || "notaimportados@gmail.com";

    await emailService.sendEmail(
      adminEmail,
      `[CONTACTO] ${sanitizedData.subject}`,
      adminEmailContent,
      sanitizedData
    );

    // Email de confirmación al usuario
    const userEmailContent = createUserConfirmationTemplate(sanitizedData);

    await emailService.sendEmail(
      sanitizedData.email,
      "Hemos recibido tu consulta - Nota Importados",
      userEmailContent,
      sanitizedData
    );

    console.log(
      `✅ Consulta de contacto enviada desde: ${sanitizedData.email}`
    );

    res.status(200).json({
      success: true,
      message:
        "Tu consulta ha sido enviada correctamente. Te responderemos pronto.",
    });
  } catch (error) {
    console.error("❌ Error en endpoint de contacto:", error);
    res.status(500).json({
      error: "Error interno del servidor. Inténtalo de nuevo más tarde.",
    });
  }
});

/**
 * Plantilla de email para administradores
 */
function createAdminEmailTemplate(data) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Nueva Consulta de Contacto</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Formulario de contacto del sitio web</p>
      </div>
      
      <div style="background: white; padding: 30px; border-left: 4px solid #667eea;">
        <h2 style="color: #333; margin-top: 0; font-size: 20px;">Detalles de la consulta</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            <strong>Nombre del contacto</strong>
          </p>
          <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${
            data.name
          }</p>
          
          <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            <strong>Email</strong>
          </p>
          <p style="margin: 0 0 20px; color: #333; font-size: 16px;">
            <a href="mailto:${
              data.email
            }" style="color: #667eea; text-decoration: none;">${data.email}</a>
          </p>
          
          ${
            data.phone
              ? `
          <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            <strong>Teléfono</strong>
          </p>
          <p style="margin: 0 0 20px; color: #333; font-size: 16px;">
            <a href="tel:${data.phone}" style="color: #667eea; text-decoration: none;">${data.phone}</a>
          </p>
          `
              : ""
          }
          
          <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            <strong>Asunto</strong>
          </p>
          <p style="margin: 0 0 20px; color: #333; font-size: 16px;">${
            data.subject
          }</p>
        </div>
        
        <div style="background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            <strong>Mensaje</strong>
          </p>
          <div style="color: #333; font-size: 16px; line-height: 1.6;">
            ${data.message.replace(/\n/g, "<br>")}
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(
    data.subject
  )}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Responder por Email
          </a>
          ${
            data.phone
              ? `
          <a href="https://wa.me/${data.phone.replace(/[^\d]/g, "")}" 
             style="background: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-left: 10px;">
            Contactar por WhatsApp
          </a>
          `
              : ""
          }
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">Esta consulta fue enviada desde el formulario de contacto de <strong>Nota Importados</strong></p>
        <p style="margin: 5px 0 0;">Fecha: ${new Date().toLocaleString(
          "es-AR",
          {
            timeZone: "America/Argentina/Buenos_Aires",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}</p>
      </div>
    </div>
  `;
}

/**
 * Plantilla de confirmación para el usuario
 */
function createUserConfirmationTemplate(data) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">¡Gracias por contactarnos!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Hemos recibido tu consulta</p>
      </div>
      
      <div style="background: white; padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Hola ${data.name},</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Hemos recibido tu consulta sobre "<strong>${
            data.subject
          }</strong>" y queremos agradecerte por ponerte en contacto con nosotros.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">Resumen de tu consulta:</h3>
          <p style="margin: 0 0 10px; color: #666;"><strong>Asunto:</strong> ${
            data.subject
          }</p>
          <p style="margin: 0 0 10px; color: #666;"><strong>Email:</strong> ${
            data.email
          }</p>
          ${
            data.phone
              ? `<p style="margin: 0 0 10px; color: #666;"><strong>Teléfono:</strong> ${data.phone}</p>`
              : ""
          }
          <p style="margin: 10px 0 0; color: #666;"><strong>Mensaje:</strong></p>
          <p style="margin: 5px 0 0; color: #333; font-style: italic; background: white; padding: 10px; border-radius: 4px;">
            "${data.message}"
          </p>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Nuestro equipo revisará tu consulta y te responderemos dentro de las próximas <strong>24 horas</strong> 
          en el email <strong>${data.email}</strong>.
        </p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbdefb;">
          <h3 style="margin: 0 0 15px; color: #1976d2; font-size: 16px;">Mientras tanto, también puedes:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            <li style="margin-bottom: 8px;">Contactarnos por WhatsApp: <a href="https://wa.me/5491127060002" style="color: #25D366; text-decoration: none;">+54 9 11 27060002</a></li>
            <li style="margin-bottom: 8px;">Llamarnos directamente: <a href="tel:+5491127060002" style="color: #667eea; text-decoration: none;">+54 9 11 27060002</a></li>
            <li style="margin-bottom: 8px;">Explorar nuestros productos en el sitio web</li>
          </ul>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          ¡Gracias por elegirnos! En <strong>Nota Importados</strong> estamos aquí para ayudarte.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;"><strong>Nota Importados</strong> - Perfumes importados de calidad</p>
        <p style="margin: 5px 0 0;">Este es un email automático, por favor no responder a esta dirección.</p>
      </div>
    </div>
  `;
}

module.exports = router;
