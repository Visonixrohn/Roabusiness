import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Users, Waves, Fish, TreePine, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AboutPage = () => {
  const islands = [
    {
      name: 'Roatán',
      description: 'La isla principal y más desarrollada turísticamente. Hogar del aeropuerto internacional y la mayor concentración de hoteles, restaurantes y actividades.',
      area: '127 km²',
      population: '110,000',
      highlights: ['West Bay Beach', 'West End Village', 'Gumbalimba Park', 'Daniel Johnson Monkey Reserve'],
      image: '/images/roatan-beach.png',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Utila',
      description: 'Conocida mundialmente como uno de los mejores destinos para buceo económico. Famosa por sus avistamientos de tiburones ballena.',
      area: '41 km²',
      population: '4,000',
      highlights: ['Buceo con tiburones ballena', 'Escuelas de buceo PADI', 'Vida nocturna relajada', 'Iguana Research Station'],
      image: '/images/utila-diving.jpg',
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Guanaja',
      description: 'La más verde y montañosa de las tres islas. Conocida como la "Venecia del Caribe" por sus canales y casas sobre pilotes.',
      area: '55 km²',
      population: '5,500',
      highlights: ['Ecoturismo', 'Canales naturales', 'Manglares', 'Pesca deportiva'],
      image: '/images/guanaja-beach.jpeg',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const facts = [
    {
      icon: MapPin,
      title: 'Ubicación',
      description: 'Ubicadas a 30-60 km de la costa caribeña de Honduras'
    },
    {
      icon: Waves,
      title: 'Arrecife de Coral',
      description: 'Parte del segundo arrecife de coral más grande del mundo'
    },
    {
      icon: Fish,
      title: 'Vida Marina',
      description: 'Hogar de más de 400 especies de peces tropicales'
    },
    {
      icon: TreePine,
      title: 'Biodiversidad',
      description: 'Ecosistemas únicos con manglares, bosques tropicales y playas'
    },
    {
      icon: Users,
      title: 'Cultura',
      description: 'Rica mezcla de culturas garífuna, inglesa, española e indígena'
    },
    {
      icon: Camera,
      title: 'Turismo',
      description: 'Destino número 1 de Honduras para el ecoturismo y buceo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/hero-sunset.jpg')`
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">
            Sobre las Islas de la Bahía
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Descubre la historia, cultura y belleza natural del paraíso caribeño de Honduras
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Introducción */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Un Paraíso Caribeño Único
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Las Islas de la Bahía (Bay Islands) son un archipiélago de Honduras ubicado en el Mar Caribe, 
              compuesto por tres islas principales: Roatán, Utila y Guanaja. Este destino tropical es reconocido 
              mundialmente por sus arrecifes de coral prístinos, aguas cristalinas y biodiversidad marina excepcional.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Con una rica historia que incluye piratas, colonizadores y diversas culturas, las islas ofrecen 
              una experiencia única que combina aventura, relajación y descubrimiento cultural en un entorno 
              natural incomparable.
            </p>
          </div>
        </section>

        {/* Datos curiosos */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Datos Fascinantes
            </h2>
            <p className="text-lg text-gray-600">
              Conoce los aspectos más destacados de nuestras islas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{fact.title}</h3>
                  </div>
                  <p className="text-gray-600">{fact.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Las Tres Islas */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestras Tres Islas
            </h2>
            <p className="text-lg text-gray-600">
              Cada isla tiene su propia personalidad y atractivos únicos
            </p>
          </div>

          <div className="space-y-12">
            {islands.map((island, index) => (
              <div key={island.name} className={`bg-white rounded-xl shadow-sm overflow-hidden ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} lg:flex`}>
                <div className="lg:w-1/2">
                  <img
                    src={island.image}
                    alt={island.name}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mr-3">
                      {island.name}
                    </h3>
                    <Badge className={island.color}>
                      Isla Principal
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {island.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">Área</div>
                      <div className="font-semibold text-gray-900">{island.area}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Población</div>
                      <div className="font-semibold text-gray-900">{island.population}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Atractivos Principales:</h4>
                    <div className="flex flex-wrap gap-2">
                      {island.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="outline">
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

        {/* Historia */}
        <section className="mb-16">
          <div className="bg-white rounded-xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Historia y Cultura
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Época Precolombina y Colonial
                </h3>
                <p className="text-gray-600 mb-4">
                  Las islas fueron habitadas originalmente por los indígenas Pech. Posteriormente, 
                  fueron visitadas por Cristóbal Colón en 1502 durante su cuarto viaje. 
                  Durante los siglos XVII y XVIII, las islas sirvieron como refugio para 
                  piratas y corsarios.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Influencia Británica
                </h3>
                <p className="text-gray-600">
                  La colonización británica dejó una huella profunda en la cultura e idioma. 
                  Aunque las islas pasaron a formar parte de Honduras en 1859, el inglés 
                  sigue siendo ampliamente hablado junto con el español.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Cultura Garífuna
                </h3>
                <p className="text-gray-600 mb-4">
                  Los garífunas, descendientes de africanos e indígenas caribes, 
                  llegaron a las islas en el siglo XVIII. Su cultura, música, danza 
                  y gastronomía son elementos fundamentales de la identidad isleña.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Turismo Moderno
                </h3>
                <p className="text-gray-600">
                  A partir de la década de 1970, las islas se desarrollaron como destino 
                  turístico, convirtiéndose en el principal atractivo de Honduras para 
                  visitantes internacionales interesados en buceo, ecoturismo y playas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conservación */}
        <section>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Conservación y Sostenibilidad
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Las Islas de la Bahía están comprometidas con la preservación de su ecosistema marino único
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Arrecife Mesoamericano
                </h3>
                <p className="text-gray-600">
                  Las islas forman parte del Sistema Arrecifal Mesoamericano, 
                  el segundo arrecife de barrera más grande del mundo. 
                  Los esfuerzos de conservación incluyen áreas marinas protegidas 
                  y programas de restauración de coral.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Turismo Sostenible
                </h3>
                <p className="text-gray-600">
                  Las islas promueven prácticas de turismo responsable, 
                  incluyendo límites en el número de buzos, 
                  regulaciones de pesca y programas de educación ambiental 
                  para visitantes y residentes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;