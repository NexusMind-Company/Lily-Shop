const products = [
  {
    id: 1,
    name: "Jacob's Frosty",
    category: "Ice Cream",
    image: "/jacob.jpeg",
    contact: "08012345678",
    shortDescription:
      "Serving up creamy, handcrafted ice cream in a variety of delicious flavors",
    address: "23 Marina Street, Calabar, Cross River State, Nigeria",
    productItems: [
      {
        id: 101,
        name: "Vanilla Swirl",
        price: "₦1,500",
        image: "/vanilla.jpeg",
        description: "Classic creamy vanilla ice cream made with real vanilla beans",
      },
      {
        id: 102,
        name: "Chocolate Delight",
        price: "₦1,800",
        image: "/chocolate.jpeg",
        description: "Rich and creamy chocolate ice cream for chocolate lovers",
      },
    ],
  },
  {
    id: 2,
    name: "Aubergint",
    category: "Fresh Food",
    image: "/auber.jpeg",
    contact: "08012345678",
    shortDescription: "Fresh, affordable, and always stocked",
    address: "15 Oladipo Avenue, Ikeja, Lagos State, Nigeria",
    productItems: [
      {
        id: 201,
        name: "Organic Tomatoes",
        price: "₦500/kg",
        image: "/tomatoes.jpeg",
        description: "Fresh organic tomatoes directly from the farm",
      },
      {
        id: 202,
        name: "Green Peppers",
        price: "₦800/kg",
        image: "/peppers.jpeg",
        description: "Crisp and fresh green peppers for your cooking needs",
      },
    ],
  },
  {
    id: 3,
    name: "Elite Clippers",
    category: "Barbershop",
    image: "/elite.jpeg",
    contact: "08012345678",
    shortDescription:
      "Step into Elite Clippers for the freshest fades and sharpest trims",
    address: "28 Adebola Street, Surulere, Lagos State, Nigeria",
    productItems: [
      {
        id: 301,
        name: "Regular Haircut",
        price: "₦2,000",
        image: "/haircut.jpeg",
        description: "Standard men’s haircut with a professional touch",
      },
      {
        id: 302,
        name: "Beard Trim",
        price: "₦1,500",
        image: "/beard.jpeg",
        description: "Sharp and clean beard trim to keep you looking fresh",
      },
    ],
  },
  {
    id: 4,
    name: "Mkzay's Consortium",
    category: "Antiques",
    image: "/jacob.jpeg",
    contact: "08012345678",
    shortDescription:
      "Explore our collection of rare and classic antiques from different eras",
    address: "23 Marina Street, Calabar, Cross River State, Nigeria",
    productItems: [
      {
        id: 401,
        name: "Victorian Vase",
        price: "₦50,000",
        image: "/vase.jpeg",
        description: "Elegant handcrafted Victorian-era porcelain vase",
      },
      {
        id: 402,
        name: "Antique Clock",
        price: "₦80,000",
        image: "/clock.jpeg",
        description: "Classic wooden antique clock from the 19th century",
      },
    ],
  },
];

export default products;
