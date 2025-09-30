/* eslint-disable react/prop-types */
const messages = [
  {
    id: 1,
    name: "JACOB’S FROSTY",
    lastMessage: "You should see the bike man soon",
    time: "7:00 pm",
    unread: true,
  },
  {
    id: 2,
    name: "Customer 1",
    lastMessage: "Hello, I'm still waiting on my order",
    time: "7:00 pm",
    unread: true,
  },
  {
    id: 3,
    name: "ELITE CLIPPER’S",
    lastMessage: "An appointment will be made for 7pm",
    time: "7:00 pm",
    unread: true,
  },
  {
    id: 4,
    name: "JACOB’S FROSTY",
    lastMessage: "Okay",
    time: "7:00 pm",
    unread: false,
  },
];

export default function MessageList({ openChat }) {
  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          My <span className="text-lily">Messages</span>
        </h1>
      </div>
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 pl-5 mb-4 border-2 rounded-full hover:border-lily outline-none"
      />
      {messages.map((chat) => (
        <div
          key={chat.id}
          className="flex items-center justify-between p-1 cursor-pointer w-full"
          onClick={() => openChat(chat)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-400"></div>
            <div>
              <h3 className="font-semibold">{chat.name}</h3>
              <p className="text-ash text-sm">{chat.lastMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-ash text-sm">{chat.time}</p>
            {chat.unread && <span className="text-red-500 text-xs">🔴</span>}
          </div>
        </div>
      ))}
    </section>
  );
}
