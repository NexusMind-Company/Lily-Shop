
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

const Followers = () => {
  const followers = [
    { name: "Ifedalapo Oyelewo", username: "@ifeO", img: "/avatar1.png" },
    { name: "Chukwuma Madaubuchi", username: "@ChuckZ", img: "/avatar2.png" },
    { name: "Tonbara Ekisagha", username: "@Tonek", img: "/avatar3.png" },
    { name: "Kehinde Olaniyan", username: "@olak", img: "/avatar4.png" },
    { name: "Ogechi Ezeoke", username: "@Ezechii", img: "/avatar5.png" },
    { name: "Chukwuma Madaubuchi", username: "@ChuckZ", img: "/avatar2.png" },
    { name: "Tonbara Ekisagha", username: "@Tonek", img: "/avatar3.png" },
    { name: "Kehinde Olaniyan", username: "@olak", img: "/avatar4.png" },
    { name: "Ogechi Ezeoke", username: "@Ezechii", img: "/avatar5.png" },
    { name: "Chukwuma Madaubuchi", username: "@ChuckZ", img: "/avatar2.png" },
    { name: "Tonbara Ekisagha", username: "@Tonek", img: "/avatar3.png" },
    { name: "Kehinde Olaniyan", username: "@olak", img: "/avatar4.png" },
    { name: "Ogechi Ezeoke", username: "@Ezechii", img: "/avatar5.png" },
  ];

  const navigate = useNavigate()

  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <ChevronLeft size={30} className="mr-3"onClick={() => {navigate(-1)}} />
        <h2 className="font-semibold text-lg flex-1 text-center">
          Followers (120)
        </h2>
      </div>

      {/* List */}
      <div className="mt-3">
        {followers.map((user, i) => (
          <div
            key={i}
            className="flex items-center px-4 py-3"
          >
            <img
              src={user.img}
              alt={user.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Followers;
