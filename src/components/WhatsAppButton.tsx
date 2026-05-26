export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/94771234567?text=Hi%20Needly!%20I%20need%20help%20finding%20a%20service."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Needly on WhatsApp"
      className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 flex items-center gap-2.5 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-[#20ba5a] hover:scale-105 transition-all group"
    >
      <i className="fab fa-whatsapp text-2xl" />
      <span className="text-sm font-bold hidden sm:block">Need Help?</span>
    </a>
  );
}
