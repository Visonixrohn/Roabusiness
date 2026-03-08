/**
 * ============================================================
 *  GOOGLE APPS SCRIPT – Envío de factura/confirmación PayPal
 *  ROA Business Directory
 * ============================================================
 *
 *  INSTRUCCIONES DE CONFIGURACIÓN:
 *  1. Ve a https://script.google.com y crea un proyecto nuevo.
 *  2. Pega todo este código reemplazando el contenido existente.
 *  3. En el menú "Proyecto" → "Propiedades del proyecto",
 *     agrega las siguientes propiedades de script:
 *       SUPABASE_URL  = https://olzsyrwtrabmcfgmyedl.supabase.co
 *       SUPABASE_KEY  = <tu service_role key de Supabase>
 *       FROM_EMAIL    = tu_correo@gmail.com  (el mismo de la cuenta GAS)
 *       FROM_NAME     = ROA Business
 *  4. Guarda y haz clic en "Implementar" → "Nueva implementación"
 *       Tipo: Aplicación web
 *       Ejecutar como: Yo
 *       Quién tiene acceso: Cualquier usuario
 *  5. Copia la URL que aparece y pégala en PublicBusinessRegistrationPage.tsx
 *     en la constante GAS_WEBHOOK.
 * ============================================================
 */

// ──────────────────────────────────────────────────────────────
//  Punto de entrada HTTP POST
// ──────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    var businessId = body.business_id || "";
    var paypalOrderId = body.paypal_order_id || "";
    var payerName = body.payer_name || "";
    var payerEmail = body.payer_email || "";
    var businessName = body.business_name || "";
    var planMonths = body.plan_months || 0;
    var planPrice = body.plan_price || 0;
    var toEmail = body.email || payerEmail || "";

    if (!toEmail || !businessId) {
      return jsonResponse({ ok: false, error: "Faltan campos obligatorios" });
    }

    // Obtener datos del negocio desde Supabase
    var business = fetchBusiness(businessId);
    if (!business) {
      return jsonResponse({ ok: false, error: "Negocio no encontrado" });
    }

    // Enviar correo
    sendInvoiceEmail(
      toEmail,
      business,
      paypalOrderId,
      payerName,
      planMonths,
      planPrice,
    );

    return jsonResponse({ ok: true, message: "Correo enviado a " + toEmail });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ──────────────────────────────────────────────────────────────
//  Consultar negocio en Supabase (usando service_role key)
// ──────────────────────────────────────────────────────────────
function fetchBusiness(businessId) {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty("SUPABASE_URL");
  var key = props.getProperty("SUPABASE_KEY");

  var endpoint =
    url +
    "/rest/v1/businesses?id=eq." +
    businessId +
    "&select=id,name,departamento,municipio,colonia,description," +
    "subscription_months,subscription_started_at,pago,paypal_order_id," +
    "paypal_payer_name,created_at,contact";

  var response = UrlFetchApp.fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
  });

  var data = JSON.parse(response.getContentText());
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// ──────────────────────────────────────────────────────────────
//  Calcular fecha de vencimiento
// ──────────────────────────────────────────────────────────────
function calcExpiry(startedAt, months) {
  var d = startedAt ? new Date(startedAt) : new Date();
  d.setMonth(d.getMonth() + parseInt(months, 10));
  return Utilities.formatDate(d, "America/Tegucigalpa", "dd/MM/yyyy");
}

