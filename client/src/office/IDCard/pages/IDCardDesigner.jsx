import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";


import {
  Gradient,
  FabricImage,
  Rect,
} from "fabric";


import {
  resolveDynamicField,
} from "../utilsid/idCard/dynamicFieldResolver";
//  import {
//   restoreIDCardSide,
// } from "../components/idCardDesignRestorer/idCardDesignRestorer";

import IDCardCanvas from "../components/canvas/IDCardCanvas";
import IDCardToolbar from "../components/IDCardToolbar/IDCardToolbar";
import IDCardProperties from "../components/IDCardProperties/IDCardProperties";
import API from "../../../api/axios"
// import API ,{ SERVER_URL } from "../../../api/axios";
import {
  ID_CARD_FONTS,
  loadIDCardFont,
} from "../utils/idCardFonts";


// import {
//   resolveDynamicField,
// } from "../../../utils/idCard/dynamicFieldResolver";

import "./IDCardDesigner.css";

const IDCardDesigner = () => {

  const {
  templateId: routeTemplateId,
} = useParams();

const navigate = useNavigate();
  // ============================================================
  // DESIGNER STATE
  // ============================================================

  const [selectedObject, setSelectedObject] =
    useState(null);

  const [canvas, setCanvas] =
    useState(null);
useEffect(() => {
  if (canvas) {
    window.__idCardCanvas = canvas;
  }

  return () => {
    delete window.__idCardCanvas;
  };
}, [canvas]);




    const frameApiRef =
  useRef(null);

  const [isDrawingMode, setIsDrawingMode] =
    useState(false);

  const [isVectorMode, setIsVectorMode] =
    useState(false);

  const [activeSide, setActiveSide] =
    useState("front");

    // ============================================================
// ID CARD TEMPLATE
// ============================================================

const [templateId, setTemplateId] =
  useState(routeTemplateId || null);

  
const [templateName, setTemplateName] =
  useState("");

const [templateDescription, setTemplateDescription] =
  useState("");

const [savingTemplate, setSavingTemplate] =
  useState(false);

  // ============================================================
  // DRAFT RESTORE CONTROL
  // ============================================================

  const draftRestoredRef =
    useRef(false);

  const isRestoringDraftRef =
    useRef(false);

  // ============================================================
  // FRONT / BACK DESIGN
  // ============================================================

  const [cardDesign, setCardDesign] =
    useState({
      front: {
        canvas: null,
        background: null,
      },

      back: {
        canvas: null,
        background: null,
      },
    });

  // ============================================================
  // BACKGROUND
  // ============================================================

  const [background, setBackground] =
    useState({
      type: "color",
      color: "#ffffff",

      gradientType: "linear",
      color1: "#ffffff",
      color2: "#111111",
      angle: 0,

      imageUrl: null,
      imageFit: "cover",
    });

  // ============================================================
  // LOCAL DRAFT
  // ============================================================

  const ID_CARD_DRAFT_KEY =
    "id_card_designer_draft_v3";

  // ============================================================
  // SAVE DRAFT
  // ============================================================

  const saveDraft = (design) => {
    try {
      localStorage.setItem(
        ID_CARD_DRAFT_KEY,
        JSON.stringify(design)
      );

      console.log(
        "ID CARD DRAFT SAVED"
      );
    } catch (error) {
      console.error(
        "FAILED TO SAVE ID CARD DRAFT",
        error
      );
    }
  };

  // ============================================================
  // DEFAULT BACKGROUND
  // ============================================================

  const getDefaultBackground = () => ({
    type: "color",
    color: "#ffffff",

    gradientType: "linear",
    color1: "#ffffff",
    color2: "#111111",
    angle: 0,

    imageUrl: null,
    imageFit: "cover",
  });

  // ============================================================
  // FABRIC CUSTOM PROPERTIES
  // ============================================================
const fabricProperties = [
  // ==========================================================
  // FRAME
  // ==========================================================

  "idCardFrame",
  "idCardFrameId",
  "idCardFrameType",

  // ==========================================================
  // FRAME IMAGE
  // ==========================================================

  "idCardFrameImageMarker",
  "idCardFrameId",
  "idCardFrameFit",
  "idCardFrameImageUrl",

  "idCardFrameImageOffsetX",
  "idCardFrameImageOffsetY",

  // ==========================================================
  // TEXT
  // ==========================================================

  "idCardTextCase",
  "idCardOriginalText",

  // ==========================================================
  // DYNAMIC FIELDS
  // ==========================================================

"idCardDynamicField",
"idCardDynamicKey",
"idCardDynamicLabel",
];

  // ============================================================
  // SERIALIZE CANVAS
  //
  // At this stage we only serialize normal Fabric objects.
  //
  // Frame image persistence will be rebuilt separately.
  // ============================================================

  const serializeCanvas = () => {
    if (!canvas) {
      return null;
    }

    return canvas.toJSON(
      fabricProperties
    );
  };

  // ============================================================
  // SERIALIZE CURRENT SIDE
  // ============================================================

  const serializeCurrentSide = () => {
    if (!canvas) {
      return cardDesign[activeSide];
    }

    return {
      canvas: serializeCanvas(),

      background: {
        ...background,
      },
    };
  };

  // ============================================================
  // SAVE CURRENT SIDE
  // ============================================================

  const saveCurrentSide = () => {
    if (!canvas) {
      return cardDesign;
    }

    const currentSide =
      serializeCurrentSide();

    const updatedDesign = {
      ...cardDesign,

      [activeSide]:
        currentSide,
    };

    setCardDesign(
      updatedDesign
    );

    saveDraft(
      updatedDesign
    );

    return updatedDesign;
  };


  // ============================================================
// SAVE TEMPLATE TO BACKEND
// ============================================================

// ============================================================
// SAVE TEMPLATE TO BACKEND
// ============================================================

const saveTemplateToBackend = async () => {
  if (!canvas) {
    return;
  }

  if (!templateName.trim()) {
    window.alert(
      "Please enter a template name."
    );

    return;
  }

  try {
    setSavingTemplate(true);

    // ========================================================
    // SAVE CURRENT SIDE FIRST
    // ========================================================

    const latestDesign =
      saveCurrentSide();

    // ========================================================
    // CREATE / UPDATE TEMPLATE
    // ========================================================

    const payload = {
      name:
        templateName.trim(),

      description:
        templateDescription.trim(),

      design:
        latestDesign,

      thumbnail:
        null,
    };

    let response;

    if (templateId) {
      // ------------------------------------------------------
      // UPDATE EXISTING TEMPLATE
      // ------------------------------------------------------

      response =
        await API.put(
          `/id-card/templates/${templateId}`,
          payload
        );
    } else {
      // ------------------------------------------------------
      // CREATE NEW TEMPLATE
      // ------------------------------------------------------

      response =
        await API.post(
          "/id-card/templates",
          payload
        );
    }

    const savedTemplate =
      response.data?.template;

    // ========================================================
    // STORE TEMPLATE ID
    // ========================================================

if (
  savedTemplate?._id
) {
  setTemplateId(
    savedTemplate._id
  );

  // New template now becomes
  // an actual editable template route.

  navigate(
    `/office_assistant/IDCardDesigner/${savedTemplate._id}`,
    {
      replace: true,
    }
  );
}

    console.log(
      "ID CARD TEMPLATE SAVED:",
      savedTemplate
    );

    window.alert(
      templateId
        ? "ID card template updated successfully."
        : "ID card template created successfully."
    );

  } catch (error) {
    console.error(
      "FAILED TO SAVE ID CARD TEMPLATE",
      error
    );

    window.alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to save ID card template."
    );

  } finally {
    setSavingTemplate(false);
  }
};


