import { Edit2 } from "lucide-react";
import PropTypes from "prop-types";

const AccountInput = ({
  value,
  label,
  type = "text",
  editField,
  fieldName,
  tempValue,
  onEdit,
  onSave,
  onChange,
  placeholder = "",
  maxLength = 40,
  children,
}) => {
  return (
    <div className="flex items-center justify-between shadow border px-5 py-4 rounded-2xl">
      {editField === fieldName ? (
        <>
          {type === "textarea" ? (
            <textarea
              value={tempValue}
              onChange={onChange}
              className="border rounded px-2 py-1 text-sm w-full"
              maxLength={maxLength}
              placeholder={placeholder}
            />
          ) : type === "select" ? (
            children
          ) : (
            <input
              type={type}
              value={tempValue}
              onChange={onChange}
              className="border rounded px-2 py-1 text-sm"
              maxLength={maxLength}
              placeholder={placeholder}
            />
          )}
          <button
            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
            onClick={() => onSave(fieldName)}>
            Save
          </button>
        </>
      ) : (
        <>
          <span className="text-gray-500 text-sm">{value || `Add ${label}`}</span>
          <button
            className="ml-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
            onClick={() => onEdit(fieldName)}
            title={`Edit ${label}`}>
            <Edit2 className="text-gray-700" size={16} />
          </button>
        </>
      )}
    </div>
  );
};

AccountInput.propTypes = {
  icon: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  label: PropTypes.string,
  type: PropTypes.string,
  editField: PropTypes.string,
  fieldName: PropTypes.string,
  tempValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onEdit: PropTypes.func,
  onSave: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  children: PropTypes.node,
};

export default AccountInput;
