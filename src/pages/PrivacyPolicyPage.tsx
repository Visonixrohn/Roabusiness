const PrivacyPolicyPage = () => (
  <main className="mx-auto max-w-4xl px-4 py-10 text-slate-700 sm:px-6 sm:py-14">
    <header className="mb-10 border-b border-slate-200 pb-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-700">
        RoaBusiness · Aplicación móvil
      </p>
      <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
        Política de Privacidad
      </h1>
      <p className="mb-5 leading-relaxed">
        Esta política explica cómo se recopila, utiliza, comparte y protege la
        información personal relacionada con RoaBusiness y la aplicación de
        pedidos Roatan Food Delivery. Al utilizar nuestros servicios, aceptas
        las prácticas descritas aquí.
      </p>
      <dl className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Aplicación</dt>
          <dd className="font-semibold text-slate-900">roatan food delibery</dd>
        </div>
        <div>
          <dt className="text-slate-500">Identificador del paquete</dt>
          <dd className="font-mono text-slate-900">com.roatanfooddelivery.app</dd>
        </div>
        <div>
          <dt className="text-slate-500">Responsable</dt>
          <dd className="font-semibold text-slate-900">RoaBusiness</dd>
        </div>
        <div>
          <dt className="text-slate-500">Última actualización</dt>
          <dd className="font-semibold text-slate-900">Octubre de 2026</dd>
        </div>
      </dl>
    </header>

    <article className="space-y-9 leading-relaxed">
      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          1. Información que recopilamos
        </h2>
        <p className="mb-3">
          Según las funciones que utilices, podemos recopilar las siguientes
          categorías de información:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Identificación y contacto:</strong> nombre, teléfono, correo
            electrónico y direcciones de entrega que proporciones.
          </li>
          <li>
            <strong>Ubicación:</strong> ubicación precisa o aproximada mientras
            la aplicación está en uso, si otorgas el permiso correspondiente,
            para mostrar comercios cercanos, calcular entregas y facilitar la
            entrega del pedido.
          </li>
          <li>
            <strong>Pedidos:</strong> comercios y productos seleccionados,
            historial de pedidos, instrucciones de entrega e importes.
          </li>
          <li>
            <strong>Pagos:</strong> los pagos con tarjeta se procesan mediante
            proveedores externos. RoaBusiness no almacena los números completos
            de tarjeta ni los códigos de seguridad CVV.
          </li>
          <li>
            <strong>Datos técnicos:</strong> información del dispositivo,
            sistema operativo, identificadores técnicos y reportes de errores
            necesarios para mantener y proteger el servicio.
          </li>
          <li>
            <strong>Información de perfiles comerciales:</strong> nombre,
            ubicación, categoría, datos de contacto, fotografías, descripciones,
            servicios y promociones que los negocios decidan publicar.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          2. Cómo utilizamos la información
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Crear y administrar cuentas y perfiles comerciales.</li>
          <li>Conectar a clientes con comercios y gestionar pedidos y entregas.</li>
          <li>Calcular rutas, mostrar comercios cercanos y coordinar entregas.</li>
          <li>Enviar confirmaciones, actualizaciones y avisos de soporte.</li>
          <li>Proteger el servicio, prevenir fraudes y resolver problemas técnicos.</li>
          <li>Cumplir obligaciones legales aplicables.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          3. Cuándo compartimos información
        </h2>
        <p className="mb-3">
          No vendemos ni alquilamos información personal. Compartimos solo los
          datos necesarios para prestar el servicio con:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Comercios:</strong> nombre del cliente, pedido e
            instrucciones necesarias para prepararlo.
          </li>
          <li>
            <strong>Repartidores asignados:</strong> datos de contacto y
            ubicación o dirección necesarias para completar la entrega.
          </li>
          <li>
            <strong>Proveedores:</strong> alojamiento e infraestructura,
            procesamiento de pagos y servicios de mapas o ubicación.
          </li>
          <li>
            <strong>Autoridades:</strong> cuando una obligación legal válida lo
            requiera.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          4. Conservación y eliminación de datos
        </h2>
        <p>
          Conservamos los datos solo durante el tiempo necesario para prestar el
          servicio, mantener tu cuenta y cumplir obligaciones legales. Puedes
          solicitar la eliminación de tu cuenta y de los datos asociados desde
          la aplicación, en Perfil &gt; Configuración &gt; Privacidad &gt;
          Eliminar mi cuenta, o escribiendo a{" "}
          <a
            className="font-semibold text-orange-700 underline"
            href="mailto:info@roabusiness.com"
          >
            info@roabusiness.com
          </a>
          . Tras verificar la solicitud, eliminaremos los datos personales de
          nuestros sistemas activos, salvo aquellos que debamos conservar por
          motivos legales.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          5. Seguridad
        </h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger la
          información contra acceso, pérdida, uso o divulgación no autorizados.
          Ningún método de transmisión o almacenamiento puede garantizar
          seguridad absoluta.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          6. Privacidad de menores
        </h2>
        <p>
          El servicio no está dirigido a menores de 13 años, o a la edad mínima
          legal aplicable. No recopilamos conscientemente información personal
          de menores; si detectamos que se ha proporcionado, tomaremos medidas
          para eliminarla.
        </p>
      </section>

      <section id="contacto" className="border-t border-slate-200 pt-7">
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          7. Contacto y cambios a esta política
        </h2>
        <p className="mb-3">
          Para preguntas sobre privacidad o para ejercer tus derechos sobre tus
          datos, contacta a RoaBusiness en{" "}
          <a
            className="font-semibold text-orange-700 underline"
            href="mailto:info@roabusiness.com"
          >
            info@roabusiness.com
          </a>
          . Estamos ubicados en Islas de la Bahía, Honduras.
        </p>
        <p>
          Podemos actualizar esta política cuando cambien nuestros servicios o
          nuestras obligaciones. Publicaremos la versión vigente en esta página
          e indicaremos su fecha de actualización.
        </p>
      </section>
    </article>
  </main>
);

export default PrivacyPolicyPage;
