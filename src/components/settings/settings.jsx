const Settings = () => {
  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="px-7 w-full ">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">Settings</h1>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="text-center flex items-center justify-between m-auto max-w-2xl px-5">
        <h2 className="font-poppins font-medium text-2xl md:text-4xl leading-[1.3]">
          Stay Tuned for <br className="hidden md:block" /> Version Two
        </h2>
      </div>
    </section>
  );
};

export default Settings;
