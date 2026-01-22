import { Users, Calendar, Trophy, Target } from 'lucide-react';

const highlights = [
  {
    icon: Users,
    value: '400+',
    label: 'zawodników',
    description: 'z całej Europy',
  },
  {
    icon: Calendar,
    value: '4',
    label: 'dni',
    description: 'pełne emocji',
  },
  {
    icon: Trophy,
    value: '20+',
    label: 'turniejów',
    description: 'soft i steel',
  },
  {
    icon: Target,
    value: '50',
    label: 'stanowisk',
    description: 'do gry',
  },
];

export function Highlights() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Największy turniej darta w Polsce
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            10. edycja Mistrzostw Polski to nie tylko turniej - to święto darta,
            spotkanie przyjaciół i emocje na najwyższym poziomie.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white rounded-xl p-6 shadow-sm border text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  {item.value}
                </p>
                <p className="font-semibold text-gray-700 mb-1">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
