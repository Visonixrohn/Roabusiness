import React from "react";

const TermsOfUsePage = () => (
  <div className="max-w-2xl mx-auto py-12 px-4 bg-white rounded shadow">
    <h1 className="text-3xl font-bold mb-6 text-blue-700">Términos de Uso</h1>
    <p className="mb-4">
      Al utilizar RoaBusiness, aceptas los siguientes términos y condiciones. Si
      no estás de acuerdo con alguno de ellos, por favor no utilices este sitio.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Uso del Sitio</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>
        El usuario se compromete a utilizar RoaBusiness de manera responsable y
        conforme a la ley.
      </li>
      <li>
        No está permitido el uso del sitio para fines fraudulentos, ilegales o
        que perjudiquen a terceros.
      </li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. Registro y Cuentas</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>
        El usuario es responsable de la veracidad de la información
        proporcionada al registrarse.
      </li>
      <li>
        Está prohibido crear cuentas falsas o suplantar la identidad de otras
        personas o negocios.
      </li>
      <li>
        El usuario debe mantener la confidencialidad de su contraseña y es
        responsable de toda actividad realizada desde su cuenta.
      </li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">3. Contenido</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>
        El usuario es responsable del contenido que publique en RoaBusiness.
      </li>
      <li>
        No se permite publicar contenido ofensivo, ilegal, difamatorio, engañoso
        o que infrinja derechos de terceros.
      </li>
      <li>
        RoaBusiness se reserva el derecho de eliminar contenido que incumpla
        estas normas.
      </li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      4. Propiedad Intelectual
    </h2>
    <ul className="list-disc ml-6 mb-4">
      <li>
        Todo el contenido y diseño de RoaBusiness está protegido por derechos de
        autor.
      </li>
      <li>
        No está permitido copiar, reproducir o distribuir contenido del sitio
        sin autorización.
      </li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">5. Modificaciones</h2>
    <p className="mb-4">
      RoaBusiness puede modificar estos términos en cualquier momento. Los
      cambios serán notificados a través del sitio o por correo electrónico.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      6. Limitación de Responsabilidad
    </h2>
    <p className="mb-4">
      RoaBusiness no se hace responsable por daños directos o indirectos
      derivados del uso del sitio o de la información publicada por los
      usuarios.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">7. Contacto</h2>
    <p>
      Para consultas o reportes, contáctanos en{" "}
      <a href="mailto:info@roabusiness.com" className="text-blue-600 underline">
        info@roabusiness.com
      </a>
      .
    </p>
  </div>
);

export default TermsOfUsePage;
