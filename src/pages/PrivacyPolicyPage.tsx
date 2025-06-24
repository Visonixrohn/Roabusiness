import React from "react";

const PrivacyPolicyPage = () => (
  <div className="max-w-2xl mx-auto py-12 px-4 bg-white rounded shadow">
    <h1 className="text-3xl font-bold mb-6 text-blue-700">
      Política de Privacidad
    </h1>
    <p className="mb-4">
      En RoaBusiness, valoramos la privacidad de nuestros usuarios y nos
      comprometemos a proteger la información personal que nos confían. Al
      utilizar nuestro sitio, aceptas las condiciones descritas a continuación.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Información Pública</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Nombre del negocio o usuario.</li>
      <li>Ubicación (ciudad o isla).</li>
      <li>Categoría del negocio.</li>
      <li>
        Información de contacto (como correo electrónico, sitio web, teléfono).
      </li>
      <li>Fotografías, descripciones, servicios y promociones publicadas.</li>
    </ul>
    <p className="mb-4 text-yellow-700 font-semibold">
      ⚠️ Toda la información publicada en perfiles y anuncios es responsabilidad
      exclusiva del usuario.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. Información Privada</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Correo electrónico de acceso.</li>
      <li>Contraseña (encriptada).</li>
      <li>Dirección IP y registros de actividad para seguridad.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">3. Contenido Prohibido</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Lenguaje ofensivo, difamatorio o discriminatorio.</li>
      <li>Imágenes no autorizadas o protegidas por derechos de autor.</li>
      <li>Información falsa, engañosa o malintencionada.</li>
      <li>Promociones de actividades ilegales.</li>
      <li>Contenido sexual explícito o violento.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      4. Moderación y Consecuencias
    </h2>
    <p className="mb-2">
      RoaBusiness se reserva el derecho de editar, ocultar o eliminar cualquier
      contenido que incumpla nuestras normas comunitarias o condiciones de uso,
      sin previo aviso.
    </p>
    <ul className="list-disc ml-6 mb-4">
      <li>Advertencia directa al usuario.</li>
      <li>Eliminación de contenido inapropiado.</li>
      <li>Suspensión temporal o bloqueo permanente de la cuenta infractora.</li>
      <li>Reporte a autoridades en casos graves o ilegales.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      5. Seguridad de los Usuarios
    </h2>
    <p className="mb-4">
      Utilizamos medidas de seguridad para proteger los datos personales de
      nuestros usuarios. Sin embargo, te recomendamos:
    </p>
    <ul className="list-disc ml-6 mb-4">
      <li>No compartir contraseñas con terceros.</li>
      <li>No divulgar información confidencial públicamente.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">6. Contacto</h2>
    <p className="mb-4">
      Si tienes preguntas o necesitas reportar una publicación o cuenta
      inapropiada, puedes contactarnos en:
    </p>
    <ul className="list-disc ml-6 mb-4">
      <li>📧 info@roabusiness.com</li>
      <li>📍 Islas de la Bahía, Honduras</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      7. Cambios a esta Política
    </h2>
    <p>
      RoaBusiness puede actualizar esta política en cualquier momento. Se
      notificará a los usuarios sobre cambios significativos a través del sitio
      o por correo electrónico.
    </p>
  </div>
);

export default PrivacyPolicyPage;
