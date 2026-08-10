const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categories = [
  { name: "Adventure", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200" },
  { name: "Beach & Islands", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200" },
  { name: "Cultural & Heritage", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200" },
  { name: "Mountain & Trekking", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200" },
  { name: "Wildlife Safari", imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200" },
  { name: "City Breaks", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200" },
];

const tours = [
  {
    title: "Bali Volcano & Rice Terrace Adventure",
    category: "Adventure",
    location: "Ubud, Bali, Indonesia",
    price: 749,
    durationDays: 6,
    difficulty: "MODERATE",
    maxGroupSize: 12,
    featured: true,
    summary: "Sunrise volcano trek, Tegallalang rice terraces, and white-water rafting through the jungle.",
    description:
      "Spend six days exploring Bali beyond the beach resorts: hike to the summit of Mount Batur for sunrise, wander the emerald tiers of the Tegallalang rice terraces, raft the Ayung River, and cool off at the Tibumana waterfall. Evenings are spent in Ubud with a traditional Balinese dance performance and a home-hosted dinner with a local family.",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
      "https://images.unsplash.com/photo-1531592937781-344ad608fabf?w=1200",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200",
    ],
    included: ["5 nights boutique hotel", "Daily breakfast", "All ground transport", "English-speaking guide", "Entrance fees"],
    excluded: ["International flights", "Travel insurance", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Arrival in Ubud", description: "Airport pickup, welcome dinner, and orientation walk through central Ubud." },
      { day: 2, title: "Mount Batur Sunrise Trek", description: "Pre-dawn hike to the summit for sunrise, breakfast cooked in volcanic steam." },
      { day: 3, title: "Rice Terraces & Waterfalls", description: "Tegallalang rice terraces, Tibumana waterfall, and a coffee plantation tour." },
      { day: 4, title: "Ayung River Rafting", description: "Grade II-III white-water rafting followed by a spa afternoon." },
      { day: 5, title: "Temples & Culture", description: "Tirta Empul water temple and an evening traditional dance performance." },
      { day: 6, title: "Departure", description: "Free morning for souvenir shopping before airport transfer." },
    ],
  },
  {
    title: "Santorini Sunset Sailing Escape",
    category: "Beach & Islands",
    location: "Santorini, Greece",
    price: 1190,
    durationDays: 5,
    difficulty: "EASY",
    maxGroupSize: 10,
    featured: true,
    summary: "Caldera-view stays, a private catamaran cruise, and the best sunset in the Aegean.",
    description:
      "Five relaxed days on Santorini split between Oia and Fira: swim at the Red and White beaches, sail the caldera on a private catamaran with a barbecue lunch, taste volcanic-soil wines at a family-run winery, and watch the world-famous Oia sunset from a cliffside terrace.",
    images: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200",
      "https://images.unsplash.com/photo-1551009175-15bdf9dcb580?w=1200",
    ],
    included: ["4 nights caldera-view hotel", "Catamaran cruise with lunch", "Wine tasting", "Airport transfers"],
    excluded: ["Flights to Santorini", "Lunches on land days", "Gratuities"],
    itinerary: [
      { day: 1, title: "Arrival in Fira", description: "Check-in and a sunset welcome dinner overlooking the caldera." },
      { day: 2, title: "Oia & the Red Beach", description: "Morning at the Red Beach, afternoon exploring Oia's blue-domed churches." },
      { day: 3, title: "Catamaran Caldera Cruise", description: "Full-day sailing with swim stops, BBQ lunch onboard, and hot springs." },
      { day: 4, title: "Wine & Villages", description: "Volcanic vineyard tasting and a walk through Pyrgos village." },
      { day: 5, title: "Departure", description: "Free morning before transfer to the airport or port." },
    ],
  },
  {
    title: "Kyoto Temples & Tea Ceremony Journey",
    category: "Cultural & Heritage",
    location: "Kyoto, Japan",
    price: 1450,
    durationDays: 7,
    difficulty: "EASY",
    maxGroupSize: 8,
    featured: true,
    summary: "Bamboo groves, geisha districts, a private tea ceremony, and a day trip to Nara's deer park.",
    description:
      "Seven days immersed in Japan's cultural capital: walk the Arashiyama bamboo grove at dawn, explore Fushimi Inari's thousand torii gates, learn the art of tea from a certified tea master, wander Gion's lantern-lit streets, and take a day trip to Nara to meet the free-roaming deer.",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1200",
    ],
    included: ["6 nights ryokan & hotel", "JR rail pass", "Tea ceremony", "Daily breakfast", "Local guide"],
    excluded: ["International flights", "Some dinners", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival in Kyoto", description: "Check-in and evening stroll through Gion." },
      { day: 2, title: "Arashiyama Bamboo Grove", description: "Dawn walk through the bamboo grove, Tenryu-ji temple gardens." },
      { day: 3, title: "Fushimi Inari & Tea Ceremony", description: "Thousand torii gates hike, afternoon private tea ceremony." },
      { day: 4, title: "Nara Day Trip", description: "Deer park, Todai-ji temple, and Nara's giant Buddha." },
      { day: 5, title: "Kinkaku-ji & Nishiki Market", description: "Golden Pavilion visit and a food tour through Nishiki Market." },
      { day: 6, title: "Ryokan & Onsen", description: "Relocate to a traditional ryokan for a hot-spring evening." },
      { day: 7, title: "Departure", description: "Free morning before transfer to Kansai airport." },
    ],
  },
  {
    title: "Swiss Alps Via Ferrata & Glacier Trek",
    category: "Mountain & Trekking",
    location: "Zermatt, Switzerland",
    price: 1980,
    durationDays: 8,
    difficulty: "CHALLENGING",
    maxGroupSize: 8,
    featured: false,
    summary: "Alpine via ferrata routes, a glacier crossing, and views of the Matterhorn from base camp.",
    description:
      "An eight-day mountaineering itinerary for experienced hikers: acclimatize in Zermatt, tackle two via ferrata routes with certified guides, cross the Gorner Glacier on a roped trek, and summit a 3,800m viewpoint for a full panorama of the Matterhorn.",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
      "https://images.unsplash.com/photo-1502786129293-79981fef0f0a?w=1200",
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200",
    ],
    included: ["7 nights mountain lodge", "Certified mountain guide", "Via ferrata & glacier gear", "Half-board meals"],
    excluded: ["Flights to Zurich/Geneva", "Personal hiking boots", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival & Acclimatization", description: "Transfer to Zermatt, gear check, and an easy valley walk." },
      { day: 2, title: "Gornergrat Ridge Hike", description: "Train up to Gornergrat, ridge walk with Matterhorn views." },
      { day: 3, title: "Via Ferrata Route One", description: "Introductory via ferrata with a certified guide." },
      { day: 4, title: "Rest & Skills Day", description: "Glacier travel and rope skills briefing." },
      { day: 5, title: "Gorner Glacier Crossing", description: "Full-day roped glacier trek." },
      { day: 6, title: "Via Ferrata Route Two", description: "Advanced exposed route with suspension bridge crossing." },
      { day: 7, title: "Summit Viewpoint", description: "Push to the 3,800m viewpoint for panoramic Matterhorn views." },
      { day: 8, title: "Departure", description: "Transfer back to Zurich or Geneva airport." },
    ],
  },
  {
    title: "Serengeti & Ngorongoro Safari",
    category: "Wildlife Safari",
    location: "Serengeti, Tanzania",
    price: 2650,
    durationDays: 6,
    difficulty: "MODERATE",
    maxGroupSize: 6,
    featured: true,
    summary: "Big Five game drives across the Serengeti plains and the Ngorongoro crater floor.",
    description:
      "Six days in a custom 4x4 following the wildlife of northern Tanzania: track lion prides and elephant herds across the Serengeti plains, descend into the Ngorongoro Crater for a full-day game drive on its crater floor, and spend nights at tented camps under the stars.",
    images: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200",
      "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200",
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200",
    ],
    included: ["5 nights tented safari camp", "All game drives", "Park & conservation fees", "Full board meals"],
    excluded: ["International flights", "Visa fees", "Gratuities for guides"],
    itinerary: [
      { day: 1, title: "Arrival in Arusha", description: "Transfer to Arusha, briefing dinner with your safari guide." },
      { day: 2, title: "Into the Serengeti", description: "Drive to the Serengeti with game viewing en route." },
      { day: 3, title: "Full-Day Game Drive", description: "Dawn-to-dusk game drive tracking the Big Five." },
      { day: 4, title: "Serengeti to Ngorongoro", description: "Transfer to the crater rim, sunset viewpoint stop." },
      { day: 5, title: "Ngorongoro Crater Floor", description: "Full-day descent into the crater for dense wildlife viewing." },
      { day: 6, title: "Departure", description: "Morning game drive before transfer to Kilimanjaro airport." },
    ],
  },
  {
    title: "Paris Icons & Louvre Insider Tour",
    category: "City Breaks",
    location: "Paris, France",
    price: 890,
    durationDays: 4,
    difficulty: "EASY",
    maxGroupSize: 14,
    featured: false,
    summary: "Skip-the-line Louvre and Eiffel Tower access, a Seine dinner cruise, and Montmartre by night.",
    description:
      "A fast-paced long weekend covering Paris's essentials: skip-the-line entry to the Louvre with an art-historian guide, sunset ascent of the Eiffel Tower, a dinner cruise along the Seine, and an evening exploring Montmartre's cobbled streets and cabarets.",
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
      "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=1200",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200",
    ],
    included: ["3 nights central hotel", "Skip-the-line Louvre & Eiffel Tower", "Seine dinner cruise", "Metro pass"],
    excluded: ["Flights", "Lunches", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival & Montmartre", description: "Check-in, evening walk through Montmartre and Sacre-Coeur." },
      { day: 2, title: "Louvre & Tuileries", description: "Guided Louvre tour and a stroll through the Tuileries Garden." },
      { day: 3, title: "Eiffel Tower & Seine Cruise", description: "Sunset tower visit followed by a dinner cruise on the Seine." },
      { day: 4, title: "Departure", description: "Free morning near Champs-Elysees before departure." },
    ],
  },
  {
    title: "Machu Picchu Inca Trail Trek",
    category: "Mountain & Trekking",
    location: "Cusco, Peru",
    price: 1690,
    durationDays: 7,
    difficulty: "CHALLENGING",
    maxGroupSize: 10,
    featured: true,
    summary: "The classic four-day Inca Trail trek ending at Machu Picchu through the Sun Gate.",
    description:
      "Acclimatize in Cusco's Sacred Valley before setting out on the classic four-day, three-night Inca Trail: cloud forest, Andean passes above 4,200m, and remote Inca ruins, arriving at Machu Picchu through the Sun Gate at sunrise on the final morning.",
    images: [
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200",
      "https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?w=1200",
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200",
    ],
    included: ["Sacred Valley acclimatization", "Permits & trekking crew", "All camping gear", "Machu Picchu entrance"],
    excluded: ["Flights to Cusco", "Sleeping bag rental", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival in Cusco", description: "Acclimatization day exploring the city center." },
      { day: 2, title: "Sacred Valley", description: "Pisac ruins, local market, and Ollantaytambo fortress." },
      { day: 3, title: "Trail Day 1", description: "Start the Inca Trail through the Urubamba valley." },
      { day: 4, title: "Trail Day 2", description: "Cross Dead Woman's Pass at 4,215m." },
      { day: 5, title: "Trail Day 3", description: "Cloud forest ruins of Phuyupatamarca and Wiñay Wayna." },
      { day: 6, title: "Machu Picchu Sunrise", description: "Arrive through the Sun Gate at dawn, guided site tour." },
      { day: 7, title: "Departure", description: "Train back to Cusco and transfer to the airport." },
    ],
  },
  {
    title: "Maldives Overwater Escape",
    category: "Beach & Islands",
    location: "South Male Atoll, Maldives",
    price: 2290,
    durationDays: 5,
    difficulty: "EASY",
    maxGroupSize: 6,
    featured: true,
    summary: "Overwater villa stay with a private snorkeling excursion and a sunset dolphin cruise.",
    description:
      "Five days of pure relaxation in an overwater villa: snorkel a private house reef teeming with reef sharks and turtles, take a sunset dolphin cruise, enjoy a private sandbank picnic, and unwind with an open-air spa treatment above the lagoon.",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200",
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200",
    ],
    included: ["4 nights overwater villa", "Speedboat transfers", "Snorkeling excursion", "Daily breakfast"],
    excluded: ["International flights", "Spa treatments", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Arrival", description: "Speedboat transfer to the resort, welcome drink and villa check-in." },
      { day: 2, title: "House Reef Snorkeling", description: "Guided snorkeling excursion on the private house reef." },
      { day: 3, title: "Sandbank Picnic", description: "Private picnic lunch on a nearby uninhabited sandbank." },
      { day: 4, title: "Dolphin Sunset Cruise", description: "Evening cruise to spot spinner dolphins at sunset." },
      { day: 5, title: "Departure", description: "Final morning at leisure before the speedboat transfer." },
    ],
  },
  {
    title: "Petra & Wadi Rum Desert Expedition",
    category: "Cultural & Heritage",
    location: "Petra, Jordan",
    price: 1120,
    durationDays: 6,
    difficulty: "MODERATE",
    maxGroupSize: 12,
    featured: false,
    summary: "The rose-red city of Petra by day and night, plus a Bedouin camp under the Wadi Rum stars.",
    description:
      "Six days across Jordan's most iconic landscapes: walk the Siq into Petra to see the Treasury at sunrise, return for the candlelit Petra by Night experience, 4x4 across the red dunes of Wadi Rum, and sleep in a traditional Bedouin desert camp.",
    images: [
      "https://images.unsplash.com/photo-1544298621-35a1b3e0c6c9?w=1200",
      "https://images.unsplash.com/photo-1580835786806-8865c8aa3f88?w=1200",
      "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1200",
    ],
    included: ["5 nights hotel & desert camp", "Petra by Night ticket", "4x4 Wadi Rum tour", "Daily breakfast"],
    excluded: ["Flights to Amman", "Jordan Pass visa fee", "Lunches"],
    itinerary: [
      { day: 1, title: "Arrival in Amman", description: "Transfer to Amman, city orientation walk." },
      { day: 2, title: "Drive to Petra", description: "Scenic drive along the King's Highway, evening at leisure." },
      { day: 3, title: "Petra by Day", description: "Full-day exploring the Siq, Treasury, and Monastery." },
      { day: 4, title: "Petra by Night", description: "Free morning, candlelit Petra by Night in the evening." },
      { day: 5, title: "Wadi Rum Desert", description: "4x4 desert safari and overnight in a Bedouin camp." },
      { day: 6, title: "Departure", description: "Transfer back to Amman for departure." },
    ],
  },
  {
    title: "Icelandic Ring Road Northern Lights",
    category: "Adventure",
    location: "Reykjavik, Iceland",
    price: 2150,
    durationDays: 7,
    difficulty: "MODERATE",
    maxGroupSize: 10,
    featured: false,
    summary: "Waterfalls, glacier hikes, black-sand beaches, and nightly aurora hunting along the Ring Road.",
    description:
      "A seven-day loop around Iceland's Ring Road: glacier hiking on Solheimajokull, the black sands of Reynisfjara, the geothermal Blue Lagoon, and nightly aurora-hunting stops whenever the skies cooperate, guided by a local aurora forecaster.",
    images: [
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200",
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200",
      "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1200",
    ],
    included: ["6 nights guesthouses", "4x4 transport & driver-guide", "Glacier hiking gear", "Blue Lagoon entry"],
    excluded: ["Flights to Reykjavik", "Some dinners", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival in Reykjavik", description: "Blue Lagoon soak and evening in Reykjavik." },
      { day: 2, title: "Golden Circle", description: "Geysir, Gullfoss waterfall, and Thingvellir National Park." },
      { day: 3, title: "South Coast Waterfalls", description: "Seljalandsfoss and Skogafoss waterfalls." },
      { day: 4, title: "Glacier Hike", description: "Guided ice-axe hike on Solheimajokull glacier." },
      { day: 5, title: "Black Sand Beaches", description: "Reynisfjara beach and basalt sea stacks." },
      { day: 6, title: "Aurora Hunting", description: "Free day with an evening aurora-hunting excursion." },
      { day: 7, title: "Departure", description: "Return drive to Reykjavik for departure." },
    ],
  },
  {
    title: "Bangkok Street Food & Temples",
    category: "City Breaks",
    location: "Bangkok, Thailand",
    price: 620,
    durationDays: 4,
    difficulty: "EASY",
    maxGroupSize: 14,
    featured: false,
    summary: "Grand Palace, floating markets, and an evening street-food crawl through Chinatown.",
    description:
      "Four fast, flavorful days in Bangkok: the Grand Palace and Wat Pho at sunrise before the crowds, a longtail boat through the Damnoen Saduak floating market, and a guided night-time street-food crawl through Yaowarat's Chinatown.",
    images: [
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200",
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200",
      "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=1200",
    ],
    included: ["3 nights central hotel", "Floating market boat tour", "Street food crawl", "Airport transfers"],
    excluded: ["Flights", "Lunches", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival & Chinatown", description: "Check-in, evening street-food crawl through Yaowarat." },
      { day: 2, title: "Grand Palace & Wat Pho", description: "Sunrise temple visits before the crowds arrive." },
      { day: 3, title: "Floating Market", description: "Longtail boat through Damnoen Saduak, afternoon at leisure." },
      { day: 4, title: "Departure", description: "Free morning near Sukhumvit before airport transfer." },
    ],
  },
  {
    title: "New York City Weekend Explorer",
    category: "City Breaks",
    location: "New York City, USA",
    price: 980,
    durationDays: 4,
    difficulty: "EASY",
    maxGroupSize: 14,
    featured: false,
    summary: "Statue of Liberty, Broadway, and a rooftop view from the Top of the Rock.",
    description:
      "Four days covering NYC's icons: a ferry out to the Statue of Liberty and Ellis Island, a Broadway show in the Theater District, a walk across the Brooklyn Bridge, and sunset views from the Top of the Rock observation deck.",
    images: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
      "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=1200",
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1200",
    ],
    included: ["3 nights Manhattan hotel", "Statue of Liberty ferry", "Broadway show ticket", "Top of the Rock entry"],
    excluded: ["Flights", "Meals", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival & Times Square", description: "Check-in, evening in Times Square." },
      { day: 2, title: "Statue of Liberty & Ellis Island", description: "Ferry tour and Lower Manhattan walk." },
      { day: 3, title: "Brooklyn Bridge & Top of the Rock", description: "Morning bridge walk, sunset skyline views." },
      { day: 4, title: "Departure", description: "Free morning before airport transfer." },
    ],
  },
];