// ──────────────────────────────────────────────────────────────
//  Construir y enviar el correo de factura
// ──────────────────────────────────────────────────────────────
function sendInvoiceEmail(
  toEmail,
  business,
  paypalOrderId,
  payerName,
  planMonths,
  planPriceLps,
) {
  var props = PropertiesService.getScriptProperties();
  var fromName = props.getProperty("FROM_NAME") || "ROA Business";

  var startedAt = business.subscription_started_at || new Date().toISOString();
  var expiryDate = calcExpiry(startedAt, planMonths);
  var startDate = Utilities.formatDate(
    new Date(startedAt),
    "America/Tegucigalpa",
    "dd/MM/yyyy",
  );

  var planLabel = planMonths === 1 ? "1 mes" : planMonths + " meses";

  var planPriceUsd = (planPriceLps * 0.04).toFixed(2);
  var location = [business.colonia, business.municipio, business.departamento]
    .filter(Boolean)
    .join(", ");

  var invoiceNum =
    "ROA-" +
    new Date().getFullYear() +
    "-" +
    String(business.id || "")
      .slice(0, 8)
      .toUpperCase();

  var subject =
    "✅ Confirmación de registro – " + business.name + " | ROA Business";

  var html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Factura de Registro</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a3a6b;padding:32px 0;">
    <tr>
      <td align="center">
        <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
          ROA Business
        </h1>
        <p style="color:#a8c4e8;margin:6px 0 0;font-size:13px;">
          Directorio de Negocios – Islas de la Bahía, Honduras
        </p>
      </td>
    </tr>
  </table>

  <!-- Badge de confirmación -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#22c55e;padding:14px 0;">
    <tr>
      <td align="center">
        <p style="color:#ffffff;margin:0;font-size:15px;font-weight:700;">
          ✅ &nbsp;¡Pago confirmado! Tu negocio está en proceso de revisión.
        </p>
      </td>
    </tr>
  </table>

  <!-- Contenedor principal -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;max-width:100%;">

          <!-- Intro -->
          <tr>
            <td style="padding:32px 36px 0;">
              <p style="margin:0;font-size:17px;font-weight:700;color:#111827;">
                Hola, ${payerName || business.name}
              </p>
              <p style="margin:10px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                Gracias por registrar tu negocio en ROA Business. Hemos recibido tu pago
                correctamente. A continuación encontrarás el detalle de tu factura y la
                información de tu suscripción.
              </p>
            </td>
          </tr>

          <!-- Separador -->
          <tr><td style="padding:24px 36px 0;"><hr style="border:none;border-top:1px solid #e5e7eb;"/></td></tr>

          <!-- Datos del negocio -->
          <tr>
            <td style="padding:24px 36px 0;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;
                         letter-spacing:1px;color:#9ca3af;">Datos del negocio</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6b7280;width:40%;">Nombre</td>
                  <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${business.name}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6b7280;">Ubicación</td>
                  <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${location || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6b7280;">Estado</td>
                  <td style="padding:5px 0;">
                    <span style="background:#fef3c7;color:#92400e;font-size:11px;
                                 font-weight:700;padding:3px 10px;border-radius:20px;">
                      Pendiente de aprobación
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Separador -->
          <tr><td style="padding:24px 36px 0;"><hr style="border:none;border-top:1px solid #e5e7eb;"/></td></tr>

          <!-- Detalle de factura -->
          <tr>
            <td style="padding:24px 36px 0;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;
                         letter-spacing:1px;color:#9ca3af;">Detalle de factura</p>

              <!-- Línea de producto -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#f9fafb;border-radius:10px;overflow:hidden;">
                <tr style="background:#f3f4f6;">
                  <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">
                    Descripción
                  </td>
                  <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right;">
                    Importe
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#374151;">
                    Suscripción <strong>${planLabel}</strong> – Directorio ROA Business<br/>
                    <span style="font-size:11px;color:#9ca3af;">
                      ${startDate} → ${expiryDate}
                    </span>
                  </td>
                  <td style="padding:14px 16px;text-align:right;vertical-align:middle;">
                    <span style="font-size:13px;font-weight:700;color:#111827;">
                      L ${Number(planPriceLps).toLocaleString("es-HN")}
                    </span><br/>
                    <span style="font-size:11px;color:#9ca3af;">≈ USD ${planPriceUsd}</span>
                  </td>
                </tr>
                <tr style="background:#f0fdf4;">
                  <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#15803d;">
                    Total pagado
                  </td>
                  <td style="padding:12px 16px;text-align:right;font-size:16px;
                              font-weight:800;color:#15803d;">
                    L ${Number(planPriceLps).toLocaleString("es-HN")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info de transacción -->
          <tr>
            <td style="padding:20px 36px 0;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#eff6ff;border-radius:10px;padding:16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:12px;font-weight:700;
                               text-transform:uppercase;letter-spacing:1px;color:#3b82f6;">
                      Información de la transacción
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:3px 0;font-size:12px;color:#6b7280;width:45%;">
                          N° de factura
                        </td>
                        <td style="padding:3px 0;font-size:12px;font-weight:600;
                                   color:#1e3a8a;font-family:monospace;">
                          ${invoiceNum}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:12px;color:#6b7280;">
                          ID transacción PayPal
                        </td>
                        <td style="padding:3px 0;font-size:12px;font-weight:600;
                                   color:#1e3a8a;font-family:monospace;">
                          ${paypalOrderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:12px;color:#6b7280;">
                          Nombre del pagador
                        </td>
                        <td style="padding:3px 0;font-size:12px;font-weight:600;color:#1e3a8a;">
                          ${payerName || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:12px;color:#6b7280;">
                          Método de pago
                        </td>
                        <td style="padding:3px 0;font-size:12px;font-weight:600;color:#1e3a8a;">
                          PayPal (tarjeta / cuenta)
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:12px;color:#6b7280;">
                          Fecha
                        </td>
                        <td style="padding:3px 0;font-size:12px;font-weight:600;color:#1e3a8a;">
                          ${startDate}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Próximos pasos -->
          <tr>
            <td style="padding:24px 36px 0;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#374151;">
                ¿Qué sigue?
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;padding:4px 12px 4px 0;font-size:18px;">📋</td>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280;line-height:1.5;">
                    <strong style="color:#374151;">Revisión del equipo</strong> – Verificaremos
                    la información de tu negocio en las próximas horas.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;padding:4px 12px 4px 0;font-size:18px;">🌐</td>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280;line-height:1.5;">
                    <strong style="color:#374151;">Publicación</strong> – Una vez aprobado,
                    tu negocio aparecerá en el directorio.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;padding:4px 12px 4px 0;font-size:18px;">💬</td>
                  <td style="padding:4px 0;font-size:13px;color:#6b7280;line-height:1.5;">
                    <strong style="color:#374151;">¿Preguntas?</strong> – Escríbenos a
                    WhatsApp <a href="https://wa.me/50488857653"
                    style="color:#22c55e;font-weight:700;">+504 8885-7653</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 36px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:20px;"/>
              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6;">
                ROA Business · Directorio de las Islas de la Bahía, Honduras<br/>
                Este correo es una confirmación automática de tu registro y pago.<br/>
                Para soporte escríbenos a
                <a href="https://wa.me/50488857653" style="color:#3b82f6;">WhatsApp</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  GmailApp.sendEmail(toEmail, subject, "", {
    htmlBody: html,
    name: fromName,
    replyTo: "no-reply@roabusiness.com",
  });
}

// ──────────────────────────────────────────────────────────────
//  Helper: respuesta JSON
// ──────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ──────────────────────────────────────────────────────────────
//  TEST MANUAL (ejecutar desde el editor de Apps Script)
// ──────────────────────────────────────────────────────────────
function testSendEmail() {
  var business = fetchBusiness("REEMPLAZA_CON_UN_ID_REAL");
  if (!business) {
    Logger.log("Negocio no encontrado");
    return;
  }

  sendInvoiceEmail(
    "tu-correo-de-prueba@gmail.com",
    business,
    "TEST-ORDER-123",
    "Miguel Romero",
    6,
    2400,
  );
  Logger.log("Correo de prueba enviado");
}
