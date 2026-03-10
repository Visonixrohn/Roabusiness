import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Ban, AlertTriangle, Mail, ArrowLeft } from "lucide-react";

const ChildSafetyPage = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 py-12 px-4">
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg flex-shrink-0">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Política de Seguridad Infantil
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            RoaBusiness · Islas de la Bahía, Honduras
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 space-y-8">

        {/* Intro */}
        <section>
          <p className="text-gray-700 leading-relaxed">
            En <strong>RoaBusiness</strong> nos comprometemos firmemente con la
            protección de niños, niñas y adolescentes. Esta política describe
            nuestra postura ante el contenido que pueda poner en riesgo la
            seguridad o bienestar de menores de edad, así como las medidas que
            tomamos para prevenir, detectar y responder a dicho contenido.
          </p>
        </section>

        {/* Contenido prohibido */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Ban className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Contenido estrictamente prohibido
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Está terminantemente prohibido publicar, compartir, almacenar o
            distribuir a través de RoaBusiness cualquier contenido que:
          </p>
          <ul className="space-y-2">
            {[
              "Contenido sexual explícito o sugestivo en el que aparezcan menores de edad (CSAM).",
              "Imágenes, videos o descripciones que sexualicen a niños, niñas o adolescentes.",
              "Información que facilite el acceso, acoso o explotación de menores.",
              "Material que promueva, normalice o glorifique el abuso o maltrato infantil.",
              "Datos personales de menores sin el consentimiento expreso de sus tutores legales.",
              "Publicidad o promociones dirigidas a explotar o dañar a menores.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Compromiso de la plataforma */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Compromiso de la plataforma
            </h2>
          </div>
          <ul className="space-y-2">
            {[
              "Revisamos y moderamos el contenido publicado en el directorio de negocios para detectar cualquier material inapropiado.",
              "Eliminamos de inmediato cualquier publicación que viole esta política.",
              "Suspendemos o cancelamos de forma permanente las cuentas que incumplan estas normas.",
              "Reportamos a las autoridades competentes cualquier contenido que pueda constituir un delito contra menores.",
              "No almacenamos datos personales de menores de 13 años sin el consentimiento verificado de sus tutores.",
              "Capacitamos a nuestro equipo de moderación para identificar y actuar ante contenido CSAM de acuerdo con las leyes aplicables.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Reportar */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">
              ¿Encontraste contenido inapropiado?
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Si encuentras contenido que consideres perjudicial para menores de
            edad, repórtalo de inmediato. Tomamos todos los reportes muy en
            serio y actuamos con la mayor rapidez posible.
          </p>
          <a
            href="mailto:contacto@roabusiness.com?subject=Reporte%20contenido%20inapropiado%20-%20Seguridad%20Infantil"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm"
          >
            <Mail className="h-4 w-4" />
            Reportar a contacto@roabusiness.com
          </a>
        </section>

        {/* Organismos */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Organismos de denuncia externos
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Si el contenido implica un delito, también puedes acudir a:
          </p>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li>
              🇭🇳 <strong>Honduras:</strong> Ministerio Público — Fiscalía de la
              Niñez / DINAF (Dirección de Niñez, Adolescencia y Familia).
            </li>
            <li>
              🌐 <strong>Internacional:</strong>{" "}
              <a
                href="https://www.missingkids.org/gethelpnow/cybertipline"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                NCMEC CyberTipline
              </a>{" "}
              (National Center for Missing &amp; Exploited Children).
            </li>
            <li>
              🌐 <strong>Internet Watch Foundation:</strong>{" "}
              <a
                href="https://www.iwf.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                www.iwf.org.uk
              </a>
            </li>
          </ul>
        </section>

        {/* Vigencia */}
        <section className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            Esta política está vigente desde el <strong>10 de marzo de 2026</strong>{" "}
            y puede ser actualizada sin previo aviso. El uso continuado de la
            plataforma implica la aceptación de sus términos.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default ChildSafetyPage;