// ============================================================
// LOAD TEMPLATE FROM BACKEND
// ============================================================

const loadTemplateFromBackend = async (
  id
) => {
  if (!id) {
    return;
  }

  try {
    const response =
      await API.get(
        `/id-card/templates/${id}`
      );

    const template =
      response.data?.template;

    if (!template) {
      throw new Error(
        "Template data not found."
      );
    }

    // ========================================================
    // STORE TEMPLATE INFORMATION
    // ========================================================

    setTemplateId(
      template._id
    );

    setTemplateName(
      template.name || ""
    );

    setTemplateDescription(
      template.description || ""
    );

    // ========================================================
    // RESTORE DESIGN STATE
    // ========================================================

    const design =
      template.design || {};

    setCardDesign(
      design
    );

    // ========================================================
    // RESTORE FRONT SIDE
    // ========================================================

    isRestoringDraftRef.current =
      true;

    await restoreSide(
      design.front
    );

    setActiveSide(
      "front"
    );

    setBackground(
      design.front?.background ||
        getDefaultBackground()
    );

    canvas?.requestRenderAll();

    console.log(
      "ID CARD TEMPLATE LOADED:",
      template
    );

  } catch (error) {
    console.error(
      "FAILED TO LOAD ID CARD TEMPLATE",
      error
    );

    window.alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to load ID card template."
    );

  } finally {
    isRestoringDraftRef.current =
      false;
  }
};

// ============================================================
// LOAD TEMPLATE FROM URL
// ============================================================

