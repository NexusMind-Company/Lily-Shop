import { Info } from "lucide-react";
import PropTypes from "prop-types";

/**
 * HelpSection component for displaying help information with a link.
 * @param {Object} props - The component props.
 * @param {string} props.message - The help message text.
 * @param {string} props.linkText - The text for the link.
 * @param {string} props.linkHref - The href for the link.
 */
const HelpSection = ({ message, linkText, linkHref }) => {
  return (
    <div className="mt-8 flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 dark:bg-primary/5 border border-primary/10">
     <Info/>
      <p className="text-sm font-medium text-[#111813] dark:text-gray-300">
        {message}{" "}
        <a className="text-primary hover:underline font-bold" href={linkHref}>
          {linkText}
        </a>
      </p>
    </div>
  );
};

HelpSection.propTypes = {
  message: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
  linkHref: PropTypes.string.isRequired,
};

export default HelpSection;
