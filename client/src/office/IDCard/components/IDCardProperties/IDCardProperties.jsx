import React, {
  useRef,
} from "react";

import {
  Path,
} from "fabric";

import {
  ID_CARD_FONTS,
  loadIDCardFont,
} from "../../utils/idCardFonts";

const IDCardProperties = ({
  selectedObject,
  canvas,
  background,
  onObjectSelected,
  onFrameImageFitChange,
  onFrameImageReplace,
  onBackgroundImageReplace,
  onBackgroundImageRemove,
  onBackgroundOpacityChange,
  onBackgroundImageFitChange,
}) => {
  const replaceImageInputRef =
    useRef(null);

    const backgroundImageInputRef =
  useRef(null);
if (!selectedObject) {
  return (
    <div className="id_card_properties">

      <div className="id_card_properties_header">
        <h3>Properties</h3>
      </div>

      {background?.type === "image" ? (
        <div className="id_card_property_section">

          <h4>
            Background Image
          </h4>

          {/* ==================================================
              OPACITY
          ================================================== */}

          <div className="id_card_property_field">

            <label>
              Opacity
            </label>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={
                background.backgroundOpacity ??
                1
              }
              onChange={(e) =>
                onBackgroundOpacityChange?.(
                  e.target.value
                )
              }
            />

            <span>
              {Math.round(
                (
                  background.backgroundOpacity ??
                  1
                ) * 100
              )}%
            </span>

          </div>

          {/* ==================================================
              FIT
          ================================================== */}

          <div className="id_card_property_field">

            <label>
              Fit
            </label>

<select
  value={
    background.imageFit ||
    "cover"
  }
  onChange={(e) =>
    onBackgroundImageFitChange?.(
      e.target.value
    )
  }
>
  <option value="cover">
    Cover
  </option>

  <option value="contain">
    Contain
  </option>
</select>

          </div>

          {/* ==================================================
              REPLACE IMAGE
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              backgroundImageInputRef.current?.click()
            }
          >
            Replace Image
          </button>

          <input
            ref={
              backgroundImageInputRef
            }
            type="file"
            accept="image/*"
            style={{
              display: "none",
            }}
            onChange={(e) => {

              const file =
                e.target.files?.[0];

              if (!file) {
                return;
              }

              const imageUrl =
                URL.createObjectURL(
                  file
                );

              onBackgroundImageReplace?.(
                imageUrl,
                background.imageFit ||
                  "cover"
              );

              e.target.value = "";

            }}
          />

          {/* ==================================================
              REMOVE IMAGE
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              onBackgroundImageRemove?.()
            }
          >
            Remove Image
          </button>

        </div>
      ) : (
        <div className="id_card_properties_empty">
          Select an object to edit
        </div>
      )}

    </div>
  );
}

  const object =
    selectedObject.object;

  // ============================================================
  // OBJECT TYPE
  // ============================================================

  const isTextObject =
    object?.type === "textbox" ||
    object?.type === "text" ||
    object?.type === "i-text";


    // ============================================================
// DYNAMIC FIELD
// ============================================================

const isDynamicField =
  object?.idCardDynamicField === true;

const dynamicFieldKey =
  object?.idCardDynamicKey || "";

const dynamicFieldLabel =
  object?.idCardDynamicLabel ||
  object?.idCardOriginalText ||
  object?.text ||
  dynamicFieldKey;

  const isShapeObject =
    object?.type === "rect" ||
    object?.type === "circle" ||
    object?.type === "line" ||
    object?.type === "triangle" ||
    object?.type === "polygon";

  const isFrameObject =
    object?.idCardFrame === true;

  const isPenObject =
    object?.type === "path" &&
    !object?.idCardVector;

  const isVectorObject =
    object?.type === "path" &&
    object?.idCardVector === true;

  // ============================================================
  // REFRESH SELECTED OBJECT
  // ============================================================

  const refreshObject = (
    targetObject
  ) => {
    onObjectSelected?.({
      object: targetObject,

      left:
        targetObject.left || 0,

      top:
        targetObject.top || 0,

      width:
        targetObject.getScaledWidth(),

      height:
        targetObject.getScaledHeight(),

      angle:
        targetObject.angle || 0,
    });
  };

  // ============================================================
  // GENERIC OBJECT UPDATE
  // ============================================================

  const updateObject = (
    property,
    value
  ) => {
    if (
      !canvas ||
      !object
    ) {
      return;
    }

    object.set(
      property,
      value
    );

    object.setCoords();

    canvas.requestRenderAll();

    refreshObject(
      object
    );
  };

  // ============================================================
  // WIDTH
  // ============================================================

  const updateWidth = (
    value
  ) => {
    const width =
      Number(value);

    if (
      !canvas ||
      !object ||
      width <= 0 ||
      !object.width
    ) {
      return;
    }

    object.set(
      "scaleX",
      width /
        object.width
    );

    object.setCoords();

    canvas.requestRenderAll();

    refreshObject(
      object
    );
  };

  // ============================================================
  // HEIGHT
  // ============================================================

  const updateHeight = (
    value
  ) => {
    const height =
      Number(value);

    if (
      !canvas ||
      !object ||
      height <= 0 ||
      !object.height
    ) {
      return;
    }

    object.set(
      "scaleY",
      height /
        object.height
    );

    object.setCoords();

    canvas.requestRenderAll();

    refreshObject(
      object
    );
  };

  // ============================================================
  // TYPOGRAPHY
  // ============================================================

const updateTypography = (
  property,
  value
) => {
  if (
    !canvas ||
    !object ||
    !isTextObject
  ) {
    return;
  }

  object.set(
    property,
    value
  );

  object.setCoords();

  canvas.requestRenderAll();

  // ==========================================================
  // TELL DESIGNER THAT THE OBJECT WAS MODIFIED
  // ==========================================================

  canvas.fire(
    "object:modified",
    {
      target: object,
    }
  );

  refreshObject(
    object
  );
};

  // ============================================================
  // TEXT CASE
  // ============================================================

  const applyTextCase = (
    value
  ) => {
    if (
      !canvas ||
      !object ||
      !isTextObject
    ) {
      return;
    }

    const currentText =
      object.text || "";

    const storedOriginal =
      object.idCardOriginalText ??
      currentText;

    const previousCase =
      object.idCardTextCase ||
      "normal";

    const previousDisplayedText =
      previousCase ===
      "uppercase"
        ? storedOriginal.toUpperCase()
        : previousCase ===
          "lowercase"
        ? storedOriginal.toLowerCase()
        : previousCase ===
          "titlecase"
        ? storedOriginal
            .toLowerCase()
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase()
            )
        : storedOriginal;

    const originalText =
      currentText !==
      previousDisplayedText
        ? currentText
        : storedOriginal;

    let transformedText =
      originalText;

    if (
      value ===
      "uppercase"
    ) {
      transformedText =
        originalText.toUpperCase();
    }

    if (
      value ===
      "lowercase"
    ) {
      transformedText =
        originalText.toLowerCase();
    }

    if (
      value ===
      "titlecase"
    ) {
      transformedText =
        originalText
          .toLowerCase()
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          );
    }

    object.set({
      text:
        transformedText,

      idCardTextCase:
        value,

      idCardOriginalText:
        originalText,
    });

    object.setCoords();

    canvas.requestRenderAll();

    refreshObject(
      object
    );
  };

  // ============================================================
  // VECTOR GEOMETRY HELPERS
  // ============================================================

  const distanceBetween = (
    pointA,
    pointB
  ) => {
    return Math.sqrt(
      Math.pow(
        pointB.x -
          pointA.x,
        2
      ) +
        Math.pow(
          pointB.y -
            pointA.y,
          2
        )
    );
  };

  const moveToward = (
    from,
    to,
    distance
  ) => {
    const totalDistance =
      distanceBetween(
        from,
        to
      );

    if (
      totalDistance === 0
    ) {
      return {
        x: from.x,
        y: from.y,
      };
    }

    const ratio =
      distance /
      totalDistance;

    return {
      x:
        from.x +
        (to.x -
          from.x) *
          ratio,

      y:
        from.y +
        (to.y -
          from.y) *
          ratio,
    };
  };

  // ============================================================
  // BUILD ROUNDED VECTOR PATH
  // ============================================================

  const buildRoundedVectorPath = (
    pathCommands,
    radius
  ) => {
    if (
      !pathCommands ||
      pathCommands.length === 0
    ) {
      return null;
    }

    const points = [];

    pathCommands.forEach(
      (command) => {
        if (
          command[0] === "M" ||
          command[0] === "L"
        ) {
          points.push({
            x: Number(
              command[1]
            ),
            y: Number(
              command[2]
            ),
          });
        }
      }
    );

    if (
      points.length < 3
    ) {
      return pathCommands.map(
        (command) => [
          ...command,
        ]
      );
    }

    const requestedRadius =
      Math.max(
        0,
        Number(radius) || 0
      );

    if (
      requestedRadius === 0
    ) {
      return pathCommands.map(
        (command) => [
          ...command,
        ]
      );
    }

    const roundedCommands = [];

    roundedCommands.push([
      "M",
      points[0].x,
      points[0].y,
    ]);

    for (
      let i = 1;
      i < points.length - 1;
      i++
    ) {
      const previous =
        points[i - 1];

      const current =
        points[i];

      const next =
        points[i + 1];

      const incomingLength =
        distanceBetween(
          previous,
          current
        );

      const outgoingLength =
        distanceBetween(
          current,
          next
        );

      if (
        incomingLength <= 0 ||
        outgoingLength <= 0
      ) {
        roundedCommands.push([
          "L",
          current.x,
          current.y,
        ]);

        continue;
      }

      const maxRadius =
        Math.min(
          incomingLength,
          outgoingLength
        ) * 0.45;

      const actualRadius =
        Math.min(
          requestedRadius,
          maxRadius
        );

      const entryPoint =
        moveToward(
          current,
          previous,
          actualRadius
        );

      const exitPoint =
        moveToward(
          current,
          next,
          actualRadius
        );

      roundedCommands.push([
        "L",
        entryPoint.x,
        entryPoint.y,
      ]);

      roundedCommands.push([
        "Q",
        current.x,
        current.y,
        exitPoint.x,
        exitPoint.y,
      ]);
    }

    const lastPoint =
      points[
        points.length - 1
      ];

    roundedCommands.push([
      "L",
      lastPoint.x,
      lastPoint.y,
    ]);

    return roundedCommands;
  };

  // ============================================================
  // UPDATE VECTOR CORNER RADIUS
  // ============================================================

  const updateVectorCornerRadius = (
    radius
  ) => {
    if (
      !canvas ||
      !object ||
      !isVectorObject
    ) {
      return;
    }

    const numericRadius =
      Math.max(
        0,
        Number(radius) || 0
      );

    if (
      !object.idCardOriginalVectorPath &&
      object.path
    ) {
      object.idCardOriginalVectorPath =
        object.path.map(
          (command) => [
            ...command,
          ]
        );
    }

    const originalPath =
      object.idCardOriginalVectorPath;

    if (
      !originalPath
    ) {
      return;
    }

    if (
      numericRadius === 0
    ) {
      object.set({
        path:
          originalPath.map(
            (command) => [
              ...command,
            ]
          ),

        idCardCornerRadius:
          0,
      });

      object.setCoords();

      canvas.requestRenderAll();

      refreshObject(
        object
      );

      return;
    }

    const roundedPath =
      buildRoundedVectorPath(
        originalPath,
        numericRadius
      );

    if (
      !roundedPath
    ) {
      return;
    }

    const center =
      object.getCenterPoint();

    const newPath =
      new Path(
        roundedPath,
        {
          fill:
            object.fill,

          stroke:
            object.stroke,

          strokeWidth:
            object.strokeWidth,

          opacity:
            object.opacity,

          visible:
            object.visible,

          selectable:
            true,

          evented:
            true,

          angle:
            object.angle,

          flipX:
            object.flipX,

          flipY:
            object.flipY,

          skewX:
            object.skewX,

          skewY:
            object.skewY,

          scaleX:
            object.scaleX,

          scaleY:
            object.scaleY,

          idCardVector:
            true,

          idCardCornerRadius:
            numericRadius,

          idCardOriginalVectorPath:
            originalPath.map(
              (command) => [
                ...command,
              ]
            ),

          excludeFromExport:
            false,
        }
      );

    newPath.setPositionByOrigin(
      center,
      "center",
      "center"
    );

    newPath.setCoords();

    canvas.remove(
      object
    );

    canvas.add(
      newPath
    );

    canvas.setActiveObject(
      newPath
    );

    canvas.requestRenderAll();

    refreshObject(
      newPath
    );
  };

  // ============================================================
  // CURRENT VECTOR RADIUS
  // ============================================================

  const currentVectorRadius =
    isVectorObject
      ? (
          object.idCardCornerRadius ??
          0
        )
      : 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="id_card_properties">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="id_card_properties_header">
        <h3>Properties</h3>
      </div>




{/* ======================================================
    DYNAMIC FIELD
====================================================== */}

{isDynamicField && (
  <div className="id_card_property_section">

    <h4>
      Dynamic Field
    </h4>

    <div className="id_card_property_field">
      <label>
        Field
      </label>

      <div
        className="id_card_dynamic_value"
        style={{
          padding: "8px 10px",
          border:
            "1px solid #e5e7eb",
          borderRadius: "6px",
          background: "#f9fafb",
          color: "#111827",
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {object?.idCardDynamicLabel ||
          object?.idCardOriginalText ||
          object?.text ||
          "Unknown Field"}
      </div>
    </div>

    <div className="id_card_property_field">
      <label>
        Key
      </label>

      <div
        className="id_card_dynamic_value"
        style={{
          padding: "8px 10px",
          border:
            "1px solid #e5e7eb",
          borderRadius: "6px",
          background: "#f9fafb",
          color: "#111827",
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {object?.idCardDynamicKey ||
          "Unknown Key"}
      </div>
    </div>

  </div>
)}

      {/* ======================================================
          TRANSFORM
      ====================================================== */}

      <div className="id_card_property_section">
        <h4>Transform</h4>

        <div className="id_card_property_grid">
          <div className="id_card_property_field">
            <label>X</label>

            <input
              type="number"
              value={Math.round(
                selectedObject.left
              )}
              onChange={(e) =>
                updateObject(
                  "left",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>

          <div className="id_card_property_field">
            <label>Y</label>

            <input
              type="number"
              value={Math.round(
                selectedObject.top
              )}
              onChange={(e) =>
                updateObject(
                  "top",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>
        </div>

        <div className="id_card_property_grid">
          <div className="id_card_property_field">
            <label>Width</label>

            <input
              type="number"
              min="1"
              value={Math.round(
                selectedObject.width
              )}
              onChange={(e) =>
                updateWidth(
                  e.target.value
                )
              }
            />
          </div>

          <div className="id_card_property_field">
            <label>Height</label>

            <input
              type="number"
              min="1"
              value={Math.round(
                selectedObject.height
              )}
              onChange={(e) =>
                updateHeight(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="id_card_property_field">
          <label>Rotation</label>

          <input
            type="number"
            value={Math.round(
              selectedObject.angle
            )}
            onChange={(e) =>
              updateObject(
                "angle",
                Number(
                  e.target.value
                )
              )
            }
          />
        </div>
      </div>

      {/* ======================================================
          APPEARANCE
      ====================================================== */}

      {(
        isShapeObject ||
        isPenObject ||
        isVectorObject
      ) && (
        <div className="id_card_property_section">
          <h4>Appearance</h4>

          {/* ==================================================
              FILL
          ================================================== */}

          {!isPenObject && (
            <div className="id_card_property_field">
              <label>Fill</label>

              <input
                type="color"
                value={
                  typeof object.fill ===
                  "string"
                    ? object.fill
                    : "#e5e7eb"
                }
                onChange={(e) =>
                  updateObject(
                    "fill",
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* ==================================================
              FRAME IMAGE
          ================================================== */}

          {isFrameObject &&
            selectedObject?.object
              ?.idCardFrameImage && (
              <div className="id_card_property_field">
                <label>
                  Image Fit
                </label>

                <select
                  value={
                    selectedObject
                      .object
                      .idCardFrameFit ||
                    "cover"
                  }
                  onChange={(e) => {
                    onFrameImageFitChange?.(
                      selectedObject.object,
                      e.target.value
                    );
                  }}
                >
                  <option value="cover">
                    Cover
                  </option>

                  <option value="contain">
                    Contain
                  </option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    replaceImageInputRef.current?.click()
                  }
                >
                  Replace Image
                </button>

                <input
                  ref={
                    replaceImageInputRef
                  }
                  type="file"
                  accept="image/*"
                  style={{
                    display: "none",
                  }}
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    const imageUrl =
                      URL.createObjectURL(
                        file
                      );

                    onFrameImageReplace?.(
                      imageUrl,
                      selectedObject.object
                    );

                    e.target.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    const frame =
                      selectedObject.object;

                    const image =
                      frame.idCardFrameImage;

                    if (
                      image &&
                      canvas?.contains(
                        image
                      )
                    ) {
                      canvas.remove(
                        image
                      );
                    }

                    frame.idCardFrameImage =
                      null;

                    frame.idCardFrameImageUrl =
                      null;

                    frame.idCardFrameFit =
                      "cover";

                    frame.setCoords();

                    canvas?.setActiveObject(
                      frame
                    );

                    canvas?.requestRenderAll();

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
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}

          {/* ==================================================
              STROKE
          ================================================== */}

          <div className="id_card_property_field">
            <label>Stroke</label>

            <input
              type="color"
              value={
                typeof object.stroke ===
                "string"
                  ? object.stroke
                  : "#111111"
              }
              onChange={(e) =>
                updateObject(
                  "stroke",
                  e.target.value
                )
              }
            />
          </div>

          {/* ==================================================
              FRAME SHAPE
          ================================================== */}

          {isFrameObject && (
            <div className="id_card_property_field">
              <label>
                Frame Shape
              </label>

              <select
                value={
                  object.idCardFrameType ||
                  "rectangle"
                }
                onChange={(e) => {
                  const shape =
                    e.target.value;

                  if (
                    shape ===
                    "rectangle"
                  ) {
                    object.set({
                      rx: 0,
                      ry: 0,
                    });
                  }

                  if (
                    shape ===
                    "rounded"
                  ) {
                    object.set({
                      rx: 20,
                      ry: 20,
                    });
                  }

                  if (
                    shape ===
                    "circle"
                  ) {
                    const size =
                      Math.min(
                        object.width,
                        object.height
                      );

                    object.set({
                      width: size,
                      height: size,
                      rx:
                        size / 2,
                      ry:
                        size / 2,
                    });
                  }

                  object.set({
                    idCardFrameType:
                      shape,
                  });

                  object.setCoords();

                  canvas.requestRenderAll();

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
                }}
              >
                <option value="rectangle">
                  Rectangle
                </option>

                <option value="rounded">
                  Rounded Rectangle
                </option>

                <option value="circle">
                  Circle
                </option>
              </select>
            </div>
          )}

          {/* ==================================================
              BORDER WIDTH
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Border Width
            </label>

            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={
                object.strokeWidth ||
                0
              }
              onChange={(e) =>
                updateObject(
                  "strokeWidth",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>

          {/* ==================================================
              VECTOR CORNER RADIUS
          ================================================== */}

          {isVectorObject && (
            <div className="id_card_property_field">
              <label>
                Corner Radius
              </label>

              <input
                type="number"
                min="0"
                max="200"
                step="1"
                value={
                  currentVectorRadius
                }
                onChange={(e) =>
                  updateVectorCornerRadius(
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* ==================================================
              NORMAL SHAPE CORNER RADIUS
          ================================================== */}

          {isShapeObject &&
            object.type === "rect" && (
              <div className="id_card_property_field">
                <label>
                  Corner Radius
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(
                    object.rx || 0
                  )}
                  onChange={(e) => {
                    const radius =
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        )
                      );

                    updateObject(
                      "rx",
                      radius
                    );

                    updateObject(
                      "ry",
                      radius
                    );
                  }}
                />
              </div>
            )}

          {/* ==================================================
              OPACITY
          ================================================== */}

          <div className="id_card_property_field">
            <label>Opacity</label>

            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round(
                (
                  object.opacity ??
                  1
                ) * 100
              )}
              onChange={(e) => {
                const value =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        e.target.value
                      )
                    )
                  );

                updateObject(
                  "opacity",
                  value / 100
                );
              }}
            />
          </div>
        </div>
      )}

      {/* ======================================================
          TYPOGRAPHY
      ====================================================== */}

      {isTextObject && (
        <div className="id_card_property_section">
          <h4>Typography</h4>

          {/* ==================================================
              FONT FAMILY
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Font Family
            </label>

            <select
              value={
                object.fontFamily ||
                "Arial"
              }
              onChange={async (e) => {
                const font =
                  ID_CARD_FONTS.find(
                    (item) =>
                      item.family ===
                      e.target.value
                  );

                if (!font) {
                  return;
                }

                await loadIDCardFont(
                  font
                );

                updateTypography(
                  "fontFamily",
                  font.family
                );
              }}
            >
              {ID_CARD_FONTS.map(
                (font) => (
                  <option
                    key={
                      font.family
                    }
                    value={
                      font.family
                    }
                  >
                    {font.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ==================================================
              FONT SIZE
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Font Size
            </label>

            <input
              type="number"
              min="1"
              value={
                object.fontSize ||
                24
              }
              onChange={(e) =>
                updateTypography(
                  "fontSize",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>

          {/* ==================================================
              FONT WEIGHT
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Font Weight
            </label>

            <select
              value={
                object.fontWeight ||
                "400"
              }
              onChange={(e) =>
                updateTypography(
                  "fontWeight",
                  e.target.value
                )
              }
            >
              <option value="300">
                Light
              </option>

              <option value="400">
                Regular
              </option>

              <option value="500">
                Medium
              </option>

              <option value="600">
                Semi Bold
              </option>

              <option value="700">
                Bold
              </option>
            </select>
          </div>

          {/* ==================================================
              ITALIC
          ================================================== */}

          <div className="id_card_property_field">
            <label>Italic</label>

            <select
              value={
                object.fontStyle ||
                "normal"
              }
              onChange={(e) =>
                updateTypography(
                  "fontStyle",
                  e.target.value
                )
              }
            >
              <option value="normal">
                Normal
              </option>

              <option value="italic">
                Italic
              </option>
            </select>
          </div>

          {/* ==================================================
              TEXT CASE
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Text Case
            </label>

            <select
              value={
                object.idCardTextCase ||
                "normal"
              }
              onChange={(e) =>
                applyTextCase(
                  e.target.value
                )
              }
            >
              <option value="normal">
                Normal
              </option>

              <option value="uppercase">
                UPPERCASE
              </option>

              <option value="lowercase">
                lowercase
              </option>

              <option value="titlecase">
                Title Case
              </option>
            </select>
          </div>

          {/* ==================================================
              UNDERLINE
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Underline
            </label>

            <select
              value={
                object.underline
                  ? "underline"
                  : "normal"
              }
              onChange={(e) =>
                updateTypography(
                  "underline",
                  e.target.value ===
                    "underline"
                )
              }
            >
              <option value="normal">
                Normal
              </option>

              <option value="underline">
                Underline
              </option>
            </select>
          </div>

          {/* ==================================================
              TEXT ALIGNMENT
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Text Alignment
            </label>

            <select
              value={
                object.textAlign ||
                "left"
              }
              onChange={(e) =>
                updateTypography(
                  "textAlign",
                  e.target.value
                )
              }
            >
              <option value="left">
                Left
              </option>

              <option value="center">
                Center
              </option>

              <option value="right">
                Right
              </option>

              <option value="justify">
                Justify
              </option>
            </select>
          </div>

          {/* ==================================================
              LETTER SPACING
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Letter Spacing
            </label>

            <input
              type="number"
              min="-50"
              max="500"
              value={
                object.charSpacing ||
                0
              }
              onChange={(e) =>
                updateTypography(
                  "charSpacing",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>

          {/* ==================================================
              LINE HEIGHT
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Line Height
            </label>

            <input
              type="number"
              min="0.5"
              max="3"
              step="0.05"
              value={
                object.lineHeight ||
                1.16
              }
              onChange={(e) =>
                updateTypography(
                  "lineHeight",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>

          {/* ==================================================
              TEXT COLOR
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Text Color
            </label>

            <input
              type="color"
              value={
                object.fill ||
                "#111111"
              }
              onChange={(e) =>
                updateTypography(
                  "fill",
                  e.target.value
                )
              }
            />
          </div>

          {/* ==================================================
              TEXT OPACITY
          ================================================== */}

          <div className="id_card_property_field">
            <label>
              Opacity
            </label>

            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round(
                (
                  object.opacity ??
                  1
                ) * 100
              )}
              onChange={(e) => {
                const value =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        e.target.value
                      )
                    )
                  );

                updateTypography(
                  "opacity",
                  value / 100
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IDCardProperties;