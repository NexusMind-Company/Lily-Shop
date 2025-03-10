const Settings = () => {
  return (
    <section className="mt-10 flex flex-col gap-7 min-h-screen max-w-3xl mx-auto">
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
