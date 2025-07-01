import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Users, Waves, Fish, TreePine, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AboutPage = () => {
  const islands = [
    {
      name: 'Roatán',
      description:
        'La isla más grande y desarrollada del archipiélago, con infraestructura turística completa, incluyendo el Aeropuerto Internacional Juan Manuel Gálvez, hoteles, restaurantes y una amplia oferta de actividades acuáticas y terrestres.',
      area: '127 km²',
      population: 'aprox. 120,000',
      highlights: [
        'West Bay Beach – considerada una de las mejores playas del Caribe',
        'West End Village – centro cultural y gastronómico',
        'Parque Gumbalimba – reserva natural y zoológico',
        'Reserva de monos Daniel Johnson',
      ],
      image: '/images/roatan-beach.png',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'Utila',
      description:
        'Pequeña isla reconocida mundialmente por ser uno de los destinos de buceo más accesibles y económicos. Popular por los avistamientos frecuentes de tiburones ballena, así como por su ambiente relajado y su vibrante comunidad de buzos.',
      area: '41 km²',
      population: 'aprox. 5,000',
      highlights: [
        'Buceo con tiburones ballena',
        'Escuelas de buceo certificadas PADI',
        'Vida nocturna sencilla y amigable',
        'Estación de investigación de iguanas',
      ],
      image: '/images/utila-diving.jpg',
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Guanaja',
      description:
        'Isla más remota y verde, con un paisaje montañoso y canales naturales que le han dado el apodo de "Venecia del Caribe". Ideal para ecoturismo, exploración de manglares y pesca deportiva.',
      area: '55 km²',
      population: 'aprox. 6,000',
      highlights: [
        'Ecoturismo en áreas protegidas',
        'Canales naturales y manglares',
        'Pesca deportiva y deportes acuáticos',
        'Pueblos con arquitectura tradicional',
      ],
      image: '/images/guanaja-beach.jpeg',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const facts = [
    {
      icon: MapPin,
      title: 'Ubicación',
      description:
        'Situadas entre 30 y 60 km de la costa norte de Honduras, en el Mar Caribe.',
    },
    {
      icon: Waves,
      title: 'Arrecife Mesoamericano',
      description:
        'Forman parte del Sistema Arrecifal Mesoamericano, el segundo arrecife de coral más grande del mundo.',
    },
    {
      icon: Fish,
      title: 'Biodiversidad Marina',
      description:
        'Hogar de más de 500 especies marinas, incluyendo peces tropicales, tortugas y manatíes.',
    },
    {
      icon: TreePine,
      title: 'Ecosistemas Diversos',
      description:
        'Combina manglares, bosques tropicales y playas, ofreciendo hábitats para flora y fauna únicas.',
    },
    {
      icon: Users,
      title: 'Cultura Vibrante',
      description:
        'Una mezcla de raíces garífuna, inglesas, españolas y mayas que se refleja en su música, gastronomía y tradiciones.',
    },
    {
      icon: Camera,
      title: 'Destino Turístico',
      description:
        'Principal destino de Honduras para ecoturismo, buceo y turismo de aventura, con un crecimiento sostenible.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
   

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        
        <div className="relative z-10 text-center text-BLACK px-4 max-w-3xl animate-fadeInDown">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
            Sobre las Islas de la Bahía
          </h1>
          <p className="text-xl max-w-xl mx-auto drop-shadow-md">
            Descubre la historia, cultura y belleza natural del paraíso caribeño de Honduras
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12 space-y-20">
        {/* Introducción */}
        <section className="max-w-4xl mx-auto text-center animate-fadeInUp">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 underline decoration-pink-500 underline-offset-8 decoration-4">
            Un Paraíso Caribeño Único
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Las Islas de la Bahía, un archipiélago hondureño en el Mar Caribe, son mundialmente reconocidas por sus arrecifes de coral prístinos y su biodiversidad marina excepcional.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Con siglos de historia desde sus raíces indígenas y coloniales hasta su desarrollo actual como destino turístico de clase mundial, las islas ofrecen una mezcla perfecta de aventura, cultura y relajación en un entorno natural incomparable.
          </p>
        </section>

        {/* Datos Curiosos */}
        <section className="animate-fadeInUp delay-150">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 underline decoration-blue-400 underline-offset-8 decoration-4">
              Datos Fascinantes
            </h2>
            <p className="text-lg text-gray-700 max-w-xl mx-auto">
              Conoce los aspectos más destacados y únicos de nuestras islas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {facts.map((fact, i) => {
              const Icon = fact.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex items-center mb-5">
                    <div className="w-14 h-14 bg-gradient-to-tr from-blue-300 to-blue-500 rounded-lg flex items-center justify-center mr-5 text-white shadow-md">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{fact.title}</h3>
                  </div>
                  <p className="text-gray-700">{fact.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Islas */}
        <section className="animate-fadeInUp delay-300">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 underline decoration-green-400 underline-offset-8 decoration-4">
              Nuestras Tres Islas
            </h2>
            <p className="text-lg text-gray-700 max-w-xl mx-auto">
              Cada isla tiene su propia personalidad, historia y atractivos naturales.
            </p>
          </div>

          <div className="space-y-16">
            {islands.map((island, idx) => (
              <div
                key={island.name}
                className={`bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col lg:flex-row ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                } animate-slideIn`}
              >
                <div className="lg:w-1/2 overflow-hidden group relative">
                  <img
                    src={island.image}
                    alt={`Imagen de ${island.name}`}
                    className="w-full h-72 lg:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="lg:w-1/2 p-10 flex flex-col justify-center">
                  <div className="flex items-center mb-6">
                    <h3 className="text-3xl font-extrabold text-gray-900 mr-4">{island.name}</h3>
                    <Badge
                      className={`${island.color} px-4 py-1 text-sm font-semibold shadow-md transition-transform hover:scale-110`}
                    >
                      Isla Principal
                    </Badge>
                  </div>

                  <p className="text-gray-700 mb-8 leading-relaxed">{island.description}</p>

                  <div className="grid grid-cols-2 gap-6 mb-8 text-gray-600">
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900">Área</h4>
                      <p>{island.area}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-900">Población</h4>
                      <p>{island.population}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Atractivos Principales:</h4>
                    <div className="flex flex-wrap gap-3">
                      {island.highlights.map((highlight, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-default hover:bg-gray-200 transition-colors"
                        >
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historia y Cultura */}
        <section className="animate-fadeInUp delay-450">
          <div className="bg-white rounded-3xl p-10 lg:p-16 shadow-lg">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center underline decoration-pink-400 underline-offset-8 decoration-4">
              Historia y Cultura
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-gray-700 leading-relaxed">
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Época Precolombina y Colonial</h3>
                  <p>
                    Habitadas originalmente por indígenas Pech, las islas fueron visitadas por Cristóbal Colón en 1502. En los siglos XVII y XVIII, sirvieron como refugio para piratas y corsarios del Caribe.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Influencia Británica</h3>
                  <p>
                    La colonización británica dejó una huella cultural y lingüística que persiste, con el inglés y el criollo ampliamente hablados a pesar de ser parte de Honduras desde 1859.
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Cultura Garífuna</h3>
                  <p>
                    Los garífunas, descendientes de africanos y caribes, llegaron en el siglo XVIII. Su música, gastronomía y tradiciones son fundamentales en la identidad isleña.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Turismo Moderno</h3>
                  <p>
                    Desde los años 70, las islas se han desarrollado como destino turístico de renombre mundial, enfocado en buceo, ecoturismo y conservación ambiental.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conservación */}
        <section className="animate-fadeInUp delay-600">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-10 lg:p-16 shadow-lg">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 underline decoration-green-400 underline-offset-8 decoration-4">
                Conservación y Sostenibilidad
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Las Islas de la Bahía están comprometidas con la protección y el manejo sostenible de sus recursos naturales para preservar su biodiversidad y belleza única.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-700 leading-relaxed">
              <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-semibold mb-4">Arrecife Mesoamericano</h3>
                <p>
                  Parte del segundo arrecife de coral más grande del mundo, protegido mediante áreas marinas reguladas y proyectos de restauración coralina.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-semibold mb-4">Turismo Responsable</h3>
                <p>
                  Se fomentan prácticas sostenibles que minimizan el impacto ambiental, regulan actividades acuáticas y promueven la educación ambiental entre visitantes y residentes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

     

      {/* Animations with Tailwind + custom styles */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease forwards;
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.9s ease forwards;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-450 {
          animation-delay: 0.45s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
