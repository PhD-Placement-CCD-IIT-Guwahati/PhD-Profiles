/*
  SITE SETTINGS — edit this file to change contact details or where candidate data comes from.
  After editing, commit the change on GitHub; the site updates in a minute or two.
*/
window.SITE_CONFIG = {
  // Where candidate data is read from. Any of these work:
  //  "candidates.xlsx"  – the Excel file in this repository (default; the first sheet, named Candidates, is used)
  //  "candidates.csv"   – a CSV file in this repository
  //  A Google Sheet published as CSV (File > Share > Publish to web > CSV) – paste its full link
  dataUrl: "candidates.xlsx",

  // Show candidates' phone numbers on the site? Set to false to hide them (they stay searchable only if shown).
  showPhone: true,

  // Headline numbers shown at the top of the page (edit as your batch changes).
  highlight: { scholars: "220+", disciplines: "14" },

  // Email IDs shown in the "Partner with us" panel. Add more rows if needed.
  partnershipEmails: [
    { label: "PhD recruitment and MoU partnerships", email: "placement@iitg.ac.in" }
  ],

  centre: {
    name: "Centre for Career Development",
    institute: "Indian Institute of Technology Guwahati",
    email: "placement@iitg.ac.in",
    website: "https://www.iitg.ac.in/ccd",
    websiteLabel: "www.iitg.ac.in/ccd"
  },

  coordinators: [
    // email is optional – leave it as "" to hide it
    { name: "Hitesh Arjunbhai Ramrakhiyani", role: "PhD Placement Coordinator", phone: "+91 90335 51761", email: "" },
    { name: "Amey Mindewar Sriram", role: "PhD Placement Coordinator", phone: "+91 88560 39412", email: "" }
  ]
};
