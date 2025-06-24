import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, Building, Users, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    businessType: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular envío del formulario
    toast.success('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
    
    // Limpiar formulario
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      businessType: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Correo Electrónico',
      content: 'info@bayislandsdirectory.com',
      description: 'Envíanos un email y te responderemos en 24 horas'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+504 2445-0000',
      description: 'Llámanos de lunes a viernes, 8:00 AM - 6:00 PM'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      content: 'Roatán, Islas de la Bahía, Honduras',
      description: 'Oficina principal en West End Village'
    },
    {
      icon: Clock,
      title: 'Horario de Atención',
      content: 'Lunes a Domingo: 8:00 AM - 8:00 PM',
      description: 'Soporte disponible todos los días del año'
    }
  ];

  const services = [
    {
      icon: Building,
      title: 'Registra tu Negocio',
      description: 'Incluye tu empresa en nuestro directorio y alcanza más clientes'
    },
    {
      icon: Users,
      title: 'Información Turística',
      description: 'Obtén consejos y recomendaciones para tu visita a las islas'
    },
    {
      icon: HeadphonesIcon,
      title: 'Soporte Técnico',
      description: 'Ayuda con el uso de nuestra plataforma y servicios digitales'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/hero-beach.jpg')`
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl font-bold mb-4">
            Contáctanos
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Estamos aquí para ayudarte con cualquier pregunta sobre las Islas de la Bahía
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Información de contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ¿Cómo podemos ayudarte?
              </h2>
              
              <div className="space-y-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {method.title}
                        </h3>
                        <p className="text-blue-600 font-medium mb-1">
                          {method.content}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Servicios */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Nuestros Servicios
              </h3>
              
              <div className="space-y-4">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {service.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+504 0000-0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de consulta
                    </label>
                    <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourism">Información Turística</SelectItem>
                        <SelectItem value="business">Registrar Negocio</SelectItem>
                        <SelectItem value="partnership">Alianzas Comerciales</SelectItem>
                        <SelectItem value="support">Soporte Técnico</SelectItem>
                        <SelectItem value="media">Medios de Comunicación</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Breve descripción del tema"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje detallado aquí..."
                    rows={6}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    * Campos obligatorios
                  </p>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </div>
              </form>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ¿Tienes un negocio en las Islas de la Bahía?
              </h3>
              <p className="text-gray-600 mb-6">
                Únete a nuestro directorio y conecta con miles de turistas que visitan las islas cada año. 
                Ofrecemos diferentes planes para adaptarnos a las necesidades de tu negocio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Registrar mi Negocio
                </Button>
                <Button variant="outline">
                  Ver Planes y Precios
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ rápido */}
        <section className="mt-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Preguntas Frecuentes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Cómo puedo registrar mi negocio?
                </h3>
                <p className="text-gray-600 text-sm">
                  Contáctanos a través del formulario o llámanos directamente. 
                  Te guiaremos en el proceso de registro paso a paso.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Qué información necesito de las islas?
                </h3>
                <p className="text-gray-600 text-sm">
                  Podemos ayudarte con información sobre transporte, alojamiento, 
                  actividades y recomendaciones locales.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿Tienen oficina física?
                </h3>
                <p className="text-gray-600 text-sm">
                  Nuestra oficina principal está en West End Village, Roatán. 
                  También ofrecemos atención virtual para mayor comodidad.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¿En qué idiomas atienden?
                </h3>
                <p className="text-gray-600 text-sm">
                  Ofrecemos atención en español e inglés para adaptarnos 
                  a todos nuestros visitantes y empresarios locales.
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

export default ContactPage;