useEffect(() => {
  if (
    !canvas ||
    !routeTemplateId
  ) {
    return;
  }

  loadTemplateFromBackend(
    routeTemplateId
  );
}, [
  canvas,
  routeTemplateId,
]);
  // ============================================================
  // APPLY COLOR BACKGROUND
  // ============================================================

  const applyColorBackground = (
    color
  ) => {
    if (!canvas) {
      return;
    }

    canvas.backgroundImage =
      null;

    canvas.backgroundColor =
      color || "#ffffff";

    canvas.requestRenderAll();

    setBackground({
      ...getDefaultBackground(),

      type: "color",

      color:
        color || "#ffffff",
    });
  };

  // ============================================================
  // APPLY GRADIENT BACKGROUND
  // ============================================================

  const applyGradientBackground = ({
    gradientType = "linear",
    color1 = "#ffffff",
    color2 = "#111111",
    angle = 0,
  }) => {
    if (!canvas) {
      return;
    }

    const width =
      canvas.getWidth();

    const height =
      canvas.getHeight();

    let coords;

    // ==========================================================
    // RADIAL
    // ==========================================================

    if (
      gradientType === "radial"
    ) {
      coords = {
        x1:
          width / 2,

        y1:
          height / 2,

        x2:
          width / 2,

        y2:
          height / 2,

        r1: 0,

        r2:
          Math.max(
            width,
            height
          ) / 2,
      };
    }

    // ==========================================================
    // LINEAR
    // ==========================================================

    else {
      const radians =
        (angle * Math.PI) /
        180;

      const x =
        Math.cos(
          radians
        );

      const y =
        Math.sin(
          radians
        );

      coords = {
        x1:
          width / 2 -
          (x * width) / 2,

        y1:
          height / 2 -
          (y * height) / 2,

        x2:
          width / 2 +
          (x * width) / 2,

        y2:
          height / 2 +
          (y * height) / 2,
      };
    }

    const gradient =
      new Gradient({
        type:
          gradientType,

        coords,

        colorStops: [
          {
            offset: 0,
            color: color1,
          },

          {
            offset: 1,
            color: color2,
          },
        ],
      });

    canvas.backgroundImage =
      null;

    canvas.backgroundColor =
      gradient;

    canvas.requestRenderAll();

    setBackground({
      type: "gradient",

      gradientType,
      color1,
      color2,
      angle,

      imageUrl: null,
      imageFit: "cover",
    });
  };

  // ============================================================
  // APPLY IMAGE BACKGROUND
  // ============================================================

  const applyImageBackground = (
    imageUrl,
    imageFit = "cover"
  ) => {
    if (
      !canvas ||
      !imageUrl
    ) {
      return;
    }

    const imageElement =
      new Image();

    imageElement.onload =
      () => {
        const image =
          new FabricImage(
            imageElement
          );

        const canvasWidth =
          canvas.getWidth();

        const canvasHeight =
          canvas.getHeight();

        let scale;

        // ======================================================
        // CONTAIN
        // ======================================================

        if (
          imageFit ===
          "contain"
        ) {
          scale =
            Math.min(
              canvasWidth /
                image.width,

              canvasHeight /
                image.height
            );
        }

        // ======================================================
        // COVER
        // ======================================================

        else {
          scale =
            Math.max(
              canvasWidth /
                image.width,

              canvasHeight /
                image.height
            );
        }

        image.scale(
          scale
        );

        image.set({
          left:
            canvasWidth / 2,

          top:
            canvasHeight / 2,

          originX:
            "center",

          originY:
            "center",

          selectable:
            false,

          evented:
            false,
        });

        canvas.backgroundImage =
          image;

        canvas.requestRenderAll();

        setBackground({
          type: "image",

          imageUrl,
          imageFit,

          color: "#ffffff",

          gradientType:
            "linear",

          color1:
            "#ffffff",

          color2:
            "#111111",

          angle: 0,
        });
      };

    imageElement.onerror =
      () => {
        console.error(
          "FAILED TO LOAD BACKGROUND IMAGE",
          imageUrl
        );
      };

    imageElement.src =
      imageUrl;
  };

  // ============================================================
  // UPDATE BACKGROUND
  // ============================================================

  const updateBackground = (
    value
  ) => {
    if (!value) {
      return;
    }

    if (
      value.type ===
      "color"
    ) {
      applyColorBackground(
        value.color
      );

      return;
    }

    setBackground(
      value
    );
  };

  // ============================================================
  // RESTORE BACKGROUND
  // ============================================================

  const restoreBackground = async (
    savedBackground
  ) => {
    if (
      !canvas ||
      !savedBackground
    ) {
      return;
    }

    // ==========================================================
    // COLOR
    // ==========================================================

    if (
      savedBackground.type ===
      "color"
    ) {
      canvas.backgroundImage =
        null;

      canvas.backgroundColor =
        savedBackground.color ||
        "#ffffff";

      return;
    }

    // ==========================================================
    // GRADIENT
    // ==========================================================

    if (
      savedBackground.type ===
      "gradient"
    ) {
      const width =
        canvas.getWidth();

      const height =
        canvas.getHeight();

      let coords;

      if (
        savedBackground.gradientType ===
        "radial"
      ) {
        coords = {
          x1:
            width / 2,

          y1:
            height / 2,

          x2:
            width / 2,

          y2:
            height / 2,

          r1: 0,

          r2:
            Math.max(
              width,
              height
            ) / 2,
        };
      } else {
        const radians =
          (savedBackground.angle ||
            0) *
          Math.PI /
          180;

        const x =
          Math.cos(
            radians
          );

        const y =
          Math.sin(
            radians
          );

        coords = {
          x1:
            width / 2 -
            (x * width) / 2,

          y1:
            height / 2 -
            (y * height) / 2,

          x2:
            width / 2 +
            (x * width) / 2,

          y2:
            height / 2 +
            (y * height) / 2,
        };
      }

      canvas.backgroundImage =
        null;

      canvas.backgroundColor =
        new Gradient({
          type:
            savedBackground.gradientType ||
            "linear",

          coords,

          colorStops: [
            {
              offset: 0,

              color:
                savedBackground.color1 ||
                "#ffffff",
            },

            {
              offset: 1,

              color:
                savedBackground.color2 ||
                "#111111",
            },
          ],
        });

      return;
    }

    // ==========================================================
    // IMAGE
    // ==========================================================

    if (
      savedBackground.type ===
      "image"
    ) {
      if (
        !savedBackground.imageUrl
      ) {
        return;
      }

      await new Promise(
        (resolve) => {
          const imageElement =
            new Image();

          imageElement.onload =
            () => {
              const image =
                new FabricImage(
                  imageElement
                );

              const width =
                canvas.getWidth();

              const height =
                canvas.getHeight();

              let scale;

              if (
                savedBackground.imageFit ===
                "contain"
              ) {
                scale =
                  Math.min(
                    width /
                      image.width,

                    height /
                      image.height
                  );
              } else {
                scale =
                  Math.max(
                    width /
                      image.width,

                    height /
                      image.height
                  );
              }

              image.scale(
                scale
              );

              image.set({
                left:
                  width / 2,

                top:
                  height / 2,

                originX:
                  "center",

                originY:
                  "center",

                selectable:
                  false,

                evented:
                  false,
              });

              canvas.backgroundImage =
                image;

              resolve();
            };

          imageElement.onerror =
            () => {
              console.error(
                "FAILED TO RESTORE BACKGROUND IMAGE",
                savedBackground.imageUrl
              );

              resolve();
            };

          imageElement.src =
            savedBackground.imageUrl;
        }
      );
    }
  };

  // ============================================================
// RESTORE FRAME ↔ IMAGE RELATIONSHIPS
// ============================================================

