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
  ]

  return (
    <section className="py-32 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 text-balance tracking-tight">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Experiencia de lujo en cada detalle, desde la selección hasta la entrega
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-8 group">
              <div className="aspect-video rounded-2xl overflow-hidden bg-card mx-auto max-w-sm shadow-xl shadow-primary/5 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-serif font-light text-balance tracking-wide">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty font-light leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