const blogPosts = [
  {
    title: "10 Packing Mistakes First-Time Trekkers Make",
    author: "Priya Sharma",
    tags: ["packing", "trekking", "tips"],
    coverImage: "https://images.unsplash.com/photo-1516984782453-caab60c6c8de?w=1200",
    excerpt: "From cotton socks to overloaded first-aid kits, here's what to leave at home before your next trek.",
    content:
      "Every season we see the same packing mistakes at trailheads: cotton base layers that stay wet all day, brand-new boots worn for the first time on the trail, and duffel bags stuffed with items 'just in case.' This guide walks through the ten most common mistakes and what experienced trekkers pack instead, from merino layering systems to a genuinely minimal first-aid kit.",
  },
  {
    title: "How to Photograph the Northern Lights (Without a Tripod)",
    author: "Erik Johansson",
    tags: ["photography", "iceland", "aurora"],
    coverImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200",
    excerpt: "Chasing the aurora in Iceland taught us these camera settings and phone tricks for sharp night shots.",
    content:
      "You don't need a professional camera to capture the aurora borealis, but you do need to know a few settings. This post covers manual focus tricks for total darkness, the ISO/shutter-speed balance that avoids star trails, and how modern smartphone night modes handle the aurora surprisingly well when braced against a rock or railing.",
  },
  {
    title: "A Slow Traveler's Guide to Kyoto's Tea Culture",
    author: "Aiko Tanaka",
    tags: ["japan", "culture", "food"],
    coverImage: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1200",
    excerpt: "Beyond the temples, Kyoto's tea houses hold centuries of ritual worth slowing down for.",
    content:
      "Matcha in Kyoto is not just a drink, it's a 400-year-old ceremony built around mindfulness and hospitality. This piece traces the history of the Japanese tea ceremony, what to expect at a first-timer's session, and three tea houses in Kyoto's Gion and Uji districts where visitors can experience it respectfully.",
  },
  {
    title: "Is the Inca Trail Worth the Permit Wait?",
    author: "Marco Alvarez",
    tags: ["peru", "trekking", "planning"],
    coverImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200",
    excerpt: "Permits sell out months ahead. We compare the classic trail against three lesser-known alternatives.",
    content:
      "The classic Inca Trail limits permits to 500 people a day, and they often sell out four to six months in advance. This post breaks down what makes the classic route worth the planning headache, and profiles three alternative treks - Salkantay, Lares, and Choquequirao - for travelers who can't get a permit in time.",
  },
  {
    title: "Overwater Villa or Beach Bungalow? A Maldives Buyer's Guide",
    author: "Sofia Reyes",
    tags: ["maldives", "beach", "planning"],
    coverImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200",
    excerpt: "The honest tradeoffs between overwater villas and beach bungalows before you book your atoll escape.",
    content:
      "Overwater villas photograph beautifully, but beach bungalows often sit closer to the house reef and cost significantly less. This guide compares snorkeling access, privacy, price per night, and boat-transfer logistics across both room types so you can pick the right one for how you actually want to spend your days.",
  },
  {
    title: "Eating Bangkok: A Street-Food Crawl Itinerary",
    author: "Nutchanart Boon",
    tags: ["thailand", "food", "city"],
    coverImage: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200",
    excerpt: "Six stalls in Chinatown that show why Bangkok's street food earned a Michelin mention.",
    content:
      "Yaowarat Road transforms every evening into one of the densest concentrations of street food on the planet. This walking itinerary covers six stalls in order - starting with oyster omelets and ending with mango sticky rice - along with what to order, what it costs, and how to spot the stalls locals actually queue for.",
  },
];

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wanderly.com" },
    update: {},
    create: {
      name: "Amara Okafor",
      email: "admin@wanderly.com",
      passwordHash,
      role: "ADMIN",
      provider: "LOCAL",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@wanderly.com" },
    update: {},
    create: {
      name: "Diego Fernandez",
      email: "manager@wanderly.com",
      passwordHash,
      role: "MANAGER",
      provider: "LOCAL",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@wanderly.com" },
    update: {},
    create: {
      name: "Jamie Chen",
      email: "user@wanderly.com",
      passwordHash,
      role: "USER",
      provider: "LOCAL",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
    },
  });

  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: {},
      create: { name: cat.name, slug: slugify(cat.name), imageUrl: cat.imageUrl },
    });
    categoryMap[cat.name] = created.id;
  }

  const createdTours = [];
  for (const tour of tours) {
    const { category, ...data } = tour;
    const created = await prisma.tour.upsert({
      where: { slug: slugify(data.title) },
      update: {},
      create: {
        ...data,
        slug: slugify(data.title),
        categoryId: categoryMap[category],
        createdById: manager.id,
      },
    });
    createdTours.push(created);
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: slugify(post.title) },
      update: {},
      create: { ...post, slug: slugify(post.title) },
    });
  }

  // Seed a handful of bookings + reviews on the demo user so the dashboards and
  // analytics charts render real data instead of an empty state.
  const sampleTours = createdTours.slice(0, 4);
  for (let i = 0; i < sampleTours.length; i++) {
    const tour = sampleTours[i];
    const travelDate = new Date();
    travelDate.setMonth(travelDate.getMonth() + i + 1);

    await prisma.booking.upsert({
      where: { id: `seed-booking-${i}` },
      update: {},
      create: {
        id: `seed-booking-${i}`,
        userId: demoUser.id,
        tourId: tour.id,
        travelDate,
        participants: 2,
        totalPrice: tour.price * 2,
        status: i === sampleTours.length - 1 ? "PENDING" : "CONFIRMED",
      },
    });

    if (i < 2) {
      await prisma.review.upsert({
        where: { userId_tourId: { userId: demoUser.id, tourId: tour.id } },
        update: {},
        create: {
          userId: demoUser.id,
          tourId: tour.id,
          rating: 5 - i,
          comment:
            i === 0
              ? "Incredible trip from start to finish. The guides were knowledgeable and the itinerary struck a perfect balance of adventure and downtime."
              : "Beautiful scenery and well organized, though the group felt a little rushed on day two.",
        },
      });

      const agg = await prisma.review.aggregate({
        where: { tourId: tour.id },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await prisma.tour.update({
        where: { id: tour.id },
        data: { avgRating: agg._avg.rating || 0, reviewCount: agg._count.rating },
      });
    }
  }

  // Extra bookings across more tours/months so admin revenue & category charts have spread.
  const extraTours = createdTours.slice(4, 9);
  for (let i = 0; i < extraTours.length; i++) {
    const tour = extraTours[i];
    const travelDate = new Date();
    travelDate.setMonth(travelDate.getMonth() - i);

    await prisma.booking.upsert({
      where: { id: `seed-booking-extra-${i}` },
      update: {},
      create: {
        id: `seed-booking-extra-${i}`,
        userId: demoUser.id,
        tourId: tour.id,
        travelDate,
        participants: 1 + (i % 3),
        totalPrice: tour.price * (1 + (i % 3)),
        status: "CONFIRMED",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo credentials (password for all: Password123!):");
  console.log(`  Admin:   ${admin.email}`);
  console.log(`  Manager: ${manager.email}`);
  console.log(`  User:    ${demoUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