const restoreFrameRelationships = () => {
  if (!canvas) {
    return;
  }

  const objects =
    canvas.getObjects();


    console.log(
  "RESTORE OBJECTS:",
  objects.map(
    (object) => ({
      type:
        object.type,

      idCardFrame:
        object.idCardFrame,

      idCardFrameId:
        object.idCardFrameId,

      idCardFrameImageMarker:
        object.idCardFrameImageMarker,
    })
  )
);
  // ==========================================================
  // FIND ALL FRAMES
  // ==========================================================

  const frames =
    objects.filter(
      (object) =>
        object?.idCardFrame === true
    );
console.log(
  "RESTORED FRAME COUNT:",
  frames.length
);
  // ==========================================================
  // FIND ALL FRAME IMAGES
  // ==========================================================

const frameImages =
  objects.filter(
    (object) =>
      object?.idCardFrameImageMarker === true
  );

  console.log(
  "RESTORED FRAME IMAGE COUNT:",
  frameImages.length
);
  // ==========================================================
  // RECONNECT FRAME → IMAGE
  // ==========================================================

  frames.forEach(
    (frame) => {
      const frameId =
        frame.idCardFrameId;

      if (!frameId) {
        return;
      }

      const image =
        frameImages.find(
          (item) =>
            item.idCardFrameId ===
            frameId
        );


        console.log(
  "FRAME RESTORE:",
  {
    frameId,
    imageFound:
      Boolean(image),
  }
);

      if (!image) {
        console.warn(
          "FRAME IMAGE NOT FOUND:",
          frameId
        );

        return;
      }

      // ========================================================
      // RECONNECT RUNTIME REFERENCE
      // ========================================================

      frame.idCardFrameImage =
        image;

      // ========================================================
      // FRAME CENTER
      // ========================================================

      const frameCenter =
        frame.getCenterPoint();

      // ========================================================
      // REBUILD CLIP PATH
      // ========================================================

      const clipPath =
        new Rect({
          width:
            frame.getScaledWidth(),

          height:
            frame.getScaledHeight(),

          originX:
            "center",

          originY:
            "center",

          left:
            frameCenter.x,

          top:
            frameCenter.y,

          rx:
            frame.rx || 0,

          ry:
            frame.ry || 0,

          angle:
            frame.angle || 0,

          absolutePositioned:
            true,
        });

      image.clipPath =
        clipPath;

      // ========================================================
      // RESTORE FRAME MOVEMENT TRACKING
      // ========================================================

      frame.idCardPreviousLeft =
        frame.left;

      frame.idCardPreviousTop =
        frame.top;

      // ========================================================
      // KEEP IMAGE BELOW FRAME
      // ========================================================

      const frameIndex =
        canvas
          .getObjects()
          .indexOf(frame);

      const imageIndex =
        canvas
          .getObjects()
          .indexOf(image);

      if (
        imageIndex >
        frameIndex
      ) {
        canvas.sendObjectBackwards(
          image
        );
      }

      // ========================================================
      // UPDATE FABRIC COORDINATES
      // ========================================================

// ========================================================
// RESTORE IMAGE FIT
// ========================================================

const savedFit =
  frame.idCardFrameFit ===
  "contain"
    ? "contain"
    : "cover";

const frameWidth =
  frame.getScaledWidth();

const frameHeight =
  frame.getScaledHeight();

if (
  image.width &&
  image.height
) {
  const restoredScale =
    savedFit === "contain"
      ? Math.min(
          frameWidth /
            image.width,

          frameHeight /
            image.height
        )
      : Math.max(
          frameWidth /
            image.width,

          frameHeight /
            image.height
        );

  const frameCenter =
    frame.getCenterPoint();

  image.set({
    originX:
      "center",

    originY:
      "center",

    scaleX:
      restoredScale,

    scaleY:
      restoredScale,

    left:
      frameCenter.x,

    top:
      frameCenter.y,

    idCardFrameFit:
      savedFit,
  });
}

// ========================================================
// UPDATE FABRIC COORDINATES
// ========================================================

image.setCoords();

clipPath.setCoords();

frame.setCoords();
    }
  );

  canvas.requestRenderAll();
};


// ============================================================
// PRELOAD FONTS USED BY SAVED CANVAS OBJECTS
// ============================================================

const preloadCanvasFonts = async (
  sideDesign
) => {
  const objects =
    sideDesign?.canvas?.objects || [];

  const fontFamilies =
    [
      ...new Set(
        objects
          .map(
            (object) =>
              object?.fontFamily
          )
          .filter(Boolean)
      ),
    ];

  if (
    fontFamilies.length === 0
  ) {
    return;
  }

  console.log(
    "RESTORE FONTS:",
    fontFamilies
  );

  await Promise.all(
    fontFamilies.map(
      async (family) => {
        const font =
          ID_CARD_FONTS.find(
            (item) =>
              item.family ===
              family
          );

        if (!font) {
          console.warn(
            "FONT NOT FOUND IN REGISTRY:",
            family
          );

          return;
        }

        await loadIDCardFont(
          font
        );
      }
    )
  );

  await document.fonts.ready;

  console.log(
    "RESTORE FONTS READY:",
    fontFamilies
  );
};


  // ============================================================
  // RESTORE ONE SIDE
  // ============================================================

// const restoreSide = async (
//   sideDesign
// ) => {
//   if (
//     !canvas ||
//     !sideDesign
//   ) {
//     return;
//   }

//   // ==========================================================
//   // LOAD ALL FONTS BEFORE FABRIC RESTORES TEXT OBJECTS
//   // ==========================================================

//   await preloadCanvasFonts(
//     sideDesign
//   );

//   canvas.clear();

//     canvas.backgroundImage =
//       null;

//     canvas.backgroundColor =
//       "#ffffff";

//     // ==========================================================
//     // RESTORE FABRIC OBJECTS
//     // ==========================================================

// if (
//   sideDesign.canvas
// ) {
//   await canvas.loadFromJSON(
//     sideDesign.canvas
//   );

//   // ==========================================================
//   // RESTORE DYNAMIC TEXT STYLING
//   // ==========================================================

//   const restoredObjects =
//     canvas.getObjects();

//   restoredObjects.forEach(
//     (object) => {

