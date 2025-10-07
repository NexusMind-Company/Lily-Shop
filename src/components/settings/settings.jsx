import { settingsData } from "./settingsData";
import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <section className="my-14 min-h-screen flex flex-col px-4 md:px-7 gap-8 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="w-full ">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">Settings</h1>
        </div>
      </div>

      {/* Person Profile */}
      <div className="flex items-center gap-5 my-6 shadow border cursor-pointer px-5 py-4 rounded-2xl">
        <img
          src="./profile-icon.svg"
          alt=""
          className="w-[70px] h-[70px] rounded-full border-4 border-gray-200 shadow"
        />
        <div>
          <h3 className="font-bold text-xl text-gray-800">Jacob&apos;s Frosty</h3>
        </div>
      </div>

      {/* Settings Items with conditional links */}
      <div className="flex flex-col gap-4">
        {settingsData.map((settingData) => {
          const itemContent = (
            <div className="flex items-center gap-6 shadow border cursor-pointer px-5 py-4 rounded-2xl">
              <div className="relative">
                {settingData.icon}
                {(settingData.title === "Messages" ||
                  settingData.title === "Notifications") &&
                  settingData.badgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {settingData.badgeCount}
                    </span>
                  )}
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-800">{settingData.title}</h3>
                <p className="text-gray-500 text-sm">{settingData.description}</p>
              </div>
            </div>
          );

          if (settingData.title === "Messages") {
            return (
              <Link to="/messages" key={settingData.id} className="block">
                {itemContent}
              </Link>
            );
          }
          if (settingData.title === "Notifications") {
            return (
              <Link to="/notifications" key={settingData.id} className="block">
                {itemContent}
              </Link>
            );
          }
          if (settingData.title === "Account") {
            return (
              <Link to="/account" key={settingData.id} className="block">
                {itemContent}
              </Link>
            );
          }
          if (settingData.title === "Wallet") {
            return (
              <Link to="/wallet" key={settingData.id} className="block">
                {itemContent}
              </Link>
            );
          }
              if (settingData.title === "About") {
            return (
              <Link to="/about" key={settingData.id} className="block">
                {itemContent}
              </Link>
            );
          }
          return <div key={settingData.id}>{itemContent}</div>;
        })}
      </div>
    </section>
  );
};

export default Settings;