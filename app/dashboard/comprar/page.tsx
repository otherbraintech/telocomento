import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown } from "lucide-react";

export default function ComprarPage() {
  const plans = [
    {
      name: "Básico",
      price: "$10",
      description: "Ideal para monitoreo personal",
      features: ["5 Tarjetas de monitoreo", "Rastreo cada 6 horas", "Soporte por email"],
      icon: <Zap className="size-5 text-blue-500" />,
      color: "border-blue-500/20"
    },
    {
      name: "Profesional",
      price: "$29",
      description: "Para negocios en crecimiento",
      features: ["20 Tarjetas de monitoreo", "Rastreo cada 1 hora", "Soporte prioritario", "IA Avanzada"],
      icon: <Crown className="size-5 text-amber-500" />,
      popular: true,
      color: "border-amber-500/50 shadow-amber-500/10"
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "Control total de la marca",
      features: ["Tarjetas ilimitadas", "Rastreo en tiempo real", "API Access", "Manager dedicado"],
      icon: <Shield className="size-5 text-purple-500" />,
      color: "border-purple-500/20"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Aumenta tu capacidad</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Elige el plan que mejor se adapte a tus necesidades de monitoreo y automatización.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative flex flex-col transition-all hover:scale-[1.02] ${plan.color} ${plan.popular ? 'border-2' : 'border-border/50'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold uppercase py-1 px-3 rounded-full">
                Más Popular
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {plan.icon}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                Seleccionar Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-2xl p-8 border border-border/50 text-center space-y-4">
        <h2 className="text-xl font-semibold">¿Necesitas un plan a medida?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Si necesitas más de 100 tarjetas o integración personalizada con tus sistemas, contáctanos directamente.
        </p>
        <Button variant="link" className="text-primary">Contactar con Ventas</Button>
      </div>
    </div>
  );
}
