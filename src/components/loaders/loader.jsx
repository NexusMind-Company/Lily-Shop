const Loader = () => {
  return (
    <div className="flex absolute top-[60%] right-[40%] md:top-[50%]  md:right-[50%] items-center justify-center">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-lily rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-lily rounded-full animate-bounce delay-200"></div>
        <div className="w-3 h-3 bg-lily rounded-full animate-bounce delay-400"></div>
      </div>
    </div>
  );
};

export default Loader;
