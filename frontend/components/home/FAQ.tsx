'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Czy potrzebuję licencji, żeby zagrać?',
    answer: 'Nie, Mistrzostwa Polski są otwarte dla wszystkich. Nie wymagamy żadnych licencji ani członkostwa w federacji. Wystarczy zarejestrować się na wybrany turniej przez system n01.',
  },
  {
    question: 'Jak zapisać się na turniej?',
    answer: 'Rejestracja odbywa się przez system n01darts.com. Załóż konto, znajdź turniej na liście i kliknij "Join". Wpisowe płacisz na miejscu gotówką przed rozpoczęciem turnieju.',
  },
  {
    question: 'Czy mogę przyjechać z rodziną?',
    answer: 'Oczywiście! Cukrownia Żnin to świetne miejsce na rodzinny wyjazd. Na miejscu jest plaża, molo, aquapark z 28-metrową zjeżdżalnią. Dzieci do 4 lat nocują za darmo.',
  },
  {
    question: 'Czy będzie transmisja na żywo?',
    answer: 'Tak, finały wszystkich głównych turniejów będą transmitowane na kanale YouTube Darts Polska. Śledź nas w social mediach, żeby nie przegapić.',
  },
  {
    question: 'Jakie są formy płatności za wpisowe?',
    answer: 'Wpisowe przyjmujemy wyłącznie gotówką na miejscu, przed rozpoczęciem turnieju. Za noclegi możesz zapłacić przelewem lub gotówką.',
  },
  {
    question: 'Czy mogę przyjść jako kibic?',
    answer: 'Tak! Wstęp dla kibiców jest bezpłatny. Zachęcamy do kibicowania i tworzenia niesamowitej atmosfery podczas meczów.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left min-h-[56px]"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Najczęściej zadawane pytania
            </h2>
            <p className="text-muted-foreground">
              Wszystko co musisz wiedzieć przed przyjazdem
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
