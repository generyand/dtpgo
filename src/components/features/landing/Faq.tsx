import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQ } from "@/lib/content/landing"
import { HelpCircle, MessageCircle } from "lucide-react"
import { Reveal } from "@/components/ui/Reveal"

export function Faq() {
  return (
    <section id="faq" className="bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <Reveal delayMs={80}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-sm font-medium mb-4">
              <MessageCircle className="size-4" />
              <span>FAQ</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Frequently Asked Questions</h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Quick answers to common questions about the attendance platform.</p>
          </div>
        </Reveal>
        <Reveal delayMs={200}>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-2 sm:p-4">
            <Accordion type="multiple" className="space-y-2">
              {FAQ.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx + 1}`} className="border-0">
                  <AccordionTrigger className="rounded-xl hover:no-underline hover:bg-gray-50 px-3 sm:px-4 py-3 sm:py-4 transition-colors duration-200 [&[data-state=open]]:bg-yellow-50">
                    <span className="inline-flex items-center gap-3 sm:gap-4 text-left">
                      <span className="inline-flex items-center justify-center size-6 sm:size-8 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                        <HelpCircle className="size-4" />
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">{item.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 ml-9 sm:ml-12 text-sm sm:text-base text-gray-600 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  )
}


