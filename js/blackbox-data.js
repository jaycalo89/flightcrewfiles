// Flight Crew Files — Black Box Files case data.
// blackbox.html shows 3 hand-picked featured case files (static markup) plus
// "The Complete Archive" grid, which renders every other entry below,
// filterable by category tab (js/blackbox-archive.js). Add new case files
// here as they're published — nothing else needs to change for them to show
// up correctly in the archive grid.
const BLACKBOX_CATEGORIES = {
  "the-disasters": { name: "Disasters", accent: "#ff4d4d" },
  "the-unsolved": { name: "Unsolved", accent: "#b06bff" },
  "the-heroes": { name: "Heroes", accent: "#e8c766" },
  "ghost-flights": { name: "Ghost Flights", accent: "#39e6c5" },
  "acts-of-terror": { name: "Terror", accent: "#e05b5b" },
  "near-misses": { name: "Near Misses", accent: "#f97316" }
};

const BLACKBOX_CASES = [
  {
    title: "Pan Am 103: The Night Lockerbie Burned",
    url: "pan-am-103.html",
    category: "acts-of-terror",
    date: "1988-12-21",
    dateLabel: "December 1988",
    intensity: 9,
    excerpt: "A bomb hidden inside a radio cassette player exploded aboard Pan Am Flight 103 over Lockerbie, killing all 259 aboard and 11 more on the ground.",
    image: "images/pan-am-103/n739pa-maid-of-the-seas.jpg",
    imageCredit: { text: "Photo: Ted Quackenbush via Wikimedia Commons, GFDL", url: "https://commons.wikimedia.org/wiki/File:Pan_Am_Boeing_747-121_N739PA_%22Clipper_Maid_of_the_Seas%22_at_Los_Angeles_International_Airport_in_1987_(original).jpg" }
  },
  {
    title: "The Flight That Lasted 32 Minutes Too Long",
    url: "japan-airlines-123.html",
    category: "the-disasters",
    date: "1985-08-12",
    dateLabel: "August 1985",
    intensity: 10,
    excerpt: "A Boeing 747's rear pressure bulkhead failed twelve minutes after takeoff. The crew fought for 32 minutes with no flight controls left.",
    image: "images/japan-airlines-123/ja8119-in-flight-1985.jpg",
    imageCredit: { text: "Photo: Stuart Jessup via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:BOEING_747SR-46,_JA8119_,_JAPAN_AIRLINES.jpg" }
  },
  {
    title: "Helios 522: The Ghost Flight",
    url: "helios522.html",
    category: "ghost-flights",
    date: "2005-08-14",
    dateLabel: "August 2005",
    intensity: 9,
    excerpt: "A pressurization fault put everyone aboard to sleep, and the 737 kept flying itself for nearly three hours with nobody conscious at the controls.",
    image: "images/helios522/helios-5B-DBY-aircraft.jpg",
    imageCredit: { text: "Photo: Mila Daniel via Wikimedia Commons, CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Helios_Airways_Boeing_737-300_5B-DBY.jpg" }
  },
  {
    title: "The Plane That Fell From The Sky",
    url: "air-france-447.html",
    category: "the-disasters",
    date: "2009-06-01",
    dateLabel: "June 2009",
    intensity: 9,
    excerpt: "Iced-over speed sensors and a stall nobody diagnosed in time. Flight 447 fell for three and a half minutes before it hit the ocean.",
    image: "images/air-france-447/af447-fgzcp-cdg.jpg",
    imageCredit: { text: "Photo: Antony via Wikimedia Commons, CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:PKIERZKOWSKI_070328_FGZCP_CDG.jpg" }
  },
  {
    title: "The Day Two Jumbos Collided",
    url: "tenerife-disaster.html",
    category: "the-disasters",
    date: "1977-03-27",
    dateLabel: "March 1977",
    intensity: 10,
    excerpt: "Two Boeing 747s ended up on the same fog-bound runway at the same time. 583 people died without either aircraft ever leaving the ground.",
    image: "images/tenerife-disaster/klm-ph-buf-1975.jpg",
    imageCredit: { text: "Photo: Aero Icarus via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:KLM_Boeing_747-200;_PH-BUF@LHR,_August_1975.jpg" }
  },
  {
    title: "\"Larry, We're Going Down, Larry\"",
    url: "air-florida-90.html",
    category: "the-disasters",
    date: "1982-01-13",
    dateLabel: "January 1982",
    intensity: 9,
    excerpt: "Ice-contaminated wings and a misread engine reading sent a 737 into the frozen Potomac River seconds after takeoff.",
    image: "images/air-florida-90/n62af-air-florida.jpg",
    imageCredit: { text: "Photo: Original photographer unknown, Public Domain" }
  },
  {
    title: "The Sioux City Miracle",
    url: "united-232.html",
    category: "the-heroes",
    date: "1989-07-19",
    dateLabel: "July 1989",
    intensity: 8,
    excerpt: "With every hydraulic system gone, a crew improvised a way to fly using only engine thrust. 184 of 296 people aboard survived.",
    image: "images/united-232/n1819u-united-dc10.jpg",
    imageCredit: { text: "Photo: Paul Seymour via Wikimedia Commons, CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:N1819U_McDonnell_Douglas_DC-10-10_United_Airlines,_Newark_International_Airport_1980.jpg" }
  },
  {
    title: "The Gimli Glider",
    url: "gimli-glider.html",
    category: "the-heroes",
    date: "1983-07-23",
    dateLabel: "July 1983",
    intensity: 7,
    excerpt: "A fuel calculation error left a 767 powerless at 41,000 feet. A glider pilot dead-sticked it onto a runway hosting a drag race.",
    image: "images/gimli-glider/gimli-glider-CGAUN-toronto-1984.jpg",
    imageCredit: { text: "Photo: Andrew Thomas via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:C-GAUN_604_Boeing_767-233_Air_Canada,_the_%22Gimli_Glider%22,_Toronto,_July_14_1984._(5530418110).jpg" }
  },
  {
    title: "MH370: The Plane That Vanished",
    url: "mh370.html",
    category: "the-unsolved",
    date: "2014-03-08",
    dateLabel: "March 2014",
    intensity: 8,
    excerpt: "A Boeing 777 flew on for nearly seven more hours after vanishing from radar with no distress call. Most of the aircraft has never been found.",
    image: "images/mh370/9m-mro-aircraft.jpg",
    imageCredit: { text: "Photo: Laurent ERRERA via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Boeing_777-200ER_Malaysia_AL_(MAS)_9M-MRO_-_color.jpg" }
  },
  {
    title: "The Ghost Flight: Payne Stewart's Learjet",
    url: null,
    status: "coming-soon",
    category: "ghost-flights",
    date: "1999-10-25",
    dateLabel: "October 1999",
    intensity: 8,
    excerpt: "A chartered Learjet flew on, straight and level, in total radio silence for hours after its crew stopped responding, escorted by four relays of fighter jets.",
    image: "images/coming-soon/learjet-35-generic.jpg",
    imageCredit: { text: "Photo: bomberpilot via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Learjet_35_(8738280921).jpg" }
  },
  {
    title: "“We Have Some Planes”: Boston Center, 9/11",
    url: null,
    status: "coming-soon",
    category: "acts-of-terror",
    date: "2001-09-11",
    dateLabel: "September 2001",
    intensity: 10,
    excerpt: "A hijacker's transmission to the wrong channel gave controllers the first sign that a hijacking, and a national crisis, was already underway.",
    image: "images/coming-soon/n334aa-american-767.jpg",
    imageCredit: { text: "Photo: Ken Fielding via Wikimedia Commons, CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:N334AA_B767-223ER_American_MAN_08APR01_(6839074488).jpg" }
  },
  {
    title: "“Push and Push and Push”",
    url: null,
    status: "coming-soon",
    category: "the-disasters",
    date: "2000-01-31",
    dateLabel: "January 2000",
    intensity: 9,
    excerpt: "A worn jackscrew stripped its threads mid-flight, sending an MD-83 into a dive the crew fought to recover from by flying briefly inverted.",
    image: "images/coming-soon/n963as-alaska-md83.jpg",
    imageCredit: { text: "Photo: Frank Jäger via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Alaska_Airlines_MD-83_N963AS_Santa_Ana_15-09-92_(cropped).jpg" }
  },
  {
    title: "“Pan Pan, Pan Pan, Pan Pan”",
    url: null,
    status: "coming-soon",
    category: "the-disasters",
    date: "1998-09-02",
    dateLabel: "September 1998",
    intensity: 9,
    excerpt: "An electrical fire spread behind the instrument panels of a calm, working crew who never knew how little time they had left.",
    image: "images/coming-soon/hb-iwf-swissair-md11.jpg",
    imageCredit: { text: "Photo: Aero Icarus via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:28as_-_Swissair_MD-11;_HB-IWF@ZRH;14.07.1998_(4713082874).jpg" }
  },
  {
    title: "“We're Gonna Be In the Hudson”",
    url: null,
    status: "coming-soon",
    category: "the-heroes",
    date: "2009-01-15",
    dateLabel: "January 2009",
    intensity: 6,
    excerpt: "A bird strike disabled both engines at 2,800 feet, and a level, unhurried radio call became one of aviation's most famous transmissions.",
    image: "images/coming-soon/n106us-us-airways-a320.jpg",
    imageCredit: { text: "Photo: Edmund Seeger via Wikimedia Commons, CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:2008_Las_Vegas_N106US_US_Airways.jpg" }
  },
  {
    title: "The A380 That Wouldn't Quit",
    url: null,
    status: "coming-soon",
    category: "near-misses",
    date: "2010-11-04",
    dateLabel: "November 2010",
    intensity: 5,
    excerpt: "An uncontained engine failure knocked out more than twenty aircraft systems at once. Five pilots worked the checklists for two hours and landed safely.",
    image: "images/near-misses/vh-oqa-qantas-a380.jpg",
    imageCredit: { text: "Photo: Robert Frola via Wikimedia Commons, GFDL", url: "https://commons.wikimedia.org/wiki/File:VH-OQA_'Nancy-Bird_Walton'_A380-842_Qantas_(8324049451).jpg" }
  }
];
