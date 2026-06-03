export interface Restaurant {
  name: string
  cuisine: string
  hours: string
  description: string
  images: string[]
  websiteUrl: string | null
}

export interface Property {
  id: string
  name: string
  location: string
  area: string
  address: string
  lat: number
  lng: number
  phone: string
  email: string
  rooms: number
  tagline: string
  description: string
  checkIn: string
  checkOut: string
  restaurant: Restaurant | null
  heroImage: string
  cardImage: string
  images: string[]
}

export interface Tour360Scene {
  id: string
  label: string
  image: string
}

export interface Room {
  id: string
  name: string
  size: string
  maxGuests: number
  beds: string
  count: number
  basePrice: number
  description: string
  image: string
  tour360: string
  tour360Scenes: Tour360Scene[]
  amenities: string[]
}

export interface Amenity {
  icon: string
  label: string
}

export const PROPERTIES: Property[] = [
  {
    id: "electronic-city",
    name: "Astra Hotels & Suites",
    location: "Electronic City",
    area: "Electronic City",
    address: "Electronic City Phase 1, Bengaluru 560100",
    lat: 12.8456, lng: 77.6603,
    phone: "+91 80 XXXX XXXX",
    email: "electroniccity@astrahotels.in",
    rooms: 55,
    tagline: "Gateway to Bangalore's Silicon Valley",
    description: "Set in Electronic City, offering easy access to major tech parks and business hubs. Designed for comfort with well-appointed rooms and modern amenities.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: null,
    heroImage: "/media/properties/ec-hero.jpg",
    cardImage: "/media/properties/card-1.jpg",
    images: ["/media/properties/ec-hero.jpg", "/media/properties/hotel-exterior.jpg"]
  },
  {
    id: "hsr-sector-1",
    name: "Astra Hotels & Suites",
    location: "HSR Layout — Sector 1",
    area: "HSR Layout",
    address: "HSR Layout Sector 1, Bengaluru 560102",
    lat: 12.9116, lng: 77.6389,
    phone: "+91 80 XXXX XXXX",
    email: "hsr1@astrahotels.in",
    rooms: 45,
    tagline: "Premium comfort in HSR Layout",
    description: "Strategically located in HSR Sector 1, ideal for business travelers with proximity to tech corridors and vibrant social scene.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: null,
    heroImage: "/media/properties/hsr1-hero.jpg",
    cardImage: "/media/properties/card-2.jpg",
    images: ["/media/properties/hsr1-hero.jpg", "/media/properties/hotel-lobby-stock.jpg"]
  },
  {
    id: "hsr-sector-7",
    name: "Astra Hotels & Suites",
    location: "HSR Layout — Sector 7",
    area: "HSR Layout",
    address: "HSR Layout Sector 7, Bengaluru 560102",
    lat: 12.9182, lng: 77.6476,
    phone: "+91 80 XXXX XXXX",
    email: "hsr7@astrahotels.in",
    rooms: 40,
    tagline: "Refined stays in the heart of HSR",
    description: "Located in HSR Sector 7, offering contemporary comfort with easy connectivity across Bangalore's south corridor.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: null,
    heroImage: "/media/properties/hsr7-hero.jpg",
    cardImage: "/media/properties/card-3.jpg",
    images: ["/media/properties/hsr7-hero.jpg", "/media/properties/hotel-room-stock.jpg"]
  },
  {
    id: "kadubeesanahalli",
    name: "Astra Hotels and Suites",
    location: "Kadubeesanahalli",
    area: "Kadubeesanahalli",
    address: "Kadubeesanahalli, Outer Ring Road, Bengaluru 560103",
    lat: 12.9346, lng: 77.6987,
    phone: "+91 80 XXXX XXXX",
    email: "kadubeesanahalli@astrahotels.in",
    rooms: 50,
    tagline: "Business comfort near Outer Ring Road",
    description: "Perfectly positioned near Outer Ring Road, offering seamless connectivity to the city's major IT hubs and corporate parks.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: null,
    heroImage: "/media/properties/kadu-hero.jpg",
    cardImage: "/media/properties/card-4.jpg",
    images: ["/media/properties/kadu-hero.jpg", "/media/properties/hotel-exterior.jpg"]
  },
  {
    id: "koramangala",
    name: "Astra Hotels & Suites",
    location: "Koramangala",
    area: "Koramangala",
    address: "Koramangala, Bengaluru 560095",
    lat: 12.9279, lng: 77.6271,
    phone: "+91 80 XXXX XXXX",
    email: "koramangala@astrahotels.in",
    rooms: 48,
    tagline: "At the pulse of Bangalore's social hub",
    description: "Nestled in vibrant Koramangala, steps away from the city's best restaurants, cafes, and thriving startup ecosystem.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: {
      name: "Sunshine Cafe",
      cuisine: "All-day Dining · Cafe · Multi-cuisine",
      hours: "7:00 AM – 11:00 PM",
      description: "A bright, welcoming cafe serving fresh breakfasts, light lunches, and relaxed evening meals. The perfect spot to start your day in Koramangala.",
      images: [
        "/media/restaurants/sunshine-sunshine-1.jpg",
        "/media/restaurants/sunshine-sunshine-2.jpg"
      ],
      websiteUrl: null
    },
    heroImage: "/media/properties/kora-hero.jpg",
    cardImage: "/media/properties/card-5.jpg",
    images: ["/media/properties/kora-hero.jpg", "/media/properties/hotel-dining.jpg"]
  },
  {
    id: "marathahalli",
    name: "Astra Hotels & Suites",
    location: "Marathahalli — Spice Garden",
    area: "Marathahalli",
    address: "Spice Garden Layout, Marathahalli, Bengaluru 560037",
    lat: 12.9591, lng: 77.7009,
    phone: "+91 80 XXXX XXXX",
    email: "marathahalli@astrahotels.in",
    rooms: 55,
    tagline: "Premium stay in Marathahalli's heart",
    description: "Nestled in the heart of Marathahalli, catering to business, leisure, family, and medical tourism guests. Minutes from Kauvery Hospital and major tech parks.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: {
      name: "Zaffran",
      cuisine: "North West Frontier Cuisine",
      hours: "11:00 AM – 12:00 AM",
      description: "Savour authentic flavours of the North West Frontier. Slow-cooked kebabs, tender lamb dishes, and an expertly curated selection of wines and spirits.",
      images: [
        "/media/restaurants/zaffran-main.jpg",
        "/media/restaurants/zaffran-2.jpg"
      ],
      websiteUrl: null
    },
    heroImage: "/media/properties/mara-hero.jpg",
    cardImage: "/media/properties/card-6.jpg",
    images: ["/media/properties/mara-hero.jpg", "/media/rooms/family-room.jpg", "/media/rooms/premium-king.jpg"]
  },
  {
    id: "sarjapur",
    name: "Astra Hotels & Suites",
    location: "Sarjapur",
    area: "Sarjapur",
    address: "Sarjapur Road, Bengaluru 560035",
    lat: 12.8921, lng: 77.7862,
    phone: "+91 80 XXXX XXXX",
    email: "sarjapur@astrahotels.in",
    rooms: 42,
    tagline: "Your home near Sarjapur's IT corridor",
    description: "Strategically located on Sarjapur Road with close proximity to major tech companies, residential hubs, and educational institutions.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: null,
    heroImage: "/media/properties/sarja-hero.jpg",
    cardImage: "/media/properties/card-7.jpg",
    images: ["/media/properties/sarja-hero.jpg", "/media/properties/hotel-room-stock.jpg"]
  },
  {
    id: "whitefield",
    name: "Astra Hotels & Suites",
    location: "Whitefield",
    area: "Whitefield",
    address: "Whitefield, Bengaluru 560066",
    lat: 12.9698, lng: 77.7499,
    phone: "+91 80 XXXX XXXX",
    email: "whitefield@astrahotels.in",
    rooms: 50,
    tagline: "Premium comfort in Whitefield's tech hub",
    description: "Located in the heart of Whitefield, offering easy access to ITPL, Prestige Tech Park, Forum Value Mall, and the best of east Bangalore.",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    restaurant: null,
    heroImage: "/media/properties/white-hero.jpg",
    cardImage: "/media/properties/card-1.jpg",
    images: ["/media/properties/white-hero.jpg", "/media/properties/hotel-exterior.jpg"]
  }
]

