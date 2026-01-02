import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { faqData } from '../i18n/translations';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const { t, language } = useLanguage();
  const faqs = faqData[language];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50" data-testid="faq-page">
        {/* Header */}
        <section className="bg-navy py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('faq.title')}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-white rounded-xl border-0 shadow-md px-6 data-[state=open]:shadow-lg"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left py-6 hover:no-underline">
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-navy pr-4">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-8 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </Layout>
  );
}