//       if (
//         object?.idCardDynamicField !==
//         true
//       ) {
//         return;
//       }

//       // --------------------------------------------------------
//       // Fabric has already restored these values from JSON.
//       // Explicitly re-apply them so our Dynamic Field remains
//       // a normal styled Textbox after refresh.
//       // --------------------------------------------------------

//       const savedTextStyle = {
//         fontFamily:
//           object.fontFamily ??
//           "Arial",

//         fontSize:
//           Number(
//             object.fontSize ??
//             24
//           ),

//         fontWeight:
//           object.fontWeight ??
//           "400",

//         fontStyle:
//           object.fontStyle ??
//           "normal",

//         fill:
//           object.fill ??
//           "#111111",

//         textAlign:
//           object.textAlign ??
//           "left",

//         charSpacing:
//           Number(
//             object.charSpacing ??
//             0
//           ),

//         lineHeight:
//           Number(
//             object.lineHeight ??
//             1.16
//           ),

//         underline:
//           Boolean(
//             object.underline
//           ),

//         linethrough:
//           Boolean(
//             object.linethrough
//           ),
//       };

//       object.set(
//         savedTextStyle
//       );

//       object.setCoords();
//     }
//   );

//   canvas.requestRenderAll();
// }

//     // ==========================================================
// // RESTORE FRAME ↔ IMAGE LINKS
// // ==========================================================

// restoreFrameRelationships();

//     // ==========================================================
//     // RESTORE BACKGROUND
//     // ==========================================================

//     await restoreBackground(
//       sideDesign.background
//     );

//     canvas.requestRenderAll();
//   };


const restoreSide = async (
  sideDesign
) => {
  if (
    !canvas ||
    !sideDesign
  ) {
    return;
  }

  await preloadCanvasFonts(
    sideDesign
  );

  canvas.clear();

  canvas.backgroundImage =
    null;

  canvas.backgroundColor =
    "#ffffff";

  if (
    sideDesign.canvas
  ) {
    await canvas.loadFromJSON(
      sideDesign.canvas
    );

    const restoredObjects =
      canvas.getObjects();

    restoredObjects.forEach(
      (object) => {

        if (
          object?.idCardDynamicField !==
          true
        ) {
          return;
        }

        const savedTextStyle = {
          fontFamily:
            object.fontFamily ??
            "Arial",

          fontSize:
            Number(
              object.fontSize ??
              24
            ),

          fontWeight:
            object.fontWeight ??
            "400",

          fontStyle:
            object.fontStyle ??
            "normal",

          fill:
            object.fill ??
            "#111111",

          textAlign:
            object.textAlign ??
            "left",

          charSpacing:
            Number(
              object.charSpacing ??
              0
            ),

          lineHeight:
            Number(
              object.lineHeight ??
              1.16
            ),

          underline:
            Boolean(
              object.underline
            ),

          linethrough:
            Boolean(
              object.linethrough
            ),
        };

        object.set(
          savedTextStyle
        );

        object.setCoords();
      }
    );

    canvas.requestRenderAll();
  }

  restoreFrameRelationships();

  await restoreBackground(
    sideDesign.background
  );

  canvas.requestRenderAll();
};

  // ============================================================
  // AUTO SAVE FABRIC CHANGES
  // ============================================================

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const handleCanvasChange =
      () => {
        if (
          isRestoringDraftRef.current
        ) {
          return;
        }

        saveCurrentSide();
      };

    canvas.on(
      "object:added",
      handleCanvasChange
    );

    canvas.on(
      "object:modified",
      handleCanvasChange
    );

    canvas.on(
      "object:removed",
      handleCanvasChange
    );

    return () => {
      canvas.off(
        "object:added",
        handleCanvasChange
      );

      canvas.off(
        "object:modified",
        handleCanvasChange
      );

      canvas.off(
        "object:removed",
        handleCanvasChange
      );
    };
  }, [
    canvas,
    activeSide,
    background,
    cardDesign,
  ]);


//   useEffect(() => {
//   if (!canvas) {
//     return;
//   }

//   const handleCanvasChange =
//     () => {
//       if (
//         isRestoringDraftRef.current
//       ) {
//         return;
//       }

//       saveCurrentSide();
//     };

//   canvas.on(
//     "object:added",
//     handleCanvasChange
//   );

//   canvas.on(
//     "object:modified",
//     handleCanvasChange
//   );

//   canvas.on(
//     "object:removed",
//     handleCanvasChange
//   );

//   return () => {
//     canvas.off(
//       "object:added",
//       handleCanvasChange
//     );

//     canvas.off(
//       "object:modified",
//       handleCanvasChange
//     );

//     canvas.off(
//       "object:removed",
//       handleCanvasChange
//     );
//   };
// }, [
//   canvas,
//   activeSide,
//   background,
//   cardDesign,
// ]);

  // ============================================================
  // AUTO SAVE BACKGROUND
  // ============================================================

  useEffect(() => {
    if (
      !canvas ||
      isRestoringDraftRef.current
    ) {
      return;
    }

    saveCurrentSide();
  }, [background]);

// ============================================================
// NEW TEMPLATE INITIALIZATION
// ============================================================
//
// A new template must always start with a clean canvas.
//
// Existing templates are restored from the backend using
// routeTemplateId.
//
// We intentionally do NOT restore the previous local draft
// into a new template.
//

