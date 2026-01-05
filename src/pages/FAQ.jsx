import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqData = [
  {
    question: "How can I book a room?",
    answer:
      "Search for rooms using filters, open a listing, and contact the owner directly. Some listings also support instant booking for faster confirmation."
  },
  {
    question: "Are the room listings verified?",
    answer:
      "Yes. Every listing goes through a verification process to ensure authenticity, safety, and accurate information before being published."
  },
  {
    question: "Can I post my room for rent?",
    answer:
      "Yes. Click on “Post Your Property” and complete the listing form. The entire process usually takes less than five minutes."
  },
  {
    question: "How do I contact the property owner?",
    answer:
      "Each listing includes a secure contact option that allows you to message the owner without exposing your personal details."
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Payments can be made via bank transfer and popular mobile wallets such as eSewa and Khalti. Payment methods may vary by listing."
  },
  {
    question: "Is there any commission or hidden fee?",
    answer:
      "No. We follow a zero-commission model. You only pay the amount agreed upon with the owner—no hidden or extra charges."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-10 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#00BFA5]/10 mb-3">
            <HelpCircle className="w-5 h-5 text-[#00BFA5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Frequently Asked Questions
          </h2>

          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Clear answers to the most common questions about booking and listing
            properties on our platform.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-2">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`rounded-lg border transition-all duration-300 ${
                  isOpen
                    ? "bg-white border-[#00BFA5]/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span
                    className={`font-semibold text-sm sm:text-base ${
                      isOpen ? "text-[#00BFA5]" : "text-slate-800"
                    }`}
                  >
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 text-[#00BFA5]"
                        : "text-slate-400"
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden px-4 pb-3 text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support CTA */}
        <div className="mt-8 text-center border border-slate-200 rounded-lg p-6 bg-white">
          <h3 className="text-md font-bold text-slate-900 mb-1">
            Need more help?
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            Our support team is always ready to assist you.
          </p>
          <button className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#00BFA5] text-white text-sm font-semibold hover:bg-[#00a893] transition">
            Contact Support
          </button>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
