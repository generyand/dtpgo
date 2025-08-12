import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQ } from "@/lib/content/landing"
import { HelpCircle } from "lucide-react"
import { Reveal } from "@/components/ui/Reveal"

export function Faq() {
  return (
    <section id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <Reveal delayMs={80}>
          <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
          <p className="mt-2 text-sm text-neutral-600">Quick answers to common questions about the attendance platform.</p>
        </Reveal>
        <Reveal delayMs={200}>
          <div className="mt-6 rounded-2xl border bg-white shadow-sm p-2 sm:p-4">
            <Accordion type="multiple" className="">
              {FAQ.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx + 1}`}>
                  <AccordionTrigger className="rounded-lg hover:no-underline hover:bg-neutral-50 px-2 sm:px-3">
                    <span className="inline-flex items-center gap-3 text-left">
                      <span className="inline-flex items-center justify-center size-7 rounded-full bg-yellow-400/20 text-yellow-600">
                        <HelpCircle className="size-4" />
                      </span>
                      <span>{item.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 sm:px-3">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  )
}


