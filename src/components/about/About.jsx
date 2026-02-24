// src/components/settings/About.jsx
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

const About = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (title) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const aboutContent = {
    sections: [
      {
        title: "About Us",
        content: `Lilyshops is your all-in-one app where social media meets easy shopping and stress-free eating.
         Scroll through fun feeds of videos, photos, and posts, like dances or daily vibes, from creators and vendors. 
         Spot something cool? Tap to buy it right there, no jumping apps. 
         Plus, for food lovers, subscribe to your favorite restaurants or vendors once weekly or monthly—and get meals delivered daily without re-ordering. 
         Save time, save money, and enjoy a community where buying feels like hanging out
         
         Our mission is to make commerce social, fun and available to everyone 
         Our vision is to be the biggest social commerce in the world`,

         
      },
      {
        title: "Privacy Policy",
        content: `Privacy & Data Protection at LilyShops

Introduction
Your privacy is critically important to us. This policy explains what personal data we collect, how we use it, how we share it, and your rights.

What We Collect
• Registration data: name, username, email, phone number
• Profile info: picture, bio, location (if provided)
• Transaction data: order history, payment details
• Usage data: interactions, likes, comments, device, IP
• Media: photos/videos you upload
• Cookies and analytics: site behavior

How We Use It
• To provide and personalize services
• To process payments & orders
• To recommend products/content
• To communicate updates, promotions, support
• To detect fraud and ensure security

Your Rights
• Access or correct your personal data
• Request deletion (with certain limitations)
• Object to certain processing
• Withdraw consent where applicable

Contact: info.lilyshops@gmail.com`,
      },
      {
        title: "Terms & Conditions",
        content: `LilyShops – Terms & Conditions

Acceptance By using LilyShops, you agree to these terms.

Account & Eligibility
• Must provide accurate, up-to-date info
• You're responsible for your account and password

Vendor Responsibilities
• Provide accurate product information
• Fulfill orders honestly and timely
• Comply with local laws and tax obligations

Commission & Payments
• LilyShops takes a 10% commission on each sale and subscription fess
• Payment held in escrow until confirmation (for shop from feed) 
while restaurants for food subscription gets their money instantly 
• Vendors may withdraw net earnings

Content & Intellectual Property
• You own what you post, but grant LilyShops a license to display it
• No posting of illegal, infringing, or harmful content`,
      },
      {
        title: "Help Center / Contact Us",
        content: `Need Help? We're Here for You

If you have questions, concerns, or feedback:
• Email:  info.lilyshops@gmail.com
• In-app support / ticket system
• FAQs in our Help Center
• Report problems, content issues, or violations

We aim to respond to all inquiries within 48 hours.`,
      },
      {
        title: "FAQ",
        content: `Frequently Asked Questions

        Q: How do I sign up as a restaurant?
A: You signup and login as a restaurant by navigating to food 

Q: What is the food subscription?
A: The food subscription feature is a feature where users can subscribe for
 food to any restaurant or food vendor, and get your food daily without any stress.

Q: How do I buy using "Shop from Feed"?
A: Tap "Buy Now" on a post with a product, confirm checkout, and your order will be processed.

Q: How much commission do you charge vendors?
A: We charge a 10% commission per successful sale.

Q: When can I withdraw money from my vendor wallet?
A:  Anytime, you can request withdrawal to your bank.  

Q: Can I post content without selling?
A: Yes — you can post purely social content without a "Buy Now" CTA.

Q: What if a buyer claims non-receipt?
A: We hold payment in escrow until confirmation. Disputes are resolved via our support process.

Q: How do referral & affiliate programs work?
A: You share your referral link. When someone signs up & buys, you earn a reward. Affiliates earn commission when their promoted product sells.`,
      },
      {
        title: "Features",
        content: `What LilyShops Offers

• Shop from Feed: buy directly from posts
⁠• Food subscription: users can subscribe weekly or monthly instead of
 buying food daily or paying for daily ordering.
• Content-first experience: browse, scroll, shop
• Wallet & escrow: safe and secure payments
• Nearby / Local discovery: see vendors near you
• Ratings & feedback: trust through reviews
• Shop: create shops

Upcoming features: chatrooms and live.`,
      },
      {
        title: "News",
        content: `Stay Updated

Here you'll find the latest updates, product launches, feature announcements, partnerships, and press coverage from LilyShops.`,
      },
      {
        title: "Report a Problem / Safety Center",
        content: `Help Us Keep LilyShops Safe

If you see anything inappropriate, fraudulent, or harmful:
• Use "Report" buttons in-app
• Submit via support contact
• Provide order ID, screenshots, user details
• We review and take action (warning, suspension)

We are committed to user safety and integrity.`,
      },
      {
        title: "Referral & Affiliate Program",
        content: `Earn by Sharing

• Every user gets a unique referral link
• When someone signs up and makes a purchase via your link, you earn a reward
• Affiliates can pick products to promote; when they sell, they earn commission

Terms and thresholds apply; your affiliate balance must meet minimum of ₦1000 before withdrawal.`,
      },
      {
        title: "How LilyShops Works",
        content: `In 6 Steps

1. You scroll your feed
2. You see a product with "Buy Now"
3. Tap it → view product summary → proceed to checkout
4. Payment held in escrow
5. Vendor fulfills order
6. Buyer confirms receipt → funds released
7. You click on ‘Food’ 
8. ⁠You subscribe and get unlimited food for the week
9. ⁠Vendors get payment and withdraw to their account 
10. ⁠It's seamless, entertaining, social, and safe.

It's seamless, entertaining, social, and safe.`,
      },
      {
        title: "LilyShops Advertising",
        content: `Promote Your Brand to Users

• Sponsored posts appear in user feeds
• Target by location, interest, behavior
• Pay per impression, click, or conversion
• We also offer affiliate tie-ins and co-branded campaigns

Contact "info.lilyshops@gmail.com" for more media kits and rates.`,
      },
      {
        title: "Monetization",
        content: `How LilyShops Earns

• 10% Commission from every sale
• Advertising revenue from brands
• Featured / sponsored posts
• Transaction fees and premium features, 
We aim for fair rates that let vendors and creators thrive.`,
      },
      {
        title: "Our Story",
        content: `From Vision to Revolution

LilyShops began as a dream: to break down the line between browsing and buying.
 We envisioned a future where commerce isn't separate — it's part of life, part of scrolls.
  With a small team, we built a social-commerce platform where every post could be a shop and every subscription could feed a nation. .
   We're here to celebrate creators, empower vendors, and make everyday user a joyful and entertaining experience.`,
      },
      {
        title: "Refund & Return Policy",
        content: `Lilyshops Refund & Return Policy

1. Returns Eligibility:
   • Items must be reported within 24 hours of delivery
   • Only applies to wrong, damaged, expired, or missing items
   • Perishable food must be returned unopened and untampered

2. How to Report:
   • Go to the order under "My Orders" > tap "Request Refund"
   • Upload clear pictures or videos for evidence
   • Describe the issue

3. Refund Type:
   • Wallet credit (within 48 hrs), or
   • Bank refund (within 3–5 business days, if eligible)

4. Non-Returnable Items:
   • Opened food items, worn clothes, and services

This protects users while keeping things simple and fair for vendors.`,
      },
    ],
  };

  const navigate = useNavigate();

  return (
    <section className=" min-h-screen flex flex-col px-4 md:px-7 gap-8 max-w-4xl mx-auto overflow-hidden">
      {/* Header - Matching Wallet styling */}
      <header className="flex items-center justify-center py-4  relative">
        <Link
          onClick={() => {
            navigate(-1);
          }}
          className="absolute left-4 top-4"
        >
          <ChevronLeft className="w-8 h-8 text-gray-700" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">About Us</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        {/* All sections have the same consistent styling */}
        {aboutContent.sections.map((section, index) => (
          <div
            key={index}
            className="shadow border cursor-pointer rounded-2xl bg-white"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center gap-6 px-5 py-4 text-left"
            >
              <div className="flex-1">
                <h3 className="font-bold text-base text-gray-800">
                  {section.title}
                </h3>
              </div>
              <div>
                {expandedSections[section.title] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>

            {expandedSections[section.title] && (
              <div className="px-5 pb-4 border-t border-gray-200 mt-2">
                <div className="text-gray-600 text-sm whitespace-pre-line pt-3 leading-relaxed">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Contact Info Section - Same styling as others */}
        <div className="shadow border rounded-2xl bg-white px-5 py-4">
          <h3 className="font-bold text-base text-gray-800 mb-2">
            Need More Help?
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Can't find what you're looking for? Reach out to our support team.
          </p>
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <span>📧</span>
            <span> info.lilyshops@gmail.com</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