useEffect(() => {
  if (
    !canvas ||
    routeTemplateId ||
    draftRestoredRef.current
  ) {
    return;
  }

  // ----------------------------------------------------------
  // NEW TEMPLATE = CLEAN CANVAS
  // ----------------------------------------------------------

  isRestoringDraftRef.current = true;

  canvas.clear();

  canvas.backgroundImage = null;

  canvas.backgroundColor = "#ffffff";

  canvas.requestRenderAll();

  setCardDesign({
    front: {
      canvas: null,
      background:
        getDefaultBackground(),
    },

    back: {
      canvas: null,
      background:
        getDefaultBackground(),
    },
  });

  setBackground(
    getDefaultBackground()
  );

  setSelectedObject(null);

  draftRestoredRef.current = true;

  isRestoringDraftRef.current = false;

  console.log(
    "NEW ID CARD TEMPLATE INITIALIZED"
  );

}, [canvas, routeTemplateId]);

  // ============================================================
  // SWITCH FRONT / BACK
  // ============================================================

  const switchCardSide = async (
    nextSide
  ) => {
    if (
      !canvas ||
      activeSide === nextSide
    ) {
      return;
    }

    isRestoringDraftRef.current =
      true;

    try {
      const updatedDesign =
        saveCurrentSide();

      const nextDesign =
        updatedDesign[
          nextSide
        ];

      await restoreSide(
        nextDesign
      );

      setActiveSide(
        nextSide
      );

      setBackground(
        nextDesign?.background ||
          getDefaultBackground()
      );

      setSelectedObject(
        null
      );

      canvas.requestRenderAll();
    } catch (error) {
      console.error(
        "FAILED TO SWITCH CARD SIDE",
        error
      );
    } finally {
      isRestoringDraftRef.current =
        false;
    }
  };

  // ============================================================
  // TEMPORARY FRAME HANDLERS
  //
  // These are intentionally empty for now.
  //
  // The old Frame implementation has been removed.
  // We will replace it with the new centralized Frame system.
  // ============================================================

  const handleCreateFrame = () => {
  frameApiRef.current?.createFrame();
};


// ============================================================
// TEST DYNAMIC STUDENT PHOTO
// ============================================================
// ============================================================
// SINGLE STUDENT DYNAMIC RENDERER
// ============================================================
//
// Renders one student's data into the current Fabric canvas.
//
// IMPORTANT:
// This works on the current canvas only.
// It does NOT save the resolved student values
// back into the master template.
//
// ============================================================

// ============================================================
// SINGLE STUDENT DYNAMIC RENDERER
// ============================================================
//
// Renders one student's data into the current Fabric canvas.
//
// Handles:
// 1. Dynamic text
// 2. Dynamic student photo
//
// QR is intentionally handled separately.
//
// IMPORTANT:
// This works only on the current Fabric canvas.
// It does NOT save resolved student data back to the
// master ID-card template.
// ============================================================

const renderStudentDynamicFields = async (
  studentData
) => {

  if (!canvas) {
    console.warn(
      "STUDENT RENDERER: Canvas not ready."
    );

    return false;
  }

  if (!studentData) {
    console.warn(
      "STUDENT RENDERER: Student data missing."
    );

    return false;
  }


  // ==========================================================
  // BUILD STUDENT CONTEXT
  // ==========================================================

  const context = {

    student:
      studentData,

    institution:
      studentData?.institutionId,

    department:
      studentData?.departmentId,

    programme:
      studentData?.programmeId,

    classData:
      studentData?.classId,

  };


  console.log(
    "STUDENT RENDER CONTEXT:",
    context
  );


  // ==========================================================
  // FIND DYNAMIC OBJECTS
  // ==========================================================

  const dynamicObjects =
    canvas.getObjects().filter(
      (object) =>
        object?.idCardDynamicField === true &&
        object?.idCardDynamicKey
    );


  console.log(
    "DYNAMIC OBJECTS FOUND:",
    dynamicObjects.length
  );


  // ==========================================================
  // RESOLVE EACH DYNAMIC FIELD
  // ==========================================================

  for (
    const object
    of dynamicObjects
  ) {

    const dynamicKey =
      object.idCardDynamicKey;


const resolvedValue =
  resolveDynamicField(
    dynamicKey,
    studentData
  );


      let renderValue =
  resolvedValue;

if (
  dynamicKey === "studentPhoto" &&
  typeof resolvedValue === "string" &&
  resolvedValue.startsWith("/uploads/")
) {
  renderValue =
    `http://localhost:3000${resolvedValue}`;
}


    console.log(
      "DYNAMIC FIELD RENDER:",
      {
        key: dynamicKey,
        value: resolvedValue,
      }
    );


// ========================================================
// QR CODE
// ========================================================

if (
  dynamicKey === "qrCode"
) {

  const qrResult =
    await frameApiRef.current?.createDynamicQRCode(
      studentData
    );

  console.log(
    "STUDENT QR RENDER RESULT:",
    qrResult
  );

  continue;
}


    // ========================================================
    // STUDENT PHOTO
    // ========================================================

    if (
      dynamicKey === "studentPhoto"
    ) {

      if (!resolvedValue) {

        console.warn(
          "STUDENT PHOTO VALUE IS EMPTY."
        );

        continue;

      }


      console.log(
        "POPULATING STUDENT PHOTO:",
        resolvedValue
      );


const photoFrame =
  canvas.getObjects().find(
    (object) =>
      object?.idCardDynamicField === true &&
      object?.idCardDynamicKey === "studentPhoto" &&
      object?.idCardFrame === true
  );

if (!photoFrame) {
  console.warn(
    "STUDENT PHOTO FRAME NOT FOUND."
  );

  continue;
}

// ========================================================
// STUDENT PHOTO
// ========================================================

if (
  dynamicKey === "studentPhoto"
) {

  if (!resolvedValue) {

    console.warn(
      "STUDENT PHOTO VALUE IS EMPTY."
    );

    continue;

  }

  console.log(
    "POPULATING STUDENT PHOTO:",
    resolvedValue
  );


const photoRendered =
  await frameApiRef.current?.addImageToFrame(
    renderValue,
    photoFrame
  );


  console.log(
    "STUDENT PHOTO RENDER RESULT:",
    photoRendered
  );


  continue;
}


      console.log(
        "STUDENT PHOTO RENDER RESULT:",
        photoRendered
      );


      continue;

    }


    // ========================================================
    // TEXT FIELDS
    // ========================================================

    if (
      typeof object.text ===
      "string"
    ) {

      object.set({
        text:
          resolvedValue ?? "",
      });

      object.setCoords();

    }

  }


  // ==========================================================
  // FINAL RENDER
  // ==========================================================

  canvas.requestRenderAll();


  console.log(
    "SINGLE STUDENT DYNAMIC RENDER COMPLETE."
  );


  return true;
};

