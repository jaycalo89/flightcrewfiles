// Flight Crew Files — homepage "Case Files" grid data
// Each entry renders as a card via js/case-files.js. Add new full case-file
// deep-dives here as they're published.
const CASE_FILES = [
  {
    // CASE FILE #013
    title: "The Gimli Glider",
    tag: "Heroic Moments",
    accent: "#e8c766",
    stamp: "Survived",
    date: "July 1983",
    excerpt: "A fuel calculation error, pounds mixed up for kilograms, left a Boeing 767 completely powerless at 41,000 feet with 69 people aboard. Captain Bob Pearson, a recreational glider pilot, dead-sticked it onto a decommissioned air force runway that happened to be hosting a drag race that day. Nobody died.",
    url: "gimli-glider.html"
  },
  {
    // CASE FILE #012
    title: "The Plane That Fell From The Sky",
    tag: "Black Box Files",
    accent: "#ff4d4d",
    date: "June 2009",
    excerpt: "An Air France Airbus A330 climbed into a tropical storm over the mid-Atlantic, its speed sensors iced over, and the autopilot handed control to two first officers who never understood they were in a stall. It fell for three minutes and thirty seconds. The black boxes weren't found for nearly two years.",
    url: "air-france-447.html"
  },
  {
    title: "Helios 522: The Ghost Flight",
    tag: "Black Box Files",
    accent: "#ff4d4d",
    date: "August 2005",
    excerpt: "A Boeing 737 lost cabin pressure minutes after takeoff from Cyprus, and flew on alone for nearly three hours while everyone aboard slipped into unconsciousness, until a lone flight attendant made it to the flight deck.",
    url: "helios522.html"
  },
  {
    title: "Four Engines Dead At 37,000 Feet",
    tag: "Heroic Moments",
    accent: "#e8c766",
    date: "June 1982",
    excerpt: "In 1982, British Airways Flight 9 flew into an invisible cloud of volcanic ash from Mount Galunggung at night, and all four engines flamed out. Captain Eric Moody's crew glided in silence for thirteen minutes, restarted the engines, and landed safely in Jakarta.",
    url: "captain-eric-moody.html"
  },
  {
    title: "The Man Who Fell 18,000 Feet, And Walked Away",
    tag: "Heroic Moments",
    accent: "#e8c766",
    date: "March 1944",
    excerpt: "When his Lancaster caught fire over Germany and his own parachute burned in the fuselage, RAF tail gunner Nicholas Alkemade jumped anyway, with no parachute at all. He fell three miles through the dark and landed with a sprained knee.",
    url: "nicholas-alkemade.html"
  },
  {
    title: "Alone In The Amazon",
    tag: "Scary Stories",
    accent: "#ff4d4d",
    date: "December 1971",
    excerpt: "On Christmas Eve 1971, lightning tore LANSA Flight 508 apart over the Peruvian Amazon. Ninety-one people died, including the mother seated beside her. Seventeen-year-old Juliane Koepcke fell nearly two miles still strapped to her seat, and survived.",
    url: "juliane-koepcke.html"
  },
  {
    title: "Flight 19: Five Bombers, One Radio Call, No Wreckage",
    tag: "Bizarre & Unexplained",
    accent: "#b06bff",
    date: "December 1945",
    excerpt: "The flight leader's last transmissions described broken compasses, an ocean that “didn't look right,” and white water that wasn't there. The rescue plane sent after them disappeared too. No wreckage from either aircraft was ever found.",
    url: "bizarre.html"
  },
  {
    title: "The Pilot Who Vanished",
    tag: "UAP Files",
    accent: "#39e6c5",
    stamp: "Case Open",
    date: "October 1978",
    excerpt: "Twenty-year-old Frederick Valentich radioed Melbourne air traffic control from his Cessna over Bass Strait to report an aircraft orbiting above him, metallic, shining, with a green light. Six minutes and forty-seven seconds later, mid-transmission, his radio call ended in a burst of metallic noise. Neither he nor his aircraft was ever found.",
    url: "frederick-valentich.html"
  },
  {
    title: "The Plane That Lost Its Roof",
    tag: "Heroic Moments",
    accent: "#e8c766",
    date: "April 1988",
    excerpt: "At 24,000 feet, 18 feet of Aloha Airlines Flight 243's roof tore away explosively, sweeping flight attendant Clarabelle Lansing into the sky. She was never found. Captain Robert Schornstheimer and First Officer Mimi Tompkins flew the open, structurally broken 737 to a safe landing on Maui, bringing all 94 other people aboard home alive.",
    url: "aloha-airlines-243.html"
  },
  {
    title: "The Plane That Caused The UFO Panic",
    tag: "UAP Files",
    accent: "#39e6c5",
    stamp: "Declassified",
    date: "August 1955",
    excerpt: "Built in 88 days by Lockheed's secret Skunk Works division and flown by CIA officers who signed away their identities, the U-2 spy plane flew so high Soviet missiles couldn't reach it. The CIA has officially confirmed it caused more than half of all UFO reports filed in America during the late 1950s and 1960s, plus the full story of Gary Powers' 1960 shootdown over the USSR.",
    url: "u2-spy-plane.html"
  },
  {
    title: "MH370: The Plane That Vanished",
    tag: "Bizarre & Unexplained",
    accent: "#b06bff",
    stamp: "Case Open",
    date: "March 2014",
    excerpt: "A Boeing 777 carrying 239 people vanishes from radar over the South China Sea with no distress call. Satellite data later showed it flew on, alone and unresponsive, for nearly seven more hours into the Southern Indian Ocean. More than a decade (and the largest search in aviation history) later, most of the aircraft has never been found.",
    url: "mh370.html"
  },
  {
    title: "The First Pilot To Die Chasing A UFO",
    tag: "UAP Files",
    accent: "#39e6c5",
    stamp: "Unresolved",
    date: "January 1948",
    excerpt: "Captain Thomas Mantell, a decorated WWII pilot, climbed his P-51 Mustang toward a massive metallic object over Kentucky without oxygen equipment and never leveled off. His last radio words described something enormous. Over the next four years, the Air Force gave three different explanations for what he died chasing, and never fully settled the question.",
    url: "captain-mantell.html"
  },
  {
    title: "The Day Two Jumbos Collided",
    tag: "Black Box Files",
    accent: "#ff4d4d",
    date: "March 1977",
    excerpt: "A bomb threat diverted dozens of flights to a small, fog-bound regional airport in the Canary Islands. Two Boeing 747s ended up on the same runway at the same time. 583 people died without either aircraft ever leaving the ground, still the deadliest accident in aviation history.",
    url: "tenerife-disaster.html"
  },
  {
    title: "The Disappearance Of Amelia Earhart",
    tag: "Bizarre & Unexplained",
    accent: "#b06bff",
    stamp: "Case Open",
    date: "July 1937",
    excerpt: "Amelia Earhart and navigator Fred Noonan vanished over the central Pacific attempting to circle the globe near the equator. No confirmed wreckage has ever been recovered, and a Purdue-led expedition is still actively searching for the aircraft today, still the most famous unsolved disappearance in aviation history.",
    url: "amelia-earhart.html"
  }
];
