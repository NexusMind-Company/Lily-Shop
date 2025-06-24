const footer = () => {
  return (
    <footer className="w-full relative bottom-0 bg-lily text-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top section with logo and contact */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/20 pb-6">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font- text-center">Lily Shop</h2>
            <p className="text-white/70 mt-1">Your trusted marketplace</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <a
              href="mailto:ai.nexusmind@gmail.com"
              className="text-white/80 hover:text-white transition-colors flex items-center mb-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              ai.nexusmind@gmail.com
            </a>
            <a
              href="tel:+2349033325971"
              className="text-white/80 hover:text-white transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +2349033325971
            </a>
          </div>
        </div>

        {/* Disclaimer section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-white/10 inline-block">
            Disclaimer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-white/90">
                Third-Party Interactions
              </h4>
              <p className="text-sm text-white/70">
                Our platform connects users with service providers, but we do
                not guarantee the performance, conduct, or legitimacy of any
                user or provider. Users are solely responsible for any
                engagements, transactions, or communications made outside the
                app.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-white/90">
                Liability Limitation
              </h4>
              <p className="text-sm text-white/70">
                We are not liable for any loss, damage, or fraud resulting from
                failure to use our verified partners or recommended protocols.
                Users who choose to bypass official processes (e.g., exchanging
                personal contact info or using external messaging apps like
                WhatsApp) do so at their own risk.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-white/90">No Endorsement</h4>
              <p className="text-sm text-white/70">
                Listing or interaction within the app does not constitute
                endorsement. Users are encouraged to verify all information and
                conduct due diligence before proceeding with any service
                agreement.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-white/90">
                Content and Engagement
              </h4>
              <p className="text-sm text-white/70">
                While we may offer features like feeds, posts, and likes for
                engagement, content shared by users is their sole
                responsibility. We reserve the right to remove any inappropriate
                or misleading content.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-white/90">
                Changes and Updates
              </h4>
              <p className="text-sm text-white/70">
                We may update this disclaimer at any time to reflect new
                features or security practices. Continued use of the app implies
                agreement with the most recent version.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-white/50 pt-4 border-t border-white/10">
          <p>&copy; 2025 Lily Shop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default footer;