// ============================================================
// TEMPORARY SINGLE STUDENT RENDER TEST
// ============================================================




// ============================================================
// ASSIGN DYNAMIC STUDENT PHOTO
// ============================================================

const handleAssignDynamicPhoto = () => {
  if (
    !canvas ||
    !frameApiRef.current
  ) {
    return;
  }

  const activeObject =
    canvas.getActiveObject();

  if (!activeObject) {
    window.alert(
      "Please select a frame first."
    );

    return;
  }

  const isFrame =
    frameApiRef.current.isFrameObject?.(
      activeObject
    );

  if (!isFrame) {
    window.alert(
      "Student Photo can only be assigned to a frame."
    );

    return;
  }

  activeObject.set({
    idCardDynamicField:
      true,

    idCardDynamicKey:
      "studentPhoto",

    idCardDynamicLabel:
      "Student Photo",
  });

  activeObject.setCoords();

  canvas.setActiveObject(
    activeObject
  );

  canvas.requestRenderAll();

  setSelectedObject({
    object:
      activeObject,

    left:
      activeObject.left || 0,

    top:
      activeObject.top || 0,

    width:
      activeObject.getScaledWidth(),

    height:
      activeObject.getScaledHeight(),

    angle:
      activeObject.angle || 0,
  });

  saveCurrentSide();

  console.log(
    "DYNAMIC STUDENT PHOTO ASSIGNED:",
    activeObject.idCardFrameId
  );
};


// ============================================================
// ASSIGN DYNAMIC QR CODE TO SELECTED FRAME
// ============================================================

const handleAssignDynamicFieldToFrame = (
  fieldKey,
  fieldLabel
) => {

  if (
    !canvas ||
    !frameApiRef.current
  ) {
    return;
  }

  const activeObject =
    canvas.getActiveObject();

  if (!activeObject) {
    window.alert(
      "Please select a frame first."
    );

    return;
  }

  const isFrame =
    frameApiRef.current.isFrameObject?.(
      activeObject
    );

  if (!isFrame) {
    window.alert(
      `${fieldLabel} can only be assigned to a frame.`
    );

    return;
  }

  activeObject.set({

    idCardDynamicField:
      true,

    idCardDynamicKey:
      fieldKey,

    idCardDynamicLabel:
      fieldLabel,

  });

  activeObject.setCoords();

  canvas.setActiveObject(
    activeObject
  );

  canvas.requestRenderAll();

  setSelectedObject({

    object:
      activeObject,

    left:
      activeObject.left || 0,

    top:
      activeObject.top || 0,

    width:
      activeObject.getScaledWidth(),

    height:
      activeObject.getScaledHeight(),

    angle:
      activeObject.angle || 0,

  });

  saveCurrentSide();

  console.log(
    "DYNAMIC FIELD ASSIGNED TO FRAME:",
    {
      fieldKey,
      fieldLabel,
      frameId:
        activeObject.idCardFrameId,
    }
  );
};


const handleFrameImage = async (
  imageUrl,
  frame
) => {
  if (
    !imageUrl ||
    !frame
  ) {
    return;
  }

  await frameApiRef.current?.addImageToFrame(
    imageUrl
  );
};

const handleFrameImageFitChange = async (
  frame,
  fitMode
) => {
  if (
    !frame ||
    !fitMode ||
    !frameApiRef.current
  ) {
    return;
  }

  try {
    const success =
      frameApiRef.current.applyFrameImageFit(
        frame,
        fitMode
      );

    if (!success) {
      console.error(
        "FAILED TO APPLY FRAME IMAGE FIT"
      );

      return;
    }

    // ========================================================
    // SAVE THE NEW FIT STATE
    // ========================================================

    saveCurrentSide();

    console.log(
      "FRAME IMAGE FIT APPLIED:",
      fitMode
    );

    console.log(
      "FRAME IMAGE FIT SAVED"
    );
  } catch (error) {
    console.error(
      "FAILED TO APPLY FRAME IMAGE FIT",
      error
    );
  }
};

const handleFrameImageReplace = async (
  imageUrl,
  frame
) => {
  if (
    !imageUrl ||
    !frame ||
    !frameApiRef.current
  ) {
    return;
  }

  try {
    const replaced =
      await frameApiRef.current.replaceFrameImage(
        imageUrl,
        frame
      );

    if (!replaced) {
      console.error(
        "FRAME IMAGE REPLACEMENT FAILED"
      );

      return;
    }

    console.log(
      "FRAME IMAGE REPLACED"
    );
  } catch (error) {
    console.error(
      "FAILED TO REPLACE FRAME IMAGE",
      error
    );
  }
};

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="id_card_designer">
      {/* ======================================================
          HEADER
      ====================================================== */}

