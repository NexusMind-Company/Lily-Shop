import { useNavigate } from "react-router-dom";
import { Phone, Mail, User, Key, Calendar, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Acc = () => {
  const navigate = useNavigate();

  const items = [
    { icon: <Phone size={30} />, text: "Phone number", sub: "+234 808080808", to: "/ChangePhone" },
    { icon: <Mail size={30} />, text: "Email", sub: "johndoe@gmail.com", },
    { icon: <User size={30} />, text: "Username", sub: "JohnDoe", to: "/ChangeUsername" },
    { icon: <Key size={30} />, text: "Change password", sub: "Change your password", to: "/ChangePassword" },
    { icon: <Calendar size={30} />, text: "Date of birth", sub: "02/10/2000", to: "/ChangeDOB" },
    { icon: <Trash2 size={30} />, text: "Delete account", sub: "Delete your account", to: "/DeleteAccount" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={30} className="mr-3" />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center">Account</h2>
      </div>

      <div className="mt-4">
        {items.map((item, i) =>
          item.to ? (
            <Link
              to={item.to}
              key={i}
              className="flex px-4 py-3 items-center"
            >
              <div className="mr-3">{item.icon}</div>
              <div className="flex-1">
                <p className="pb-1">{item.text}</p>
                <p className="">{item.sub}</p>
              </div>
              <ChevronRight size={30} />
            </Link>
          ) : (
            <div
              key={i}
              className="flex px-4 py-3 items-center"
            >
              <div className="mr-3">{item.icon}</div>
              <div className="flex-1">
                <p className="pb-1">{item.text}</p>
                <p className="">{item.sub}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Acc;