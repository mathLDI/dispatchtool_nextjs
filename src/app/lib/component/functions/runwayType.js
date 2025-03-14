export const contaminent = [

  //GRAVEL CONDITONS BELOW //
    { description: "SELECT GRAVEL CONTAMINANT", code: 6, maxCrosswind: 36, callDxp: false, PavedOrGravel: "GRAVEL"  },
    { description: "Frost", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "GRAVEL" },
    { description: "Dry Snow 1.0 in or less depth: -15ºC and Colder OAT", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "GRAVEL" },
    { description: "Dry Snow 1.0 in or less depth: Warmer than -15ºC OAT", code: 4, maxCrosswind: 25, callDxp: false, PavedOrGravel: "GRAVEL" },
    { description: "Dry Snow more than 1.0 in depth", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Wet Snow 0.13 in or less depth.", code: 3, maxCrosswind: 20, callDxp: false, PavedOrGravel: "GRAVEL" },
    { description: "Wet Snow greater than 0.13 in depth over Compacted snow/gravel mix", code: 0, maxCrosswind: 0, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Water Greater than 0.13 in depth", code: 2, maxCrosswind: 15, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Wet (Damp and 0.13 in or less depth of water)", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "GRAVEL" },
    { description: "Slush 0.13 in or less depth", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Slush Greater than 0.13 in depth", code: 1, maxCrosswind: 10, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Ice: -25ºC and colder OAT", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Ice: -15ºC to -24ºC OAT", code: 2, maxCrosswind: 15, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Ice: -8ºC to -14ºC OAT", code: 1, maxCrosswind: 10, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Ice: -7ºC and warmer OAT", code: 0, maxCrosswind: 0, callDxp: true, PavedOrGravel: "GRAVEL" },
    { description: "Over Ice: Dry Snow, Wet Snow, Slush, Water", code: 0, maxCrosswind: 0, callDxp: true, PavedOrGravel: "GRAVEL" },

//PAVED CONDITIONSBELOW //
    { description: "SELECT PAVED CONTAMINANT", code: 6, maxCrosswind: 36, callDxp: false, PavedOrGravel: "PAVED" },
    { description: "Frost", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "PAVED"  },
    { description: "Dry Snow or Wet Snow (Any depth) over 100% Compacted Snow", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Dry Snow more than 1.0 in depth", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Dry Snow 1.0 in or less depth", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "PAVED"  },
    { description: "Wet Snow 0.13 in or less depth", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "PAVED" },
    { description: "Wet Snow greater than 0.13 in depth", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "PAVED" },
    { description: "100% Compacted Snow: -15ºC and Colder OAT", code: 4, maxCrosswind: 25, callDxp: false, PavedOrGravel: "PAVED" },
    { description: "100% Compact Snow: Warmer than -15ºC OAT", code: 3, maxCrosswind: 20, callDxp: false, PavedOrGravel: "PAVED"  },
    { description: "Water Greater than 0.13 in depth", code: 2, maxCrosswind: 15, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Water on top of 100% Compacted Snow", code: 0, maxCrosswind: 0, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Wet (Damp and 0.13 in or less depth of water)", code: 5, maxCrosswind: 30, callDxp: false, PavedOrGravel: "PAVED"  },
    { description: "Wet (“Slippery when wet” runway)", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Slush 0.13 in or less depth", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Slush Greater than 0.13 in depth", code: 1, maxCrosswind: 10, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Ice: -25ºC and colder OAT", code: 3, maxCrosswind: 20, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Ice: -15ºC to -24ºC OAT", code: 2, maxCrosswind: 15, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Ice: -8ºC to -14ºC OAT", code: 1, maxCrosswind: 10, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Ice: -7ºC and warmer OAT", code: 0, maxCrosswind: 0, callDxp: true, PavedOrGravel: "PAVED"  },
    { description: "Over Ice: Dry Snow, Wet Snow, Slush, Water", code: 0, maxCrosswind: 0, callDxp: true, PavedOrGravel: "PAVED"  },

  ];


  