export const ROOMS: Room[] = [
  {
    id: "family-room",
    name: "Family Room",
    size: "500 sq.ft.",
    maxGuests: 4,
    beds: "1 King + 2 Twin Beds",
    count: 2,
    basePrice: 4999,
    description: "Spacious 500 sq.ft. retreat for families. King bed plus twin beds with ample space for up to four guests to relax and enjoy together.",
    image: "/media/rooms/family-room.jpg",
    tour360: "/media/360/room-360-1.jpg",
    tour360Scenes: [
      { id: "bedroom", label: "Bedroom", image: "/media/360/room-360-1.jpg" },
      { id: "bathroom", label: "Bathroom", image: "/media/360/bathroom-360.jpg" },
      { id: "living", label: "Living Area", image: "/media/360/living-360.jpg" },
      { id: "balcony", label: "Balcony", image: "/media/360/balcony-360.jpg" }
    ],
    amenities: [
      "King Bed + 2 Twin Beds",
      "Air Conditioning",
      "Free WiFi",
      "Smart TV",
      "24/7 Room Service",
      "Mini Bar",
      "Tea/Coffee Maker",
      "Hot Water",
      "Daily Housekeeping",
      "Work Desk"
    ]
  },
  {
    id: "superior-club",
    name: "Superior Club Room",
    size: "450 sq.ft.",
    maxGuests: 3,
    beds: "1 King Bed",
    count: 10,
    basePrice: 3999,
    description: "450 sq.ft. of comfort with a separate kitchen — ideal for extended stays or guests who want extra flexibility and home-like convenience.",
    image: "/media/rooms/superior-club.jpg",
    tour360: "/media/360/room-360-2.jpg",
    tour360Scenes: [
      { id: "bedroom", label: "Bedroom", image: "/media/360/room-360-2.jpg" },
      { id: "bathroom", label: "Bathroom", image: "/media/360/bathroom-360.jpg" },
      { id: "living", label: "Living Area", image: "/media/360/living-360.jpg" },
      { id: "balcony", label: "Balcony", image: "/media/360/balcony-360.jpg" }
    ],
    amenities: [
      "King Bed",
      "Separate Kitchen",
      "Air Conditioning",
      "Free WiFi",
      "Smart TV",
      "24/7 Room Service",
      "Tea/Coffee Maker",
      "Hot Water",
      "Daily Housekeeping",
      "Work Desk"
    ]
  },
  {
    id: "premium-king",
    name: "Premium King Room",
    size: "300 sq.ft.",
    maxGuests: 3,
    beds: "1 King Bed",
    count: 35,
    basePrice: 2999,
    description: "Designed for comfort and style. 300 sq.ft. with a plush king bed, thoughtful amenities, and a restful atmosphere for business or leisure.",
    image: "/media/rooms/premium-king.jpg",
    tour360: "/media/360/room-360-3.jpg",
    tour360Scenes: [
      { id: "bedroom", label: "Bedroom", image: "/media/360/room-360-3.jpg" },
      { id: "bathroom", label: "Bathroom", image: "/media/360/bathroom-360.jpg" },
      { id: "living", label: "Living Area", image: "/media/360/living-360.jpg" }
    ],
    amenities: [
      "King Bed",
      "Air Conditioning",
      "Free WiFi",
      "Smart TV",
      "24/7 Room Service",
      "Tea/Coffee Maker",
      "Hot Water",
      "Daily Housekeeping",
      "Work Desk",
      "Wardrobe"
    ]
  },
  {
    id: "premium-twin",
    name: "Premium Twin Room",
    size: "300 sq.ft.",
    maxGuests: 3,
    beds: "2 Twin Beds",
    count: 8,
    basePrice: 2799,
    description: "Two plush twin beds across 300 sq.ft. A practical, well-designed space equally suited for colleagues travelling together or leisure guests.",
    image: "/media/rooms/premium-twin.jpg",
    tour360: "/media/360/room-360-4.jpg",
    tour360Scenes: [
      { id: "bedroom", label: "Bedroom", image: "/media/360/room-360-4.jpg" },
      { id: "bathroom", label: "Bathroom", image: "/media/360/bathroom-360.jpg" },
      { id: "living", label: "Living Area", image: "/media/360/living-360.jpg" }
    ],
    amenities: [
      "2 Twin Beds",
      "Air Conditioning",
      "Free WiFi",
      "Smart TV",
      "24/7 Room Service",
      "Tea/Coffee Maker",
      "Hot Water",
      "Daily Housekeeping",
      "Work Desk",
      "Wardrobe"
    ]
  }
]

