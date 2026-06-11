import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const SUPPORT_EMAIL = "info.lilyshops@gmail.com";
const SUPPORT_PHONE = "+234 903 332 5971";
const SUPPORT_WHATSAPP = "+234 903 332 5971";

const ContactCard = ({ icon: Icon, label, value, action, _color }) => (
  <a
    href={action}
    target={action.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-lily-100 hover:border-lily transition-all group"
  >
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center bg-lily`}
    >
      <Icon size={20} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-lily-600 font-medium">{label}</p>
      <p className="text-sm font-bold text-lily-900 truncate">{value}</p>
    </div>
    <ChevronRight
      size={16}
      className="text-lily-300 group-hover:text-lily transition-colors"
    />
  </a>
);

const FAQItem = ({ q, a }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-lily-100">
    <p className="text-sm font-bold text-lily-900 mb-1.5">Q: {q}</p>
    <p className="text-xs text-lily-600 leading-relaxed">{a}</p>
  </div>
);

const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-lily-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-lily-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-lily-900" />
          </button>
          <div>
            <h1 className="text-base font-bold text-lily-900">
              Customer Support
            </h1>
            <p className="text-xs text-lily-600">We're here to help — 24/7</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-12 space-y-5">
        {/* Hero */}
        <div className="bg-lily rounded-2xl p-5 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold mb-1">Lily Shop Support</h2>
          <p className="text-white text-xs leading-relaxed">
            Having an issue? Our support team is available around the clock to
            help you.
          </p>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-lily-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lily-100 flex items-center justify-center">
            <Clock size={18} className="text-lily" />
          </div>
          <div>
            <p className="text-xs font-bold text-lily-900">Support Hours</p>
            <p className="text-xs text-lily-600">
              24 hours a day, 7 days a week
            </p>
          </div>
        </div>

        {/* Contact options */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-lily-600 mb-3 px-1">
            Contact Us
          </p>
          <div className="space-y-3">
            <ContactCard
              icon={Phone}
              label="Call Us"
              value={SUPPORT_PHONE}
              action={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
            />
            <ContactCard
              icon={MessageCircle}
              label="WhatsApp"
              value={SUPPORT_WHATSAPP}
              action={`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`}
            />
            <ContactCard
              icon={Mail}
              label="Email Us"
              value={SUPPORT_EMAIL}
              action={`mailto:${SUPPORT_EMAIL}`}
            />
          </div>
        </div>

        {/* FAQs */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-lily-600 mb-3 px-1">
            Frequently Asked Questions
          </p>
          <div className="space-y-3">
            <FAQItem
              q="How do I cancel my subscription?"
              a="Go to My Subscriptions, find the active plan and tap 'Cancel Subscription'. Your access continues until the end of the billing period."
            />
            <FAQItem
              q="Can I customise the meals I receive?"
              a="Yes! On your subscriptions page, tap 'Customise Meals' on any active plan to remove meals you don't want from your delivery."
            />
            <FAQItem
              q="How do I track my order?"
              a="Go to Orders from the main menu. You'll see the status of each order in real time."
            />
            <FAQItem
              q="How do I become a vendor?"
              a="Tap 'Become a Vendor' from your profile or the food section. Fill in your restaurant details and you'll be set up instantly."
            />
            <FAQItem
              q="What payment methods are accepted?"
              a="We accept payments via your Lily Shop wallet and Paystack (card payments). You can top up your wallet from the Wallet section."
            />
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-lily-600 px-4">
          Response time is typically within a few minutes via WhatsApp or phone.
          For email, expect a reply within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;
