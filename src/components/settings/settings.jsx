import { settingsData } from "./settingsData";
import { Link } from "react-router-dom";
const Settings = () => {
  return (
    <section className="mt-28 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="w-full ">
        <div className="rounded-2xl border-[1px] border-solid border-black  h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">Settings</h1>
        </div>
      </div>

      {/*  */}
      <div className="h-16 w-full flex items-center gap-3.5 my-5">
        <img src="./profile-icon.svg" alt="" className="w-[70px] h-[70px] rounded-full" />
        <h3 className="font-bold text-lg">Jacob&apos;s Frosty</h3>
      </div>

      {/* settings  Items*/}
      {settingsData.map((settingData) => {
        const itemContent = (
          <div className="h-16 w-full flex items-center gap-7 mb-3">
            <div className="relative">
              <img src={settingData.icon} alt={settingData.title} className="h-10 w-10" />
              {(settingData.title === "Messages" || settingData.title === "Notifications") &&
                settingData.badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full px-2 py-0.5">
                    {settingData.badgeCount}
                  </span>
                )}
            </div>
            <div>
              <h3 className="font-bold">{settingData.title}</h3>
              <p className="">{settingData.description}</p>
            </div>
          </div>
        );
        return settingData.title === "Messages" ? (
          <Link to="/messages" key={settingData.id}>
            {itemContent}
          </Link>
        ) : (
          <div key={settingData.id}>{itemContent}</div>
        );
      })}

    </section>
  );
};

export default Settings;
