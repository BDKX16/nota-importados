export function FeaturesSection() {
  const features = [
    {
      title: "Autenticidad Garantizada",
      description: "Todos nuestros perfumes son 100% originales",
      image: "/authentic-perfume-certificate.jpg",
    },
    {
      title: "Envío Gratuito",
      description: "En compras superiores a $100",
      image: "/free-shipping-perfume-box.jpg",
    },
    {
      title: "Marcas Exclusivas",
      description: "Las mejores casas de perfumería mundial",
      image: "/luxury-perfume-brands-collection.jpg",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-sans font-semibold mb-4 text-balance tracking-tight uppercase">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Calidad y confianza en cada transacción, respaldado por años de
            experiencia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 ">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-6 group">
              <div className="aspect-video rounded-lg overflow-hidden bg-card mx-auto max-w-sm shadow-lg shadow-foreground/10 group-hover:shadow-xl group-hover:shadow-foreground/15 transition-all duration-300">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-sans font-bold text-balance tracking-wide uppercase text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-pretty font-normal leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
