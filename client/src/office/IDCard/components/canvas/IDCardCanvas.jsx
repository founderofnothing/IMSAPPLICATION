import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import {
  Canvas,
  PencilBrush,
  Circle,
  Rect,
  Path,
  FabricImage,
  Textbox,

  Gradient,
  FabricObject,
} from "fabric";

import {
  ID_CARD_WIDTH,
  ID_CARD_HEIGHT,
} from "../../utils/idCardConstants";

import {
  resolveDynamicField,
} from "../../utilsid/idCard/dynamicFieldResolver";
import{
  ID_CARD_FONTS,
  loadIDCardFont,
} from "../../utils/idCardFonts"
import QRCode from "qrcode";
import "./IDCardCanvas.css";

// ============================================================
// FABRIC CUSTOM PROPERTIES
// ============================================================

FabricObject.customProperties = [
  "idCardFrame",
  "idCardFrameId",
  "idCardFrameType",

  "idCardFrameImageMarker",
  "idCardFrameFit",
  "idCardFrameImageUrl",

  "idCardFrameImageOffsetX",
  "idCardFrameImageOffsetY",

  "idCardTextCase",
  "idCardOriginalText",

  "idCardDynamicField",
  "idCardDynamicKey",
  "idCardDynamicLabel",

  "idCardQRImageMarker",
  "idCardQRFrameId",
  "idCardQRData",
  "idCardQRPlaceholder",

  "idCardVector",
  "idCardVectorClosed",
  "idCardCornerRadius",
  "idCardOriginalVectorPath",
];


const IDCardCanvas = forwardRef(
  (
    {
      onObjectSelected,
      onCanvasReady,
      isDrawingMode,
      isVectorMode,
      onVectorModeFinished,
    },
    ref
  ) => {
const canvasElementRef =
  useRef(null);

const fabricCanvasRef =
  useRef(null);

// ============================================================
// FRAME IMAGE EDIT MODE
// ============================================================

const frameImageEditRef =
  useRef({
    image: null,
    frame: null,
  });

  // ============================================================
// SMART GUIDE STATE
// ============================================================

const smartGuideRefs =
  useRef({
    vertical: null,
    horizontal: null,
  });


  // ============================================================
// REMOVE SMART GUIDES
// ============================================================

// ============================================================
// MOVE ALL CONTENTS BELONGING TO A FRAME
// ============================================================

const moveFrameContents = (
  frame,
  deltaX,
  deltaY
) => {

  const canvas =
    fabricCanvasRef.current;

  if (
    !canvas ||
    !frame?.idCardFrameId
  ) {
    return;
  }

  const frameId =
    frame.idCardFrameId;

  const contents =
    canvas.getObjects().filter(
      (object) => {

        if (
          object === frame
        ) {
          return false;
        }

        // --------------------------------------------------
        // Normal frame image
        // --------------------------------------------------

        if (
          object ===
          frame.idCardFrameImage
        ) {
          return true;
        }

        // --------------------------------------------------
        // Persisted frame image
        // --------------------------------------------------

        if (
          object.idCardFrameId ===
          frameId
        ) {
          return true;
        }

        // --------------------------------------------------
        // Dynamic QR image
        // --------------------------------------------------

        if (
          object.idCardQRFrameId ===
          frameId
        ) {
          return true;
        }

        return false;
      }
    );

  contents.forEach(
    (content) => {

      content.set({

        left:
          (content.left || 0) +
          deltaX,

        top:
          (content.top || 0) +
          deltaY,

      });

      // ----------------------------------------------------
      // Move clip path together with content
      // ----------------------------------------------------

      if (
        content.clipPath
      ) {

        content.clipPath.set({

          left:
            (content.clipPath.left || 0) +
            deltaX,

          top:
            (content.clipPath.top || 0) +
            deltaY,

        });

        content.clipPath.setCoords();
      }

      content.setCoords();

    }
  );
};


// ============================================================
// REMOVE SMART GUIDES
// ============================================================

const removeSmartGuides = () => {

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    return;
  }

  const guides =
    smartGuideRefs.current;

  if (guides.vertical) {

    canvas.remove(
      guides.vertical
    );

    guides.vertical =
      null;
  }

  if (guides.horizontal) {

    canvas.remove(
      guides.horizontal
    );

    guides.horizontal =
      null;
  }
};

// ============================================================
// SHOW VERTICAL CENTER GUIDE
// ============================================================

const showVerticalCenterGuide = () => {
  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    return;
  }

  if (
    smartGuideRefs.current
      .vertical
  ) {
    return;
  }

  const centerX =
    canvas.getWidth() / 2;

  const guide =
    new Path(
      `M ${centerX} 0 L ${centerX} ${canvas.getHeight()}`,
      {
        fill:
          "transparent",

        stroke:
          "#2563eb",

        strokeWidth:
          1,

        selectable:
          false,

        evented:
          false,

        excludeFromExport:
          true,

        idCardSmartGuide:
          true,
      }
    );

  canvas.add(
    guide
  );

  smartGuideRefs.current.vertical =
    guide;

  canvas.requestRenderAll();
};

// ============================================================
// SHOW HORIZONTAL CENTER GUIDE
// ============================================================