export const AMENITIES: Amenity[] = [
  { icon: "Wine", label: "Welcome Drink on Arrival" },
  { icon: "BanIcon", label: "Non-smoking Rooms" },
  { icon: "ArrowUp", label: "Room Upgrade (Subject to Availability)" },
  { icon: "Clock", label: "Early Check-in & Late Check-out" },
  { icon: "Tag", label: "F&B Discounts" },
  { icon: "Wifi", label: "Free High-Speed WiFi" },
  { icon: "Car", label: "Parking Available" },
  { icon: "ConciergeBell", label: "24/7 Room Service" },
  { icon: "Users", label: "Conference Facilities" },
  { icon: "Shield", label: "24/7 Security" }
]

export const MARATHAHALLI_ATTRACTIONS = [
  { distance: "0.5 km", name: "Kauvery Hospital", type: "Medical" },
  { distance: "1.1 km", name: "KLM Fashion Mall", type: "Shopping" },
  { distance: "4.1 km", name: "Helios Business Park", type: "Business" },
  { distance: "5.4 km", name: "Nexus Mall, Whitefield", type: "Shopping" },
  { distance: "8.2 km", name: "Bagmane Tech Park", type: "Business" },
  { distance: "12.9 km", name: "Brigade Road", type: "Lifestyle" },
  { distance: "13 km", name: "Commercial Street", type: "Shopping" },
  { distance: "14.7 km", name: "Cubbon Park", type: "Nature" },
  { distance: "14.9 km", name: "Vidhana Soudha", type: "Heritage" },
  { distance: "16.1 km", name: "Bengaluru Palace", type: "Heritage" }
]

export function getGenericAttractions(_area: string) {
  return [
    { distance: "2.0 km", name: "Nearest Metro Station", type: "Transport" },
    { distance: "3.5 km", name: "City Shopping Mall", type: "Shopping" },
    { distance: "5.0 km", name: "Major Tech Park", type: "Business" },
    { distance: "8.0 km", name: "MG Road", type: "Lifestyle" },
    { distance: "10.0 km", name: "Lal Bagh Gardens", type: "Nature" },
    { distance: "12.0 km", name: "UB City", type: "Lifestyle" },
    { distance: "14.0 km", name: "Cubbon Park", type: "Nature" },
    { distance: "15.0 km", name: "Vidhana Soudha", type: "Heritage" },
    { distance: "18.0 km", name: "Bangalore Palace", type: "Heritage" },
    { distance: "35.0 km", name: "Kempegowda Airport", type: "Transport" }
  ]
}
