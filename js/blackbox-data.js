// Flight Crew Files — Black Box Files category system.
// blackbox.html shows only the 6 category cards below (counts/intensity
// ranges computed live from BLACKBOX_CASES); each blackbox-*.html category
// page filters/sorts/paginates this same array via js/blackbox-category.js.
// Add new case files here as they're published — nothing else needs to
// change for them to show up correctly on the hub or their category page.
const BLACKBOX_CATEGORIES = {
  "the-disasters": {
    name: "The Disasters",
    tagline: "The crashes that rewrote how aircraft are built, inspected and flown.",
    page: "blackbox-disasters.html",
    accent: "#ff4d4d",
    icon: '<rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="13" r="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    image: "images/japan-airlines-123/ja8119-in-flight-1985.jpg",
    imageCredit: { text: "Photo: Stuart Jessup via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:BOEING_747SR-46,_JA8119_,_JAPAN_AIRLINES.jpg" }
  },
  "the-unsolved": {
    name: "The Unsolved",
    tagline: "Aircraft that vanished, and the questions that were never answered.",
    page: "blackbox-unsolved.html",
    accent: "#b06bff",
    icon: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none"/>',
    image: "images/mh370/9m-mro-aircraft.jpg",
    imageCredit: { text: "Photo: Laurent ERRERA via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Boeing_777-200ER_Malaysia_AL_(MAS)_9M-MRO_-_color.jpg" }
  },
  "the-heroes": {
    name: "The Heroes",
    tagline: "Crews who kept a crippled aircraft flying long enough to bring everyone home.",
    page: "blackbox-heroes.html",
    accent: "#e8c766",
    icon: '<path d="M12 2l2.4 6.6L21 9l-5.5 4.6L17 21l-5-3.6L7 21l1.5-7.4L3 9l6.6-.4z"/>',
    image: "images/united-232/n1819u-united-dc10.jpg",
    imageCredit: { text: "Photo: Paul Seymour via Wikimedia Commons, CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:N1819U_McDonnell_Douglas_DC-10-10_United_Airlines,_Newark_International_Airport_1980.jpg" }
  },
  "ghost-flights": {
    name: "Ghost Flights",
    tagline: "Aircraft that kept flying long after everyone aboard could no longer fly it.",
    page: "blackbox-ghost-flights.html",
    accent: "#39e6c5",
    icon: '<rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="13" r="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    image: "images/helios522/helios-5B-DBY-aircraft.jpg",
    imageCredit: { text: "Photo: Mila Daniel via Wikimedia Commons, CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Helios_Airways_Boeing_737-300_5B-DBY.jpg" }
  },
  "acts-of-terror": {
    name: "Acts Of Terror",
    tagline: "Deliberate attacks against civil aircraft, and the investigations that followed.",
    page: "blackbox-acts-of-terror.html",
    accent: "#e05b5b",
    icon: '<path d="M4 4l7 16 3-7 7-3-16-7Z"/><path d="M13 13 21 21"/>',
    image: "images/pan-am-103/n739pa-maid-of-the-seas.jpg",
    imageCredit: { text: "Photo: Ted Quackenbush via Wikimedia Commons, GFDL", url: "https://commons.wikimedia.org/wiki/File:Pan_Am_Boeing_747-121_N739PA_%22Clipper_Maid_of_the_Seas%22_at_Los_Angeles_International_Airport_in_1987_(original).jpg" }
  },
  "near-misses": {
    name: "Near Misses",
    tagline: "Close calls that came within seconds or feet of becoming disasters.",
    page: "blackbox-near-misses.html",
    accent: "#f97316",
    icon: '<path d="M12 2v6M12 22v-6M2 12h6M22 12h-6"/><circle cx="12" cy="12" r="3"/>',
    image: "images/near-misses/vh-oqa-qantas-a380.jpg",
    imageCredit: { text: "Photo: Robert Frola via Wikimedia Commons, GFDL", url: "https://commons.wikimedia.org/wiki/File:VH-OQA_'Nancy-Bird_Walton'_A380-842_Qantas_(8324049451).jpg" }
  }
};