const showHorizontalCenterGuide = () => {
  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    return;
  }

  if (
    smartGuideRefs.current
      .horizontal
  ) {
    return;
  }

  const centerY =
    canvas.getHeight() / 2;

  const guide =
    new Path(
      `M 0 ${centerY} L ${canvas.getWidth()} ${centerY}`,
      {
        fill:
          "transparent",

        stroke:
          "#2563eb",

        strokeWidth:
          1,

        selectable:
          false,

        evented:
          false,

        excludeFromExport:
          true,

        idCardSmartGuide:
          true,
      }
    );

  canvas.add(
    guide
  );

  smartGuideRefs.current.horizontal =
    guide;

  canvas.requestRenderAll();
};

    // ============================================================
  // VECTOR STATE
  // ============================================================

  const vectorPointsRef = useRef([]);
  const vectorControlsRef = useRef([]);
  const vectorPathRef = useRef(null);
  // ============================================================
  // DRAW VECTOR PREVIEW
  // ============================================================

  const redrawVectorPath = () => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    const points =
      vectorPointsRef.current;

    if (vectorPathRef.current) {
      canvas.remove(
        vectorPathRef.current
      );

      vectorPathRef.current =
        null;
    }

    if (points.length < 2) {
      canvas.requestRenderAll();
      return;
    }

    let pathData =
      `M ${points[0].x} ${points[0].y}`;

    for (
      let i = 1;
      i < points.length;
      i++
    ) {
      pathData +=
        ` L ${points[i].x} ${points[i].y}`;
    }

    const path =
      new Path(
        pathData,
        {
          fill: "transparent",
          stroke: "#111111",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          excludeFromExport: true,
          idCardVectorPreview: true,
        }
      );

    canvas.add(path);

    vectorPathRef.current =
      path;

    canvas.requestRenderAll();
  };

  // ============================================================
  // REMOVE VECTOR EDITING DOTS
  // ============================================================

  const removeVectorControls = () => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    vectorControlsRef.current.forEach(
      (point) => {
        canvas.remove(point);
      }
    );

    vectorControlsRef.current =
      [];
  };

  // ============================================================
  // CLEAR VECTOR EDITING STATE
  // ============================================================

  const clearVectorPoints = () => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    removeVectorControls();

    vectorPointsRef.current =
      [];

    if (vectorPathRef.current) {
      canvas.remove(
        vectorPathRef.current
      );

      vectorPathRef.current =
        null;
    }

    canvas.requestRenderAll();
  };

  // ============================================================
  // ADD VECTOR ANCHOR POINT
  // ============================================================

  const addVectorPoint = (
    point
  ) => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    vectorPointsRef.current.push({
      x: point.x,
      y: point.y,
    });

    const handle =
      new Circle({
        left: point.x,
        top: point.y,
        radius: 6,
        originX: "center",
        originY: "center",
        fill: "#ffffff",
        stroke: "#111111",
        strokeWidth: 2,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        idCardVectorPoint: true,
      });

    canvas.add(handle);

    vectorControlsRef.current.push(
      handle
    );

    redrawVectorPath();

    canvas.requestRenderAll();
  };

  // ============================================================
  // CREATE FINAL VECTOR
  //
  // closePath = true
  //     Right-click → closed vector
  //
  // closePath = false
  //     Exit Vector → preserve current open path
  // ============================================================

  const finishVector = (
    closePath = false
  ) => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const points =
      vectorPointsRef.current;

    const previewPath =
      vectorPathRef.current;

    if (
      points.length < 2 ||
      !previewPath
    ) {
      return null;
    }

    canvas.remove(
      previewPath
    );

    vectorPathRef.current =
      null;

    let pathData =
      `M ${points[0].x} ${points[0].y}`;

    for (
      let i = 1;
      i < points.length;
      i++
    ) {
      pathData +=
        ` L ${points[i].x} ${points[i].y}`;
    }

    if (
      closePath &&
      points.length >= 3
    ) {
      pathData += " Z";
    }

    const finalPath =
      new Path(
        pathData,
        {
          fill:
            closePath &&
            points.length >= 3
              ? "#e5e7eb"
              : "transparent",

          stroke: "#111111",
          strokeWidth: 2,
          selectable: true,
          evented: true,

          idCardVector: true,

          idCardVectorClosed:
            closePath &&
            points.length >= 3,

          idCardCornerRadius: 0,
          excludeFromExport: false,
        }
      );

    finalPath.idCardOriginalVectorPath =
      finalPath.path.map(
        (command) => [
          ...command,
        ]
      );

    canvas.add(
      finalPath
    );

    canvas.setActiveObject(
      finalPath
    );

    removeVectorControls();

    vectorPointsRef.current =
      [];

    canvas.requestRenderAll();

    onObjectSelected?.({
      object: finalPath,

      left:
        finalPath.left || 0,

      top:
        finalPath.top || 0,

      width:
        finalPath.getScaledWidth(),

      height:
        finalPath.getScaledHeight(),

      angle:
        finalPath.angle || 0,
    });

    return finalPath;
  };

  // ============================================================
  // CANVAS INITIALIZATION
  // ============================================================

  useEffect(() => {
    if (
      !canvasElementRef.current
    ) {
      return;
    }

    const canvas =
      new Canvas(
        canvasElementRef.current,
        {
          width:
            ID_CARD_WIDTH,

          height:
            ID_CARD_HEIGHT,

          backgroundColor:
            "#ffffff",

          preserveObjectStacking:
            true,
        }
      );

    // ==========================================================
    // PEN BRUSH
    // ==========================================================

    canvas.freeDrawingBrush =
      new PencilBrush(
        canvas
      );

    canvas.freeDrawingBrush.color =
      "#111111";

    canvas.freeDrawingBrush.width =
      4;

    fabricCanvasRef.current =
      canvas;

    onCanvasReady?.(
      canvas
    );

    // ==========================================================
    // SEND SELECTION
    // ==========================================================

    const sendSelection =
      (object) => {
        if (!object) {
          onObjectSelected?.(
            null
          );

          return;
        }

        onObjectSelected?.({
          object,

          left:
            object.left || 0,

          top:
            object.top || 0,

          width:
            object.getScaledWidth(),

          height:
            object.getScaledHeight(),

          angle:
            object.angle || 0,
        });
      };

    // ==========================================================
    // OBJECT SELECTION
    // ==========================================================

    const handleSelectionCreated =
      (event) => {
        sendSelection(
          event.selected?.[0]
        );
      };

    const handleSelectionUpdated =
      (event) => {
        sendSelection(
          event.selected?.[0]
        );
      };

    const handleSelectionCleared =
      () => {
        onObjectSelected?.(
          null
        );
      };

    const handleObjectModified =
      (event) => {
        sendSelection(
          event.target
        );
      };

    canvas.on(
      "selection:created",
      handleSelectionCreated
    );

    canvas.on(
      "selection:updated",
      handleSelectionUpdated
    );

    canvas.on(
      "selection:cleared",
      handleSelectionCleared
    );

    canvas.on(
      "object:modified",
      handleObjectModified
    );

canvas.on(
  "object:moving",
  handleFrameMoving
);

canvas.on(
  "object:rotating",
  handleFrameRotating
);

canvas.on(
  "object:scaling",
  handleFrameScaling
);

canvas.on(
  "mouse:up",
  () => {
    removeSmartGuides();
    canvas.requestRenderAll();
  }
);

    // ==========================================================
    // DIRECT OBJECT CLICK
    //
    // Vector and Pen modes have their own mouse handlers.
    // ==========================================================

    // const handleObjectMouseDown =
    //   (event) => {
    //     if (
    //       event.target &&
    //       !isDrawingMode &&
    //       !isVectorMode
    //     ) {
    //       sendSelection(
    //         event.target
    //       );
    //     }
    //   };
















     // ==========================================================
    // DIRECT OBJECT CLICK
    //
    // Vector and Pen modes have their own mouse handlers.
    // ==========================================================

const handleObjectMouseDown =
  (event) => {
    if (
      isDrawingMode ||
      isVectorMode
    ) {
      return;
    }

    const target =
      event.target;

      if (
  target?.idCardFrame
) {

  target.idCardPreviousAngle =
    target.angle || 0;

}

    const editState =
      frameImageEditRef.current;

    // ========================================================
    // IMAGE EDIT MODE
    // ========================================================

    if (editState?.image) {
      const editingImage =
        editState.image;

      const editingFrame =
        editState.frame;

      // ------------------------------------------------------
      // IMAGE CLICK
      //
      // Stay in edit mode.
      // ------------------------------------------------------

      if (
        target ===
        editingImage
      ) {
        canvas.setActiveObject(
          editingImage
        );

        return;
      }

      // ------------------------------------------------------
      // FRAME CLICK
      //
      // DO NOT EXIT HERE.
      //
      // The Frame must remain locked while editing.
      // ------------------------------------------------------

      if (
        target ===
        editingFrame
      ) {
        canvas.setActiveObject(
          editingImage
        );

        return;
      }

      // ------------------------------------------------------
      // CLICK OUTSIDE THE EDITING FRAME
      //
      // This is the actual exit.
      // ------------------------------------------------------

      if (
        !target
      ) {
        editingFrame.selectable =
          true;

        editingFrame.evented =
          true;

        editingImage.selectable =
          false;

        editingImage.evented =
          false;

        frameImageEditRef.current = {
          image: null,
          frame: null,
        };

        canvas.discardActiveObject();

        canvas.setActiveObject(
          editingFrame
        );

        canvas.requestRenderAll();

        sendSelection(
          editingFrame
        );

        console.log(
          "FRAME IMAGE EDIT MODE: OFF"
        );

        return;
      }

      // ------------------------------------------------------
      // CLICK ANOTHER OBJECT
      //
      // Exit edit mode, then allow normal selection.
      // ------------------------------------------------------

      editingFrame.selectable =
        true;

      editingFrame.evented =
        true;

      editingImage.selectable =
        false;

      editingImage.evented =
        false;

      frameImageEditRef.current = {
        image: null,
        frame: null,
      };
    }

    // ========================================================
    // NORMAL MODE
    // ========================================================

    if (!target) {
      return;
    }

    sendSelection(
      target
    );
  };
    // ============================================================
    // FRAME DOUBLE CLICK
    // ============================================================

    const handleFrameDoubleClick = (
      event
    ) => {
      const target =
        event.target;

      if (
        !target ||
        !target.idCardFrame
      ) {
        return;
      }

      const image =
        target.idCardFrameImage;

      if (!image) {
        return;
      }

      // ========================================================
      // ENTER IMAGE EDIT MODE
      // ========================================================

frameImageEditRef.current = {
  image,
  frame: target,
};

      // Frame becomes locked while
      // the image is being edited.
      target.selectable =
        false;

      target.evented =
        false;

      // Image becomes editable.
      image.selectable =
        true;

      image.evented =
        true;

      canvas.setActiveObject(
        image
      );

      canvas.requestRenderAll();

      console.log(
        "FRAME IMAGE EDIT MODE: ON"
      );
    };

    // ============================================================
    // REGISTER MOUSE EVENTS
    // ============================================================

    canvas.on(
      "mouse:down",
      handleObjectMouseDown
    );

    canvas.on(
      "mouse:dblclick",
      handleFrameDoubleClick
    );












    // ==========================================================
    // PEN PATH CREATED
    // ==========================================================

    const handlePathCreated =
      (event) => {
        if (event.path) {
          sendSelection(
            event.path
          );
        }
      };

    canvas.on(
      "path:created",
      handlePathCreated
    );

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {
      canvas.off(
        "selection:created",
        handleSelectionCreated
      );

      canvas.off(
        "selection:updated",
        handleSelectionUpdated
      );

      canvas.off(
        "selection:cleared",
        handleSelectionCleared
      );

      canvas.off(
        "object:modified",
        handleObjectModified
      );

      canvas.off(
  "object:rotating",
  handleFrameRotating
);

canvas.off(
  "object:scaling",
  handleFrameScaling
);

      canvas.off(
  "mouse:up"
);

      canvas.off(
        "mouse:down",
        handleObjectMouseDown
      );

      canvas.off(
        "mouse:dblclick",
        handleFrameDoubleClick
      );
      canvas.off(
        "path:created",
        handlePathCreated
      );

      removeSmartGuides();
      canvas.dispose();

      fabricCanvasRef.current =
        null;

      onCanvasReady?.(
        null
      );
    };
  }, [
    onObjectSelected,
    onCanvasReady,
  ]);

  // ============================================================
  // PEN + GENERAL CANVAS MODE
  // ============================================================

  useEffect(() => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.isDrawingMode =
      Boolean(
        isDrawingMode
      );

    canvas.selection =
      !isDrawingMode &&
      !isVectorMode;

    if (
      isDrawingMode ||
      isVectorMode
    ) {
      canvas.defaultCursor =
        "crosshair";
    } else {
      canvas.defaultCursor =
        "default";
    }

    if (isDrawingMode) {
      if (
        !canvas.freeDrawingBrush
      ) {
        canvas.freeDrawingBrush =
          new PencilBrush(
            canvas
          );
      }

      canvas.freeDrawingBrush.color =
        "#111111";

      canvas.freeDrawingBrush.width =
        4;
    }

    canvas.requestRenderAll();
  }, [
    isDrawingMode,
    isVectorMode,
  ]);

  // ============================================================
  // VECTOR MODE
  // ============================================================

  useEffect(() => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    // ==========================================================
    // EXIT VECTOR MODE
    // ==========================================================

    if (!isVectorMode) {
      if (
        vectorPointsRef.current.length >= 2 &&
        vectorPathRef.current
      ) {
        finishVector(false);
      }

      canvas.isDrawingMode =
        Boolean(
          isDrawingMode
        );

      canvas.selection =
        !isDrawingMode;

      canvas.defaultCursor =
        isDrawingMode
          ? "crosshair"
          : "default";

      canvas.requestRenderAll();

      return;
    }

    // ==========================================================
    // ENTER VECTOR MODE
    // ==========================================================

    canvas.isDrawingMode =
      false;

    canvas.selection =
      false;

    canvas.defaultCursor =
      "crosshair";

    // ==========================================================
    // VECTOR MOUSE DOWN
    // ==========================================================

    const handleVectorMouseDown =
      (event) => {
        if (
          event.e?.button === 3
        ) {
          event.e.preventDefault();

          if (
            vectorPointsRef.current.length >= 3
          ) {
            finishVector(true);

            onVectorModeFinished?.();
          }

          return;
        }

        if (
          event.e?.button !== 0
        ) {
          return;
        }

        const point =
          event.scenePoint ||
          event.pointer;

        if (!point) {
          return;
        }

        addVectorPoint(
          point
        );
      };

    canvas.on(
      "mouse:down",
      handleVectorMouseDown
    );

    // ==========================================================
    // DISABLE BROWSER CONTEXT MENU
    // ==========================================================

    const handleContextMenu =
      (event) => {
        event.preventDefault();
      };

    canvas.upperCanvasEl?.addEventListener(
      "contextmenu",
      handleContextMenu
    );

    // ==========================================================
    // CLEANUP VECTOR EVENTS
    // ==========================================================

    return () => {
      canvas.off(
        "mouse:down",
        handleVectorMouseDown
      );

      canvas.upperCanvasEl?.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
    };
  }, [
    isVectorMode,
    isDrawingMode,
  ]);

  // ============================================================
  // FRAME IMAGE POSITIONING
  // ============================================================
  // ============================================================
  // FRAME SYSTEM
  // ============================================================

  // ============================================================
  // CREATE UNIQUE FRAME ID
  // ============================================================

  const createFrameId = () => {
    if (
      typeof crypto !== "undefined" &&
      crypto.randomUUID
    ) {
      return `frame_${crypto.randomUUID()}`;
    }

    return `frame_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  };

  // ============================================================
  // CREATE FRAME
  // ============================================================

  const createFrame = ({
    left = 80,
    top = 100,
    width = 180,
    height = 180,
    radius = 0,
    fill = "rgba(229,231,235,0.35)",
    stroke = "#111111",
    strokeWidth = 2,
  } = {}) => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const frameId =
      createFrameId();

    const frame =
      new Rect({
        left,
        top,
        width,
        height,

        fill,

        stroke,
        strokeWidth,

        rx: radius,
        ry: radius,

        selectable: true,
        evented: true,

        idCardFrame: true,
        idCardFrameId: frameId,
        idCardFrameType:
          radius > 0
            ? "rounded"
            : "rectangle",

        idCardFrameImage: null,
        idCardFrameImageUrl: null,
        idCardFrameFit: "cover",

        idCardFrameImageOffsetX: 0,
        idCardFrameImageOffsetY: 0,
        idCardPreviousAngle: 0,
      });

    canvas.add(frame);

    canvas.setActiveObject(
      frame
    );

    canvas.requestRenderAll();

    onObjectSelected?.({
      object: frame,

      left:
        frame.left || 0,

      top:
        frame.top || 0,

      width:
        frame.getScaledWidth(),

      height:
        frame.getScaledHeight(),

      angle:
        frame.angle || 0,
    });

  

    return frame;
  };

  // ============================================================
  // GET ACTIVE FRAME
  // ============================================================

  const getActiveFrame = () => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const activeObject =
      canvas.getActiveObject();

    if (
      !activeObject?.idCardFrame
    ) {
      return null;
    }

    return activeObject;
  };

  // ============================================================
  // CHECK FRAME OBJECT
  // ============================================================

  // ============================================================
  // CHECK FRAME OBJECT
  // ============================================================

  const isFrameObject = (
    object
  ) => {
    return Boolean(
      object?.idCardFrame
    );
  };

  // ============================================================
  // ADD IMAGE TO FRAME
  // ============================================================

  // ============================================================
  // ADD IMAGE TO FRAME
  // ============================================================

const addImageToFrame = async (
  imageUrl,
  targetFrame = null
) => {
    const canvas =
      fabricCanvasRef.current;

    if (
      !canvas ||
      !imageUrl
    ) {
      return null;
    }

const frame =
  targetFrame ||
  getActiveFrame();

    if (!frame) {
      console.warn(
        "Select a frame before adding an image."
      );

      return null;
    }

    try {
      // ========================================================
      // LOAD IMAGE
      // ========================================================

// ========================================================
// LOAD IMAGE
// ========================================================

// Backend URL used for uploaded files.
// Dynamic student photos are stored as paths such as:
// /uploads/profile/filename.jpg

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

const resolvedImageUrl =
  imageUrl?.startsWith("http://") ||
  imageUrl?.startsWith("https://")
    ? imageUrl
    : `${API_BASE_URL}${imageUrl?.startsWith("/") ? "" : "/"}${imageUrl}`;

console.log(
  "FRAME IMAGE ORIGINAL URL:",
  imageUrl
);

console.log(
  "FRAME IMAGE RESOLVED URL:",
  resolvedImageUrl
);

const imageElement =
  new Image();

imageElement.crossOrigin =
  "anonymous";

await new Promise(
  (
    resolve,
    reject
  ) => {

    imageElement.onload =
      () => {

        console.log(
          "FRAME IMAGE LOADED:",
          resolvedImageUrl
        );

        resolve();
      };

    imageElement.onerror =
      (error) => {

        console.error(
          "FRAME IMAGE LOAD FAILED:",
          {
            originalUrl:
              imageUrl,

            resolvedUrl:
              resolvedImageUrl,

            error,
          }
        );

        reject(error);
      };

    imageElement.src =
      resolvedImageUrl;

  }
);

      const image =
        new FabricImage(
          imageElement
        );

      // ========================================================
      // FRAME SIZE
      // ========================================================

      const frameWidth =
        frame.getScaledWidth();

      const frameHeight =
        frame.getScaledHeight();

      // ========================================================
      // COVER SCALE
      // ========================================================

      const scale =
        Math.max(
          frameWidth /
            image.width,

          frameHeight /
            image.height
        );

      // ========================================================
      // FRAME CENTER
      // ========================================================

      const frameCenter =
        frame.getCenterPoint();

      // ========================================================
      // IMAGE POSITION + SCALE
      // ========================================================

      image.set({
        originX:
          "center",

        originY:
          "center",

        left:
          frameCenter.x,

        top:
          frameCenter.y,

        scaleX:
          scale,

        scaleY:
          scale,

        angle:
          frame.angle || 0,

        selectable:
          false,

        evented:
          false,

idCardFrameImageMarker:
  true,

idCardFrameId:
  frame.idCardFrameId,



        idCardFrameFit:
          "cover",

  idCardFrameImageUrl:
  resolvedImageUrl,
      });

      // ========================================================
      // CREATE FRAME CLIP
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
      // REMOVE EXISTING FRAME IMAGE
      // ========================================================

      if (
        frame.idCardFrameImage &&
        canvas.contains(
          frame.idCardFrameImage
        )
      ) {
        canvas.remove(
          frame.idCardFrameImage
        );
      }

      // ========================================================
      // STORE IMAGE ON FRAME
      // ========================================================

      frame.idCardFrameImage =
        image;

      frame.idCardFrameImageUrl =
        imageUrl;

      frame.idCardFrameFit =
        "cover";

      // ========================================================
      // STORE FRAME POSITION
      // ========================================================

      frame.idCardPreviousLeft =
        frame.left;

      frame.idCardPreviousTop =
        frame.top;

      // ========================================================
      // ADD IMAGE
      // ========================================================

      canvas.add(
        image
      );

      // ========================================================
      // KEEP FRAME ABOVE IMAGE
      // ========================================================

      canvas.bringObjectToFront(
        frame
      );

      canvas.setActiveObject(
        frame
      );

      // ========================================================
      // UPDATE COORDINATES
      // ========================================================

      clipPath.setCoords();

      image.setCoords();

      frame.setCoords();

      canvas.requestRenderAll();

      // ========================================================
      // UPDATE SELECTION
      // ========================================================

      onObjectSelected?.({
        object:
          frame,

        left:
          frame.left || 0,

        top:
          frame.top || 0,

        width:
          frame.getScaledWidth(),

        height:
          frame.getScaledHeight(),

        angle:
          frame.angle || 0,
      });

      return image;
    } catch (error) {
      console.error(
        "FAILED TO ADD IMAGE TO FRAME",
        error
      );

      return null;
    }
  };


  // ============================================================
// RENDER STUDENT DYNAMIC FIELDS
// ============================================================

const renderStudentDynamicFields = async (
  studentData = null
) => {

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    console.warn(
      "STUDENT RENDER: Canvas not available."
    );

    return false;
  }

  if (!studentData) {
    console.warn(
      "STUDENT RENDER: Student data missing."
    );

    return false;
  }

  try {

    // ========================================================
    // NORMALIZE STUDENT REFERENCES
    // Supports both Designer and Preview API structures
    // ========================================================

    const institution =
      studentData?.institutionId ||
      studentData?.institution ||
      null;

    const department =
      studentData?.departmentId ||
      studentData?.department ||
      null;

    const programme =
      studentData?.programmeId ||
      studentData?.programme ||
      null;

    const classData =
      studentData?.classId ||
      studentData?.class ||
      null;


    const renderContext = {
      student: studentData,

      institution,

      department,

      programme,

      classData,
    };


    console.log(
      "STUDENT RENDER CONTEXT:",
      renderContext
    );

    console.log(
  "ID CARD STUDENT RAW DATA:",
  studentData
);

console.log(
  "ID CARD STUDENT AVAILABLE KEYS:",
  Object.keys(
    studentData || {}
  )
);

console.log(
  "ID CARD ADDRESS CANDIDATES:",
  {
    address:
      studentData?.address,

    communicationAddress:
      studentData?.communicationAddress,

    permanentAddress:
      studentData?.permanentAddress,
  }
);

console.log(
  "ID CARD PHONE CANDIDATES:",
  {
    phoneNumber:
      studentData?.phoneNumber,

    studentMobile:
      studentData?.studentMobile,

    mobileNumber:
      studentData?.mobileNumber,

    mobile:
      studentData?.mobile,

    parentMobile:
      studentData?.parentMobile,
  }
);


    // ========================================================
    // FIND DYNAMIC OBJECTS
    // ========================================================

    const dynamicObjects =
      canvas
        .getObjects()
        .filter(
          (object) =>
            object?.idCardDynamicField === true
        );


    console.log(
      "DYNAMIC OBJECTS FOUND:",
      dynamicObjects.length
    );


    // ========================================================
    // PROCESS EACH DYNAMIC OBJECT
    // ========================================================

    for (
      const object
      of dynamicObjects
    ) {

      const key =
        object?.idCardDynamicKey;

      if (!key) {
        continue;
      }


      // ======================================================
      // RESOLVE VALUE
      // ======================================================

  const value =
  resolveDynamicField(
    key,
    studentData
  );


      console.log(
        "DYNAMIC FIELD RENDER:",
        {
          key,
          value,
        }
      );


      // ======================================================
      // QR CODE
      // ======================================================

      if (
        key === "qrCode"
      ) {

        const qrResult =
          await createDynamicQRCode(
            studentData
          );

        console.log(
          "STUDENT QR RENDER RESULT:",
          qrResult
        );

        continue;
      }


      // ======================================================
      // STUDENT PHOTO
      // ======================================================

      if (
        key === "studentPhoto" ||
        key === "profilePhoto"
      ) {

        if (!value) {

          console.warn(
            "STUDENT PHOTO MISSING."
          );

          continue;
        }


        console.log(
          "POPULATING STUDENT PHOTO:",
          value
        );


        const photoObject =
          canvas
            .getObjects()
            .find(
              (candidate) =>
                candidate?.idCardDynamicField === true &&
                (
                  candidate?.idCardDynamicKey ===
                    "studentPhoto" ||
                  candidate?.idCardDynamicKey ===
                    "profilePhoto"
                ) &&
                candidate?.idCardFrame === true
            );


        if (photoObject) {

          const photoResult =
            await addImageToFrame(
              value,
              photoObject
            );

          console.log(
            "STUDENT PHOTO RENDER RESULT:",
            photoResult
          );

        } else {

          console.warn(
            "STUDENT PHOTO FRAME NOT FOUND."
          );

        }

        continue;
      }


      // ======================================================
      // TEXT
      // ======================================================

      if (
        object?.type === "textbox" ||
        object?.type === "i-text" ||
        object?.type === "text"
      ) {

        object.set({
          text:
            value != null
              ? String(value)
              : "",
        });

        object.setCoords();

      }

    }


    // ========================================================
    // FINAL RENDER
    // ========================================================

    canvas.requestRenderAll();


    console.log(
      "SINGLE STUDENT DYNAMIC RENDER COMPLETE."
    );


    return true;

  } catch (error) {

    console.error(
      "FAILED TO RENDER STUDENT DYNAMIC FIELDS:",
      error
    );

    return false;
  }
};
// ============================================================
// REPLACE IMAGE INSIDE EXISTING FRAME
// ============================================================

const replaceFrameImage = async (
  imageUrl,
  frame
) => {
  if (
    !imageUrl ||
    !frame
  ) {
    return null;
  }

  try {
    const image =
      await addImageToFrame(
        imageUrl,
        frame
      );

    if (!image) {
      console.error(
        "FRAME IMAGE REPLACEMENT FAILED"
      );

      return null;
    }

    console.log(
      "FRAME IMAGE REPLACEMENT SUCCESS"
    );

    return image;
  } catch (error) {
    console.error(
      "FAILED TO REPLACE FRAME IMAGE",
      error
    );

    return null;
  }
};

// ============================================================
// POPULATE DYNAMIC PHOTO
// ============================================================

const populateDynamicPhoto = async (
  imageUrl
) => {
  const canvas =
    fabricCanvasRef.current;

  if (
    !canvas ||
    !imageUrl
  ) {
    return false;
  }

  // ==========================================================
  // FIND THE DYNAMIC STUDENT PHOTO FRAME
  // ==========================================================

  const dynamicPhotoFrame =
    canvas.getObjects().find(
      (object) =>
        object?.idCardFrame === true &&
        object?.idCardDynamicField === true &&
        object?.idCardDynamicKey ===
          "studentPhoto"
    );

  if (!dynamicPhotoFrame) {
    console.warn(
      "DYNAMIC STUDENT PHOTO FRAME NOT FOUND"
    );

    return false;
  }

  // ==========================================================
  // ADD / REPLACE IMAGE USING EXISTING FRAME SYSTEM
  // ==========================================================

  const image =
    await addImageToFrame(
      imageUrl,
      dynamicPhotoFrame
    );

  if (!image) {
    console.error(
      "FAILED TO POPULATE DYNAMIC STUDENT PHOTO"
    );

    return false;
  }

  // ==========================================================
  // KEEP THE FRAME MARKED AS DYNAMIC
  // ==========================================================

  dynamicPhotoFrame.set({
    idCardDynamicField:
      true,

    idCardDynamicKey:
      "studentPhoto",

    idCardDynamicLabel:
      "Student Photo",
  });

  dynamicPhotoFrame.setCoords();

  canvas.bringObjectToFront(
    dynamicPhotoFrame
  );

  canvas.requestRenderAll();

  console.log(
    "DYNAMIC STUDENT PHOTO POPULATED"
  );

  return true;
};


// ============================================================
// CREATE DYNAMIC QR CODE
// ============================================================

// ============================================================
// CREATE / POPULATE DYNAMIC QR CODE
// ============================================================

const createDynamicQRCode = async (
  studentData = null
) => {

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    return null;
  }

  if (!studentData) {
    console.warn(
      "QR GENERATION: Student data missing."
    );

    return null;
  }

  try {

    // ========================================================
    // FIND QR FRAME
    // ========================================================

    const qrFrame =
      canvas.getObjects().find(
        (object) =>
          object?.idCardFrame === true &&
          object?.idCardDynamicField === true &&
          object?.idCardDynamicKey === "qrCode"
      );

    if (!qrFrame) {

      console.warn(
        "QR FRAME NOT FOUND. Select a frame and assign QR Code first."
      );

      return null;
    }

    console.log(
      "QR FRAME FOUND:",
      qrFrame.idCardFrameId
    );

    // ========================================================
    // BUILD QR VERIFICATION DATA
    // ========================================================

    const qrData =
      JSON.stringify({
        type: "student-id",

        studentId:
          studentData?._id || "",

        registerNumber:
          studentData?.registerNumber || "",
      });

    console.log(
      "QR DATA:",
      qrData
    );

    // ========================================================
    // GENERATE QR DATA URL
    // ========================================================

    const qrDataUrl =
      await QRCode.toDataURL(
        qrData,
        {
          width: 600,
          margin: 1,
          errorCorrectionLevel:
            "M",
        }
      );

    // ========================================================
    // LOAD QR IMAGE
    // ========================================================

    const imageElement =
      new Image();

    await new Promise(
      (
        resolve,
        reject
      ) => {

        imageElement.onload =
          resolve;

        imageElement.onerror =
          reject;

        imageElement.src =
          qrDataUrl;

      }
    );

    const qrImage =
      new FabricImage(
        imageElement
      );

    // ========================================================
    // REMOVE EXISTING QR IMAGE
    //
    // Prevent duplicate QR codes when Test Student Render
    // is clicked multiple times.
    // ========================================================

    if (
      qrFrame.idCardQRImage &&
      canvas.contains(
        qrFrame.idCardQRImage
      )
    ) {

      canvas.remove(
        qrFrame.idCardQRImage
      );

    }

    // ========================================================
    // FRAME SIZE
    // ========================================================

    const frameWidth =
      qrFrame.getScaledWidth();

    const frameHeight =
      qrFrame.getScaledHeight();










   // ========================================================
// QR SIZE
// ========================================================

const qrSize =
  Math.min(
    frameWidth,
    frameHeight
  );

// ========================================================
// QR SCALE
// ========================================================

const scale =
  qrSize /
  qrImage.width;

// ========================================================
// FRAME CENTER
// ========================================================

const frameCenter =
  qrFrame.getCenterPoint();











// ========================================================
// CREATE QR IMAGE
// ========================================================

qrImage.set({

  originX:
    "center",

  originY:
    "center",

  left:
    frameCenter.x,

  top:
    frameCenter.y,

  scaleX:
    scale,

  scaleY:
    scale,

  angle:
    qrFrame.angle || 0,

  selectable:
    false,

  evented:
    false,

  idCardQRImageMarker:
    true,

  idCardQRFrameId:
    qrFrame.idCardFrameId,

  idCardDynamicField:
    true,

  idCardDynamicKey:
    "qrCode",

  idCardDynamicLabel:
    "QR Code",

  idCardQRPlaceholder:
    false,

  idCardQRData:
    qrData,

});

    // ========================================================
    // CLIP QR TO FRAME
    // ========================================================

    const clipPath =
      new Rect({

        width:
          frameWidth,

        height:
          frameHeight,

        originX:
          "center",

        originY:
          "center",

        left:
          frameCenter.x,

        top:
          frameCenter.y,

        rx:
          qrFrame.rx || 0,

        ry:
          qrFrame.ry || 0,

        angle:
          qrFrame.angle || 0,

        absolutePositioned:
          true,

      });

    qrImage.clipPath =
      clipPath;

    // ========================================================
    // STORE QR IMAGE ON FRAME
    // ========================================================

    qrFrame.idCardQRImage =
      qrImage;

    qrFrame.idCardQRData =
      qrData;

    // ========================================================
    // ADD QR TO CANVAS
    // ========================================================

    canvas.add(
      qrImage
    );

    // ========================================================
    // KEEP FRAME ABOVE QR
    // ========================================================

    canvas.bringObjectToFront(
      qrFrame
    );

    // ========================================================
    // UPDATE COORDINATES
    // ========================================================

    clipPath.setCoords();

    qrImage.setCoords();

    qrFrame.setCoords();

    canvas.requestRenderAll();

    // ========================================================
    // KEEP FRAME SELECTED
    // ========================================================

    canvas.setActiveObject(
      qrFrame
    );

    // ========================================================
    // UPDATE PROPERTIES PANEL
    // ========================================================

    onObjectSelected?.({

      object:
        qrFrame,

      left:
        qrFrame.left || 0,

      top:
        qrFrame.top || 0,

      width:
        qrFrame.getScaledWidth(),

      height:
        qrFrame.getScaledHeight(),

      angle:
        qrFrame.angle || 0,

    });

    console.log(
      "DYNAMIC STUDENT QR CODE POPULATED IN FRAME:",
      qrFrame.idCardFrameId
    );

    return qrImage;

  } catch (error) {

    console.error(
      "FAILED TO CREATE DYNAMIC STUDENT QR CODE",
      error
    );

    return null;
  }
};


// ============================================================
// APPLY FRAME IMAGE FIT
// ============================================================

const applyFrameImageFit = (
  frame,
  fitMode = "cover"
) => {
  const canvas =
    fabricCanvasRef.current;

  if (
    !canvas ||
    !frame ||
    !frame.idCardFrame
  ) {
    return false;
  }

  const image =
    frame.idCardFrameImage;

  if (!image) {
    return false;
  }

  // ==========================================================
  // NORMALIZE FIT MODE
  // ==========================================================

  const fit =
    fitMode === "contain"
      ? "contain"
      : "cover";

  // ==========================================================
  // FRAME SIZE
  // ==========================================================

  const frameWidth =
    frame.getScaledWidth();

  const frameHeight =
    frame.getScaledHeight();

  // ==========================================================
  // IMAGE SIZE
  // ==========================================================

  if (
    !image.width ||
    !image.height
  ) {
    return false;
  }

  // ==========================================================
  // CALCULATE SCALE
  //
  // COVER:
  // image completely fills frame
  //
  // CONTAIN:
  // entire image fits inside frame
  // ==========================================================

  const scale =
    fit === "cover"
      ? Math.max(
          frameWidth /
            image.width,

          frameHeight /
            image.height
        )
      : Math.min(
          frameWidth /
            image.width,

          frameHeight /
            image.height
        );

  // ==========================================================
  // FRAME CENTER
  // ==========================================================

  const frameCenter =
    frame.getCenterPoint();

  // ==========================================================
  // APPLY IMAGE FIT
  // ==========================================================

  image.set({
    originX:
      "center",

    originY:
      "center",

    left:
      frameCenter.x,

    top:
      frameCenter.y,

    scaleX:
      scale,

    scaleY:
      scale,

    angle:
      frame.angle || 0,

    idCardFrameFit:
      fit,

    idCardFrameImageOffsetX:
      0,

    idCardFrameImageOffsetY:
      0,
  });

  // ==========================================================
  // UPDATE FRAME STATE
  // ==========================================================

  frame.idCardFrameFit =
    fit;

  frame.idCardFrameImageOffsetX =
    0;

  frame.idCardFrameImageOffsetY =
    0;

  // ==========================================================
  // KEEP EXISTING CLIP PATH
  // ==========================================================

  if (
    image.clipPath
  ) {
    image.clipPath.set({
      width:
        frameWidth,

      height:
        frameHeight,

      left:
        frameCenter.x,

      top:
        frameCenter.y,

      angle:
        frame.angle || 0,
    });

    image.clipPath.setCoords();
  }

  image.setCoords();
  frame.setCoords();

  canvas.bringObjectToFront(
    frame
  );

  canvas.requestRenderAll();

  onObjectSelected?.({
    object:
      frame,

    left:
      frame.left || 0,

    top:
      frame.top || 0,

    width:
      frame.getScaledWidth(),

    height:
      frame.getScaledHeight(),

    angle:
      frame.angle || 0,
  });

  return true;
};



  // ============================================================
  // MOVE FRAME IMAGE WITH FRAME
  // ============================================================

  // ============================================================
  // MOVE FRAME + IMAGE + CLIP TOGETHER
  // ============================================================

  // ============================================================
  // FRAME + FRAME IMAGE MOVEMENT
  // ============================================================

// ============================================================
// FRAME + IMAGE + SMART GUIDE MOVEMENT
// ============================================================

// ============================================================
// OBJECT MOVEMENT
// FRAME + IMAGE + SMART GUIDES
// ============================================================

// ============================================================
// OBJECT MOVEMENT
// FRAME + IMAGE + QR + SMART GUIDES
// ============================================================

const handleFrameMoving = (event) => {

  const target = event.target;

  if (!target) {
    return;
  }

  const canvas = fabricCanvasRef.current;

  if (!canvas) {
    return;
  }

  // ==========================================================
  // IMAGE EDIT MODE
  // ==========================================================

  if (
    frameImageEditRef.current?.image &&
    target === frameImageEditRef.current.image
  ) {

    const image = target;
    const frame =
      frameImageEditRef.current.frame;

    if (!frame) {
      return;
    }

    const frameCenter =
      frame.getCenterPoint();

    const frameWidth =
      frame.getScaledWidth();

    const frameHeight =
      frame.getScaledHeight();

    const imageWidth =
      image.getScaledWidth();

    const imageHeight =
      image.getScaledHeight();

    const maxOffsetX =
      Math.max(
        0,
        (imageWidth - frameWidth) / 2
      );

    const maxOffsetY =
      Math.max(
        0,
        (imageHeight - frameHeight) / 2
      );

    let offsetX =
      (image.left || 0) -
      frameCenter.x;

    let offsetY =
      (image.top || 0) -
      frameCenter.y;

    offsetX = Math.max(
      -maxOffsetX,
      Math.min(maxOffsetX, offsetX)
    );

    offsetY = Math.max(
      -maxOffsetY,
      Math.min(maxOffsetY, offsetY)
    );

    image.set({
      left:
        frameCenter.x + offsetX,

      top:
        frameCenter.y + offsetY,
    });

    image.setCoords();

    canvas.requestRenderAll();

    return;
  }


  // ==========================================================
  // ONLY FRAME MOVEMENT
  // ==========================================================

  if (!target.idCardFrame) {
    return;
  }

  const frame = target;

  if (
    frameImageEditRef.current?.frame === frame
  ) {
    return;
  }


  // ==========================================================
  // PREVIOUS POSITION
  // ==========================================================

  const previousLeft =
    frame.idCardPreviousLeft ??
    frame.left ??
    0;

  const previousTop =
    frame.idCardPreviousTop ??
    frame.top ??
    0;


  // ==========================================================
  // RAW MOUSE DELTA
  // ==========================================================

  const deltaX =
    (frame.left || 0) -
    previousLeft;

  const deltaY =
    (frame.top || 0) -
    previousTop;


  // ==========================================================
  // UPDATE PREVIOUS POSITION IMMEDIATELY
  // ==========================================================

  frame.idCardPreviousLeft =
    frame.left;

  frame.idCardPreviousTop =
    frame.top;


  // ==========================================================
  // MOVE CONTENTS ONCE
  // ==========================================================

  moveFrameContents(
    frame,
    deltaX,
    deltaY
  );


  // ==========================================================
  // SMART GUIDES
  // ==========================================================

  const SNAP_DISTANCE = 6;

  const objectCenter =
    frame.getCenterPoint();

  const canvasCenterX =
    canvas.getWidth() / 2;

  const canvasCenterY =
    canvas.getHeight() / 2;


  // ==========================================================
  // IGNORE FRAME CONTENTS
  // ==========================================================

  const alignmentTargets =
    canvas.getObjects().filter(
      (object) => {

        if (object === frame) {
          return false;
        }

        if (
          object.idCardSmartGuide
        ) {
          return false;
        }

        if (
          object.idCardFrameImageMarker ||
          object.idCardQRImageMarker
        ) {
          return false;
        }

        if (
          object.idCardVectorPoint ||
          object.idCardVectorPreview
        ) {
          return false;
        }

        if (
          object.visible === false
        ) {
          return false;
        }

        return true;
      }
    );


  // ==========================================================
  // FIND BEST SNAP
  // ==========================================================

  let snapX = null;
  let snapY = null;


  alignmentTargets.forEach(
    (object) => {

      const width =
        object.getScaledWidth();

      const height =
        object.getScaledHeight();

      const center =
        object.getCenterPoint();

      const left =
        center.x - width / 2;

      const right =
        center.x + width / 2;

      const top =
        center.y - height / 2;

      const bottom =
        center.y + height / 2;


      // ------------------------------------------------------
      // X ALIGNMENT
      // ------------------------------------------------------

      const xCandidates = [

        {
          distance:
            Math.abs(
              objectCenter.x -
              center.x
            ),

          correction:
            center.x -
            objectCenter.x,

          guide:
            center.x,
        },

        {
          distance:
            Math.abs(
              frame.left -
              left
            ),

          correction:
            left -
            frame.left,

          guide:
            left,
        },

        {
          distance:
            Math.abs(
              frame.left -
              right
            ),

          correction:
            right -
            frame.left,

          guide:
            right,
        },

      ];


      xCandidates.forEach(
        (candidate) => {

          if (
            candidate.distance <=
            SNAP_DISTANCE
          ) {

            if (
              !snapX ||
              candidate.distance <
                snapX.distance
            ) {

              snapX =
                candidate;

            }

          }

        }
      );


      // ------------------------------------------------------
      // Y ALIGNMENT
      // ------------------------------------------------------

      const yCandidates = [

        {
          distance:
            Math.abs(
              objectCenter.y -
              center.y
            ),

          correction:
            center.y -
            objectCenter.y,

          guide:
            center.y,
        },

        {
          distance:
            Math.abs(
              frame.top -
              top
            ),

          correction:
            top -
            frame.top,

          guide:
            top,
        },

        {
          distance:
            Math.abs(
              frame.top -
              bottom
            ),

          correction:
            bottom -
            frame.top,

          guide:
            bottom,
        },

      ];


      yCandidates.forEach(
        (candidate) => {

          if (
            candidate.distance <=
            SNAP_DISTANCE
          ) {

            if (
              !snapY ||
              candidate.distance <
                snapY.distance
            ) {

              snapY =
                candidate;

            }

          }

        }
      );

    }
  );


  // ==========================================================
  // CANVAS CENTER SNAP
  // ==========================================================

  const centerDistanceX =
    Math.abs(
      objectCenter.x -
      canvasCenterX
    );

  if (
    centerDistanceX <=
    SNAP_DISTANCE
  ) {

    if (
      !snapX ||
      centerDistanceX <
        snapX.distance
    ) {

      snapX = {

        distance:
          centerDistanceX,

        correction:
          canvasCenterX -
          objectCenter.x,

        guide:
          canvasCenterX,

        canvasCenter:
          true,

      };

    }

  }


  const centerDistanceY =
    Math.abs(
      objectCenter.y -
      canvasCenterY
    );

  if (
    centerDistanceY <=
    SNAP_DISTANCE
  ) {

    if (
      !snapY ||
      centerDistanceY <
        snapY.distance
    ) {

      snapY = {

        distance:
          centerDistanceY,

        correction:
          canvasCenterY -
          objectCenter.y,

        guide:
          canvasCenterY,

        canvasCenter:
          true,

      };

    }

  }


  // ==========================================================
  // APPLY X SNAP
  // ==========================================================

  if (snapX) {

    const correction =
      snapX.correction;

    frame.set({
      left:
        (frame.left || 0) +
        correction,
    });

    // Move children ONLY by the additional snap amount.
    moveFrameContents(
      frame,
      correction,
      0
    );

    frame.idCardPreviousLeft =
      frame.left;

    if (
      snapX.canvasCenter
    ) {

      showVerticalCenterGuide();

    }

  }


  // ==========================================================
  // APPLY Y SNAP
  // ==========================================================

  if (snapY) {

    const correction =
      snapY.correction;

    frame.set({
      top:
        (frame.top || 0) +
        correction,
    });

    // Move children ONLY by the additional snap amount.
    moveFrameContents(
      frame,
      0,
      correction
    );

    frame.idCardPreviousTop =
      frame.top;

    if (
      snapY.canvasCenter
    ) {

      showHorizontalCenterGuide();

    }

  }


  // ==========================================================
  // FINAL
  // ==========================================================

  frame.setCoords();

  canvas.requestRenderAll();

};

// ============================================================
// ROTATE FRAME + IMAGE + QR + CLIP PATH TOGETHER
// ============================================================

const handleFrameRotating = (event) => {

  const frame =
    event.target;

  if (
    !frame ||
    !frame.idCardFrame
  ) {
    return;
  }

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    return;
  }

  // ==========================================================
  // FRAME CENTER
  // ==========================================================

  const frameCenter =
    frame.getCenterPoint();

  // ==========================================================
  // PREVIOUS ANGLE
  // ==========================================================

  const previousAngle =
    frame.idCardPreviousAngle ??
    frame.angle ??
    0;

  const currentAngle =
    frame.angle || 0;

  const deltaAngle =
    currentAngle -
    previousAngle;

  // Nothing changed
  if (deltaAngle === 0) {
    return;
  }

  // ==========================================================
  // ROTATE POINT AROUND FRAME CENTER
  // ==========================================================

  const rotatePoint =
    (x, y, centerX, centerY, angle) => {

      const radians =
        angle *
        Math.PI /
        180;

      const dx =
        x - centerX;

      const dy =
        y - centerY;

      return {
        x:
          centerX +
          (
            dx *
              Math.cos(radians)
            -
            dy *
              Math.sin(radians)
          ),

        y:
          centerY +
          (
            dx *
              Math.sin(radians)
            +
            dy *
              Math.cos(radians)
          ),
      };
    };

  // ==========================================================
  // FIND FRAME CONTENTS
  // ==========================================================

  const contents =
    canvas.getObjects().filter(
      (object) => {

        if (
          object === frame
        ) {
          return false;
        }

        // Normal / persisted frame image
        if (
          object ===
          frame.idCardFrameImage
        ) {
          return true;
        }

        // Any object belonging to this frame
        if (
          object.idCardFrameId ===
          frame.idCardFrameId
        ) {
          return true;
        }

        // Dynamic QR
        if (
          object.idCardQRFrameId ===
          frame.idCardFrameId
        ) {
          return true;
        }

        return false;
      }
    );

  // ==========================================================
  // ROTATE FRAME CONTENTS
  // ==========================================================

  contents.forEach(
    (content) => {

      // --------------------------------------------------------
      // CURRENT CONTENT POSITION
      // --------------------------------------------------------

      const currentLeft =
        content.left ??
        frameCenter.x;

      const currentTop =
        content.top ??
        frameCenter.y;

      // --------------------------------------------------------
      // ROTATE CONTENT POSITION
      // --------------------------------------------------------

      const rotated =
        rotatePoint(
          currentLeft,
          currentTop,
          frameCenter.x,
          frameCenter.y,
          deltaAngle
        );

      // --------------------------------------------------------
      // APPLY POSITION + ROTATION
      // --------------------------------------------------------

      content.set({

        left:
          rotated.x,

        top:
          rotated.y,

        angle:
          currentAngle,

      });

      // --------------------------------------------------------
      // ROTATE CLIP PATH
      // --------------------------------------------------------

      if (
        content.clipPath
      ) {

        content.clipPath.set({

          left:
            frameCenter.x,

          top:
            frameCenter.y,

          angle:
            currentAngle,

        });

        content.clipPath.setCoords();
      }

      content.setCoords();

    }
  );

  // ==========================================================
  // STORE CURRENT ANGLE
  // ==========================================================

  frame.idCardPreviousAngle =
    currentAngle;

  frame.setCoords();

  canvas.requestRenderAll();
};



  // ============================================================
  // EXPOSE FRAME API
  // ============================================================


  // ============================================================
// SCALE FRAME + IMAGE + QR + CLIP PATH TOGETHER
// ============================================================

const handleFrameScaling = (event) => {

  const frame =
    event.target;

  if (
    !frame ||
    !frame.idCardFrame
  ) {
    return;
  }

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {
    return;
  }

  // ==========================================================
  // FRAME IMAGE
  // ==========================================================

  const image =
    frame.idCardFrameImage;

  if (image) {

    const frameWidth =
      frame.getScaledWidth();

    const frameHeight =
      frame.getScaledHeight();

    if (
      image.width &&
      image.height
    ) {

      // ------------------------------------------------------
      // KEEP IMAGE IN COVER MODE
      // ------------------------------------------------------

      const scale =
        Math.max(
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

        left:
          frameCenter.x,

        top:
          frameCenter.y,

        scaleX:
          scale,

        scaleY:
          scale,

        angle:
          frame.angle || 0,

      });

      // ------------------------------------------------------
      // RESIZE CLIP PATH
      // ------------------------------------------------------

      if (
        image.clipPath
      ) {

        image.clipPath.set({

          width:
            frameWidth,

          height:
            frameHeight,

          left:
            frameCenter.x,

          top:
            frameCenter.y,

          angle:
            frame.angle || 0,

        });

        image.clipPath.setCoords();
      }

      image.setCoords();
    }
  }


  // ==========================================================
  // QR IMAGE
  // ==========================================================

  const qrImage =
    frame.idCardQRImage;

  if (qrImage) {

    const frameWidth =
      frame.getScaledWidth();

    const frameHeight =
      frame.getScaledHeight();

    const qrSize =
      Math.min(
        frameWidth,
        frameHeight
      );

    if (
      qrImage.width
    ) {

      const scale =
        qrSize /
        qrImage.width;

      const frameCenter =
        frame.getCenterPoint();

      qrImage.set({

        originX:
          "center",

        originY:
          "center",

        left:
          frameCenter.x,

        top:
          frameCenter.y,

        scaleX:
          scale,

        scaleY:
          scale,

        angle:
          frame.angle || 0,

      });

      if (
        qrImage.clipPath
      ) {

        qrImage.clipPath.set({

          width:
            frameWidth,

          height:
            frameHeight,

          left:
            frameCenter.x,

          top:
            frameCenter.y,

          angle:
            frame.angle || 0,

        });

        qrImage.clipPath.setCoords();
      }

      qrImage.setCoords();
    }
  }


  // ==========================================================
  // FINAL FRAME UPDATE
  // ==========================================================

  frame.setCoords();

  canvas.requestRenderAll();

};
  // ============================================================
  // EXPOSE FRAME API
  // ============================================================
// ============================================================
// EXPOSE FRAME API
// ============================================================

useImperativeHandle(
  ref,
  () => ({
    createFrame,

    populateDynamicPhoto,

    createDynamicQRCode,

    getActiveFrame,

    isFrameObject,

    addImageToFrame,

    replaceFrameImage,

    applyFrameImageFit,

    renderStudentDynamicFields,

    // ========================================================
    // CAPTURE CURRENT PREVIEW CANVAS
    // ========================================================

 // ========================================================
// CAPTURE CURRENT PREVIEW CANVAS
// ========================================================

// ========================================================
// CAPTURE CURRENT PREVIEW CANVAS
//
// Used for the on-screen preview/result layer.
// Keeps the existing 1x preview output.
// ========================================================

capturePreviewImage: () => {

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {

    console.warn(
      "PREVIEW CAPTURE: Canvas not available."
    );

    return null;
  }

  try {

    canvas.requestRenderAll();

    const imageData =
      canvas.toDataURL({
        format: "png",
        multiplier: 1,
      });

    console.log(
      "PREVIEW CANVAS IMAGE CAPTURED"
    );

    return imageData;

  } catch (error) {

    console.error(
      "FAILED TO CAPTURE PREVIEW CANVAS:",
      error
    );

    return null;
  }
},

// ========================================================
// CAPTURE HIGH-QUALITY PRINT IMAGE
//
// This is the production/export version.
// It does NOT replace the preview capture.
//
// 4x gives us a substantially larger raster output
// while preserving the exact Fabric design geometry.
// ========================================================

exportPrintImage: () => {

  const canvas =
    fabricCanvasRef.current;

  if (!canvas) {

    console.warn(
      "PRINT EXPORT: Canvas not available."
    );

    return null;
  }

  try {

    // ------------------------------------------------------
    // Remove any active selection before export
    // ------------------------------------------------------

    canvas.discardActiveObject();

    // ------------------------------------------------------
    // Make sure every object is rendered at its
    // final position before capture.
    // ------------------------------------------------------

    canvas.requestRenderAll();

    // ------------------------------------------------------
    // HIGH-RESOLUTION PNG EXPORT
    // ------------------------------------------------------

    const imageData =
      canvas.toDataURL({
        format: "png",

        // 4x the working canvas resolution.
        // This is intentionally separate from preview.
        multiplier: 4,
      });

    console.log(
      "HIGH-QUALITY PRINT IMAGE CAPTURED",
      {
        width:
          canvas.getWidth() * 4,

        height:
          canvas.getHeight() * 4,
      }
    );

    return imageData;

  } catch (error) {

    console.error(
      "FAILED TO CAPTURE HIGH-QUALITY PRINT IMAGE:",
      error
    );

    return null;
  }
},


// ========================================================
// LOAD SAVED DESIGN FOR ID CARD PREVIEW
// ========================================================

// ========================================================
// LOAD SAVED DESIGN FOR ID CARD PREVIEW
// ========================================================

loadPreviewDesign: async (
  sideDesign
) => {

  console.log(
    "PREVIEW SIDE DESIGN:",
    sideDesign
  );

  console.log(
    "PREVIEW CANVAS JSON:",
    sideDesign?.canvas
  );

  console.log(
    "PREVIEW OBJECT COUNT:",
    sideDesign?.canvas?.objects?.length
  );

  const canvas =
    fabricCanvasRef.current;

  if (
    !canvas ||
    !sideDesign?.canvas
  ) {
    console.warn(
      "PREVIEW CANVAS OR DESIGN NOT AVAILABLE"
    );

    return;
  }

  try {

    const canvasJSON =
      sideDesign.canvas;

    // ======================================================
    // 1. LOAD ALL FONTS USED BY THIS SIDE
    // ======================================================

    const fontFamilies =
      [
        ...new Set(
          (canvasJSON.objects || [])
            .map(
              (object) =>
                object?.fontFamily
            )
            .filter(Boolean)
        ),
      ];

    console.log(
      "PREVIEW FONT FAMILIES:",
      fontFamilies
    );

    for (
      const fontFamily
      of fontFamilies
    ) {

      const font =
        ID_CARD_FONTS.find(
          (item) =>
            item.family ===
            fontFamily
        );

      if (!font) {

        console.log(
          "PREVIEW FONT NOT REGISTERED:",
          fontFamily
        );

        continue;
      }

      try {

        console.log(
          "PREVIEW LOADING FONT:",
          fontFamily
        );

        await loadIDCardFont(
          font
        );

        console.log(
          "PREVIEW FONT READY:",
          fontFamily
        );

      } catch (error) {

        console.warn(
          "PREVIEW FONT LOAD FAILED:",
          fontFamily,
          error
        );

      }
    }


    // ======================================================
    // 2. CLEAR CURRENT CANVAS
    // ======================================================

    canvas.clear();

    canvas.backgroundImage =
      null;

    canvas.backgroundColor =
      "#ffffff";


    // ======================================================
    // 3. LOAD SAVED FABRIC DESIGN
    // ======================================================

    await canvas.loadFromJSON(
      canvasJSON
    );


    // ======================================================
    // 4. RESTORE FRAME → IMAGE RELATIONSHIPS
    // ======================================================
    //
    // loadFromJSON() restores the objects themselves,
    // but runtime references such as:
    //
    // frame.idCardFrameImage
    //
    // are not automatically restored.
    //
    // Reconnect them here.
    // ======================================================

    const objects =
      canvas.getObjects();


    const frames =
      objects.filter(
        (object) =>
          object?.idCardFrame === true
      );


    const frameImages =
      objects.filter(
        (object) =>
          object?.idCardFrameImageMarker === true &&
          object?.idCardFrameId
      );


    console.log(
      "PREVIEW RESTORED FRAME COUNT:",
      frames.length
    );

    console.log(
      "PREVIEW RESTORED FRAME IMAGE COUNT:",
      frameImages.length
    );


    frames.forEach(
      (frame) => {

        const image =
          frameImages.find(
            (item) =>
              item.idCardFrameId ===
              frame.idCardFrameId
          );

        if (image) {

          frame.idCardFrameImage =
            image;

          console.log(
            "PREVIEW FRAME IMAGE RESTORED:",
            frame.idCardFrameId
          );

        } else {

          console.log(
            "PREVIEW FRAME IMAGE NOT FOUND:",
            frame.idCardFrameId
          );

        }

      }
    );


    // ======================================================
    // 5. REMOVE OLD / SAVED QR OUTPUT
    // ======================================================
    //
    // QR is student-specific.
    //
    // The template should contain the QR FRAME.
    // The actual QR image is generated again by
    // renderStudentDynamicFields().
    // ======================================================

    const savedQRImages =
      objects.filter(
        (object) =>
          object?.idCardQRImageMarker === true
      );

    if (
      savedQRImages.length > 0
    ) {

      savedQRImages.forEach(
        (image) => {

          canvas.remove(
            image
          );

        }
      );

      console.log(
        "PREVIEW REMOVED SAVED QR IMAGES:",
        savedQRImages.length
      );

    }


    // ======================================================
    // 6. RESTORE SAVED BACKGROUND
    // ======================================================

    const background =
      sideDesign?.background;

    if (
      background
    ) {

      console.log(
        "PREVIEW RESTORING BACKGROUND:",
        background
      );


      // ----------------------------------------------------
      // SOLID COLOR
      // ----------------------------------------------------

      if (
        background.type ===
        "color"
      ) {

        canvas.backgroundColor =
          background.color ||
          "#ffffff";

      }


      // ----------------------------------------------------
      // GRADIENT
      // ----------------------------------------------------

      else if (
        background.type ===
        "gradient"
      ) {

        const color1 =
          background.color1 ||
          "#ffffff";

        const color2 =
          background.color2 ||
          "#000000";

        const angle =
          Number(
            background.angle || 0
          );

        const radians =
          (
            angle *
            Math.PI
          ) / 180;

        const width =
          canvas.getWidth();

        const height =
          canvas.getHeight();

        const centerX =
          width / 2;

        const centerY =
          height / 2;

        const length =
          Math.sqrt(
            width * width +
            height * height
          ) / 2;

        const x1 =
          centerX -
          Math.cos(radians) *
            length;

        const y1 =
          centerY -
          Math.sin(radians) *
            length;

        const x2 =
          centerX +
          Math.cos(radians) *
            length;

        const y2 =
          centerY +
          Math.sin(radians) *
            length;

        canvas.backgroundColor =
          new Gradient({
            type:
              "linear",

            coords: {
              x1,
              y1,
              x2,
              y2,
            },

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

      }


      // ----------------------------------------------------
      // BACKGROUND IMAGE
      // ----------------------------------------------------

      else if (
        background.type ===
          "image" &&
        background.imageUrl
      ) {

        try {

          const imageElement =
            new Image();

          imageElement.crossOrigin =
            "anonymous";

          await new Promise(
            (
              resolve,
              reject
            ) => {

              imageElement.onload =
                resolve;

              imageElement.onerror =
                reject;

              imageElement.src =
                resolveImageUrl(
                  background.imageUrl
                );

            }
          );

          const backgroundImage =
            new FabricImage(
              imageElement
            );

          const canvasWidth =
            canvas.getWidth();

          const canvasHeight =
            canvas.getHeight();

          const imageWidth =
            backgroundImage.width ||
            1;

          const imageHeight =
            backgroundImage.height ||
            1;


          // ------------------------------------------------
          // COVER
          // ------------------------------------------------

          if (
            background.imageFit ===
            "cover"
          ) {

            const scale =
              Math.max(
                canvasWidth /
                  imageWidth,

                canvasHeight /
                  imageHeight
              );

            backgroundImage.set({
              originX:
                "center",

              originY:
                "center",

              left:
                canvasWidth / 2,

              top:
                canvasHeight / 2,

              scaleX:
                scale,

              scaleY:
                scale,

              selectable:
                false,

              evented:
                false,
            });

          }


          // ------------------------------------------------
          // CONTAIN
          // ------------------------------------------------

          else {

            const scale =
              Math.min(
                canvasWidth /
                  imageWidth,

                canvasHeight /
                  imageHeight
              );

            backgroundImage.set({
              originX:
                "center",

              originY:
                "center",

              left:
                canvasWidth / 2,

              top:
                canvasHeight / 2,

              scaleX:
                scale,

              scaleY:
                scale,

              selectable:
                false,

              evented:
                false,
            });

          }


          canvas.backgroundImage =
            backgroundImage;

        } catch (error) {

          console.error(
            "PREVIEW BACKGROUND IMAGE LOAD FAILED:",
            error
          );

        }

      }

    }


    // ======================================================
    // 7. RESTORE OBJECT COORDINATES
    // ======================================================

    canvas
      .getObjects()
      .forEach(
        (object) => {

          object.setCoords();

        }
      );


    // ======================================================
    // 8. DEBUG RESTORED OBJECTS
    // ======================================================

    console.log(
      "PREVIEW RESTORED OBJECTS:",
      canvas.getObjects()
    );

    console.log(
      "PREVIEW RESTORED OBJECT COUNT:",
      canvas.getObjects().length
    );


    // ======================================================
    // 9. VERIFY RESTORED FONTS
    // ======================================================

    canvas
      .getObjects()
      .forEach(
        (object) => {

          if (
            object?.type ===
              "textbox" ||
            object?.type ===
              "i-text" ||
            object?.type ===
              "text"
          ) {

            console.log(
              "PREVIEW RESTORED FONT:",
              {
                text:
                  object.text,

                fontFamily:
                  object.fontFamily,

                fontSize:
                  object.fontSize,

                fontWeight:
                  object.fontWeight,

                fontStyle:
                  object.fontStyle,
              }
            );

          }

        }
      );


    // ======================================================
    // 10. FINAL RENDER
    // ======================================================

    canvas.requestRenderAll();

    console.log(
      "PREVIEW DESIGN RESTORE COMPLETE"
    );

  } catch (error) {

    console.error(
      "FAILED TO LOAD PREVIEW DESIGN:",
      error
    );

  }
},

// ========================================================
// CREATE DYNAMIC FIELD
// ========================================================

    // ========================================================
    // CREATE DYNAMIC FIELD
    // ========================================================

    createDynamicField: (
      fieldKey,
      fieldLabel
    ) => {

      const canvas =
        fabricCanvasRef.current;

      if (
        !canvas ||
        !fieldKey
      ) {
        return null;
      }

      const textbox =
        new Textbox(
          fieldLabel ||
            fieldKey,
          {
            left:
              canvas.getWidth() / 2,

            top:
              canvas.getHeight() / 2,

            width:
              180,

            fontSize:
              24,

            fontFamily:
              "Arial",

            fontWeight:
              "400",

            fill:
              "#111111",

            textAlign:
              "left",

            originX:
              "center",

            originY:
              "center",

            selectable:
              true,

            evented:
              true,

            idCardDynamicField:
              true,

            idCardDynamicKey:
              fieldKey,

            idCardOriginalText:
              fieldLabel ||
              fieldKey,

            idCardTextCase:
              "normal",
          }
        );

      canvas.add(
        textbox
      );

      canvas.setActiveObject(
        textbox
      );

      textbox.setCoords();

      canvas.requestRenderAll();

      return textbox;
    },
  }),
  [
    createFrame,

    getActiveFrame,

    createDynamicQRCode,

    isFrameObject,

    addImageToFrame,

    replaceFrameImage,

    applyFrameImageFit,

    populateDynamicPhoto,

    renderStudentDynamicFields,
  ]
);
  // ============================================================
  // DEBUG
  // ============================================================

  useEffect(() => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    console.log(
      "PEN MODE:",
      canvas.isDrawingMode
    );

    console.log(
      "VECTOR MODE:",
      isVectorMode
    );

    console.log(
      "BRUSH:",
      canvas.freeDrawingBrush
    );

    console.log(
      "CANVAS ELEMENT:",
      canvas.upperCanvasEl
    );
  }, [
    isDrawingMode,
    isVectorMode,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="id_card_fabric_wrapper">
      <canvas
        ref={
          canvasElementRef
        }
      />
    </div>
  );
});

export default IDCardCanvas;