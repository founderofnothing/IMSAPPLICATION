// ============================================================
// ID CARD FONT REGISTRY
// ============================================================

export const ID_CARD_FONTS = [
  {
    name: "Arial",
    family: "Arial",
    source: "system",
  },
  {
    name: "Helvetica",
    family: "Helvetica",
    source: "system",
  },
  {
    name: "Poppins",
    family: "Poppins",
    source: "google",
  },
  {
    name: "Inter",
    family: "Inter",
    source: "google",
  },
  {
    name: "Montserrat",
    family: "Montserrat",
    source: "google",
  },
  {
    name: "Roboto",
    family: "Roboto",
    source: "google",
  },
  {
    name: "Orbitron",
    family: "Orbitron",
    source: "google",
  },
  {
    name: "Oswald",
    family: "Oswald",
    source: "google",
  },
  {
    name: "Bebas Neue",
    family: "Bebas Neue",
    source: "google",
  },
  {
    name: "Lato",
    family: "Lato",
    source: "google",
  },
  {
    name: "Open Sans",
    family: "Open Sans",
    source: "google",
  },
  {
    name: "Playfair Display",
    family: "Playfair Display",
    source: "google",
  },
  {
    name: "Merriweather",
    family: "Merriweather",
    source: "google",
  },
  {
    name: "Raleway",
    family: "Raleway",
    source: "google",
  },
  {
    name: "Nunito",
    family: "Nunito",
    source: "google",
  },
  {
    name: "Ubuntu",
    family: "Ubuntu",
    source: "google",
  },
];



// ============================================================
// GOOGLE FONT LOADER
// ============================================================

const loadedFonts = new Set();

export const loadIDCardFont = async (font) => {
  if (
    !font ||
    font.source === "system"
  ) {
    return;
  }

  if (
    loadedFonts.has(font.family)
  ) {
    return;
  }

  const encodedFamily =
    font.family.replace(
      / /g,
      "+"
    );

  const fontUrl =
    `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@300;400;500;600;700&display=swap`;

  let link =
    document.querySelector(
      `link[data-id-card-font="${font.family}"]`
    );

  // ==========================================================
  // CREATE GOOGLE FONT STYLESHEET
  // ==========================================================

  if (!link) {
    link =
      document.createElement(
        "link"
      );

    link.rel =
      "stylesheet";

    link.href =
      fontUrl;

    link.dataset.idCardFont =
      font.family;

    document.head.appendChild(
      link
    );

    // ========================================================
    // WAIT UNTIL THE GOOGLE FONT STYLESHEET IS LOADED
    // ========================================================

    await new Promise(
      (resolve) => {
        link.onload =
          resolve;

        link.onerror =
          resolve;
      }
    );
  }

  // ==========================================================
  // WAIT FOR THE ACTUAL FONT
  // ==========================================================

  await document.fonts.load(
    `400 16px "${font.family}"`
  );

  // ==========================================================
  // CONFIRM THE FONT IS AVAILABLE
  // ==========================================================

  await document.fonts.ready;

  loadedFonts.add(
    font.family
  );
};