<div className="id_card_designer_header">

  <div>
    <h2>
      ID Card Designer
    </h2>
  </div>

  {/* ====================================================
      TEMPLATE CONTROLS
  ==================================================== */}

  <div className="id_card_template_controls">

    <input
      type="text"
      value={templateName}
      onChange={(e) =>
        setTemplateName(
          e.target.value
        )
      }
      placeholder="Template name"
      disabled={savingTemplate}
    />

    <input
      type="text"
      value={templateDescription}
      onChange={(e) =>
        setTemplateDescription(
          e.target.value
        )
      }
      placeholder="Description"
      disabled={savingTemplate}
    />

    <button
      type="button"
      onClick={
        saveTemplateToBackend
      }
      disabled={
        savingTemplate ||
        !templateName.trim()
      }
    >
      {savingTemplate
        ? "Saving..."
        : templateId
        ? "Update Template"
        : "Save Template"}
    </button>

  </div>

  {/* ====================================================
      FRONT / BACK SWITCHER
  ==================================================== */}

  <div className="id_card_side_switcher">

    <button
      type="button"
      className={
        activeSide === "front"
          ? "active"
          : ""
      }
      onClick={() =>
        switchCardSide("front")
      }
    >
      Front
    </button>

    <button
      type="button"
      className={
        activeSide === "back"
          ? "active"
          : ""
      }
      onClick={() =>
        switchCardSide("back")
      }
    >
      Back
    </button>

  </div>

</div>

      {/* ======================================================
          WORKSPACE
      ====================================================== */}

      <div className="id_card_designer_workspace">
        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <IDCardToolbar
           canvas={canvas}
  background={background}
  onCreateFrame={handleCreateFrame}

  onAddDynamicField={(
  fieldKey,
  fieldLabel
) => {
  frameApiRef.current?.createDynamicField(
    fieldKey,
    fieldLabel
  );
}}

onAssignDynamicPhoto={
  handleAssignDynamicPhoto
}

onAssignDynamicFieldToFrame={
  handleAssignDynamicFieldToFrame
}


onCreateDynamicQRCode={() => {
  frameApiRef.current?.createDynamicQRCode();
}}

          onBackgroundChange={
            updateBackground
          }

          onGradientBackground={
            applyGradientBackground
          }

          onImageBackground={
            applyImageBackground
          }

   onFrameImage={handleFrameImage}

          isDrawingMode={
            isDrawingMode
          }

          onDrawingModeChange={
            setIsDrawingMode
          }

          isVectorMode={
            isVectorMode
          }

          onVectorModeChange={
            setIsVectorMode
          }
        />

        {/* <button
  type="button"
  onClick={
    handleTestDynamicPhoto
  }
  style={{
    margin: "10px",
    padding: "8px 12px",
  }}
>
  Test Dynamic Photo
</button> */}

        {/* ====================================================
            CANVAS
        ==================================================== */}

        <div className="id_card_canvas_area">
<IDCardCanvas
  ref={frameApiRef}

  onObjectSelected={
    setSelectedObject
  }

  onCanvasReady={
    setCanvas
  }

  isDrawingMode={
    isDrawingMode
  }

  isVectorMode={
    isVectorMode
  }

  onVectorModeFinished={() =>
    setIsVectorMode(
      false
    )
  }
/>
        </div>

        {/* ====================================================
            PROPERTIES
        ==================================================== */}

<IDCardProperties
  selectedObject={
    selectedObject
  }

  canvas={
    canvas
  }

  background={
    background
  }

  onObjectSelected={
    setSelectedObject
  }

  onFrameImageFitChange={
    handleFrameImageFitChange
  }

  onFrameImageReplace={
    handleFrameImageReplace
  }

  onBackgroundImageReplace={
    applyImageBackground
  }

  onBackgroundImageRemove={() => {
    if (!canvas) {
      return;
    }

    canvas.backgroundImage =
      null;

    canvas.requestRenderAll();

    setBackground(
      getDefaultBackground()
    );

    saveCurrentSide();
  }}

  onBackgroundOpacityChange={(
    opacity
  ) => {
    if (
      !canvas?.backgroundImage
    ) {
      return;
    }

    canvas.backgroundImage.set({
      opacity:
        Number(opacity),
    });

    canvas.requestRenderAll();

    setBackground(
      (prev) => ({
        ...prev,

        backgroundOpacity:
          Number(opacity),
      })
    );

    saveCurrentSide();
  }}

  onBackgroundImageFitChange={(
    fitMode
  ) => {
    if (
      !canvas?.backgroundImage
    ) {
      return;
    }

    const image =
      canvas.backgroundImage;

    const canvasWidth =
      canvas.getWidth();

    const canvasHeight =
      canvas.getHeight();

    if (
      !image.width ||
      !image.height
    ) {
      return;
    }

    const scale =
      fitMode === "contain"
        ? Math.min(
            canvasWidth /
              image.width,

            canvasHeight /
              image.height
          )
        : Math.max(
            canvasWidth /
              image.width,

            canvasHeight /
              image.height
          );

    image.set({
      scaleX:
        scale,

      scaleY:
        scale,

      left:
        canvasWidth / 2,

      top:
        canvasHeight / 2,

      originX:
        "center",

      originY:
        "center",

      opacity:
        Number(
          background?.backgroundOpacity ??
          image.opacity ??
          1
        ),
    });

    canvas.requestRenderAll();

    setBackground(
      (prev) => ({
        ...prev,

        type: "image",

        imageFit:
          fitMode,

        backgroundOpacity:
          Number(
            prev.backgroundOpacity ??
            image.opacity ??
            1
          ),
      })
    );

    saveCurrentSide();

    console.log(
      "BACKGROUND IMAGE FIT APPLIED:",
      fitMode
    );
  }}
/>



      </div>




<button
  type="button"
  onClick={async () => {
    console.log("=== TEST STUDENT RENDER ===");

    const response = await API.get(
      `/students/id-card-data/6a7c4178a18db4c564e0d66d`
    );

    const studentData = response.data?.data;

    console.log(
      "TEST STUDENT DATA:",
      studentData
    );

    await renderStudentDynamicFields(
      studentData
    );
  }}
>
  Test Student Render
</button>

    </div>
  );
};

export default IDCardDesigner;