const BLACKBOX_CASES = [
  {
    title: "Pan Am 103: The Night Lockerbie Burned",
    url: "pan-am-103.html",
    category: "acts-of-terror",
    date: "1988-12-21",
    dateLabel: "December 1988",
    intensity: 9,
    excerpt: "A bomb hidden inside a radio cassette player exploded aboard Pan Am Flight 103 over Lockerbie, killing all 259 aboard and 11 more on the ground."
  },
  {
    title: "The Flight That Lasted 32 Minutes Too Long",
    url: "japan-airlines-123.html",
    category: "the-disasters",
    date: "1985-08-12",
    dateLabel: "August 1985",
    intensity: 10,
    excerpt: "A Boeing 747's rear pressure bulkhead failed twelve minutes after takeoff. The crew fought for 32 minutes with no flight controls left."
  },
  {
    title: "Helios 522: The Ghost Flight",
    url: "helios522.html",
    category: "ghost-flights",
    date: "2005-08-14",
    dateLabel: "August 2005",
    intensity: 9,
    excerpt: "A pressurization fault put everyone aboard to sleep, and the 737 kept flying itself for nearly three hours with nobody conscious at the controls."
  },
  {
    title: "The Plane That Fell From The Sky",
    url: "air-france-447.html",
    category: "the-disasters",
    date: "2009-06-01",
    dateLabel: "June 2009",
    intensity: 9,
    excerpt: "Iced-over speed sensors and a stall nobody diagnosed in time. Flight 447 fell for three and a half minutes before it hit the ocean."
  },
  {
    title: "The Day Two Jumbos Collided",
    url: "tenerife-disaster.html",
    category: "the-disasters",
    date: "1977-03-27",
    dateLabel: "March 1977",
    intensity: 10,
    excerpt: "Two Boeing 747s ended up on the same fog-bound runway at the same time. 583 people died without either aircraft ever leaving the ground."
  },
  {
    title: "\"Larry, We're Going Down, Larry\"",
    url: "air-florida-90.html",
    category: "the-disasters",
    date: "1982-01-13",
    dateLabel: "January 1982",
    intensity: 9,
    excerpt: "Ice-contaminated wings and a misread engine reading sent a 737 into the frozen Potomac River seconds after takeoff."
  },
  {
    title: "The Sioux City Miracle",
    url: "united-232.html",
    category: "the-heroes",
    date: "1989-07-19",
    dateLabel: "July 1989",
    intensity: 8,
    excerpt: "With every hydraulic system gone, a crew improvised a way to fly using only engine thrust. 184 of 296 people aboard survived."
  },
  {
    title: "The Gimli Glider",
    url: "gimli-glider.html",
    category: "the-heroes",
    date: "1983-07-23",
    dateLabel: "July 1983",
    intensity: 7,
    excerpt: "A fuel calculation error left a 767 powerless at 41,000 feet. A glider pilot dead-sticked it onto a runway hosting a drag race."
  },
  {
    title: "MH370: The Plane That Vanished",
    url: "mh370.html",
    category: "the-unsolved",
    date: "2014-03-08",
    dateLabel: "March 2014",
    intensity: 8,
    excerpt: "A Boeing 777 flew on for nearly seven more hours after vanishing from radar with no distress call. Most of the aircraft has never been found."
  },
  {
    title: "The Ghost Flight: Payne Stewart's Learjet",
    url: null,
    status: "coming-soon",
    category: "ghost-flights",
    date: "1999-10-25",
    dateLabel: "October 1999",
    intensity: 8,
    excerpt: "A chartered Learjet flew on, straight and level, in total radio silence for hours after its crew stopped responding, escorted by four relays of fighter jets."
  },
  {
    title: "“We Have Some Planes”: Boston Center, 9/11",
    url: null,
    status: "coming-soon",
    category: "acts-of-terror",
    date: "2001-09-11",
    dateLabel: "September 2001",
    intensity: 10,
    excerpt: "A hijacker's transmission to the wrong channel gave controllers the first sign that a hijacking, and a national crisis, was already underway."
  },
  {
    title: "“Push and Push and Push”",
    url: null,
    status: "coming-soon",
    category: "the-disasters",
    date: "2000-01-31",
    dateLabel: "January 2000",
    intensity: 9,
    excerpt: "A worn jackscrew stripped its threads mid-flight, sending an MD-83 into a dive the crew fought to recover from by flying briefly inverted."
  },
  {
    title: "“Pan Pan, Pan Pan, Pan Pan”",
    url: null,
    status: "coming-soon",
    category: "the-disasters",
    date: "1998-09-02",
    dateLabel: "September 1998",
    intensity: 9,
    excerpt: "An electrical fire spread behind the instrument panels of a calm, working crew who never knew how little time they had left."
  },
  {
    title: "“We're Gonna Be In the Hudson”",
    url: null,
    status: "coming-soon",
    category: "the-heroes",
    date: "2009-01-15",
    dateLabel: "January 2009",
    intensity: 6,
    excerpt: "A bird strike disabled both engines at 2,800 feet, and a level, unhurried radio call became one of aviation's most famous transmissions."
  },
  {
    title: "The A380 That Wouldn't Quit",
    url: null,
    status: "coming-soon",
    category: "near-misses",
    date: "2010-11-04",
    dateLabel: "November 2010",
    intensity: 5,
    excerpt: "An uncontained engine failure knocked out more than twenty aircraft systems at once. Five pilots worked the checklists for two hours and landed safely."
  }
];
