import React from "react";
import {
  Textbox,
  Rect,
  Circle,
  Line,
} from "fabric";

import  {ID_CARD_DYNAMIC_FIELDS,} from "../../../../utils/idCard/dynamicFieldRegistry";

const IDCardToolbar = ({
  canvas,
  background,
  onBackgroundChange,
  onGradientBackground,
  onImageBackground,
  onFrameImage,
  onCreateFrame,
  isDrawingMode,
  onDrawingModeChange,
  onAddDynamicField,
  onCreateDynamicQRCode,
  onAssignDynamicPhoto,
  onAssignDynamicFieldToFrame,
  isVectorMode,
  onVectorModeChange,
}) => {

   const [showDynamicFields, setShowDynamicFields] =
    React.useState(false);


      // ============================================================
  // DYNAMIC FIELD DEFINITIONS
  // ============================================================

const dynamicFieldGroups = [
  {
    title: "Student",
    fields: ID_CARD_DYNAMIC_FIELDS.filter(
      (field) =>
        [
          "studentName",
          "applicationNumber",
          "registerNumber",
          "dateOfBirth",
          "age",
          "gender",
          "bloodGroup",
          "address",
          "phoneNumber",
          "studentPhoto",
        ].includes(field.key)
    ),
  },

  {
    title: "Academic",
    fields: ID_CARD_DYNAMIC_FIELDS.filter(
      (field) =>
        [
          "departmentName",
          "programmeName",
          "programmeCode",
          "section",
          "academicYear",
        ].includes(field.key)
    ),
  },

  {
    title: "Institution",
    fields: ID_CARD_DYNAMIC_FIELDS.filter(
      (field) =>
        [
          "institutionName",
          "institutionCode",
        ].includes(field.key)
    ),
  },

  {
    title: "Special",
    fields: ID_CARD_DYNAMIC_FIELDS.filter(
      (field) =>
        [
          "qrCode",
        ].includes(field.key)
    ),
  },
];
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
  // ADD TEXT
  // ============================================================

  const addText = () => {
    if (!canvas) {
      return;
    }

    const text = new Textbox("Your Text", {
      left: 80,
      top: 100,
      width: 190,
      fontSize: 24,
      fontFamily: "Arial",
      fontWeight: "400",
      fontStyle: "normal",
      fill: "#111111",
      editable: true,
      idCardTextCase: "normal",
      idCardOriginalText: "Your Text",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  // ============================================================
  // ADD RECTANGLE
  // ============================================================

  const addRectangle = () => {
    if (!canvas) {
      return;
    }

    const rectangle = new Rect({
      left: 80,
      top: 100,
      width: 180,
      height: 100,
      fill: "#e5e7eb",
      stroke: "#111111",
      strokeWidth: 1,
      rx: 0,
      ry: 0,
    });

    canvas.add(rectangle);
    canvas.setActiveObject(rectangle);
    canvas.requestRenderAll();
  };

  // ============================================================
  // ADD ROUNDED RECTANGLE
  // ============================================================

  const addRoundedRectangle = () => {
    if (!canvas) {
      return;
    }

    const rectangle = new Rect({
      left: 80,
      top: 100,
      width: 180,
      height: 100,
      fill: "#e5e7eb",
      stroke: "#111111",
      strokeWidth: 1,
      rx: 20,
      ry: 20,
    });

    canvas.add(rectangle);
    canvas.setActiveObject(rectangle);
    canvas.requestRenderAll();
  };

  // ============================================================
  // ADD CIRCLE
  // ============================================================

  const addCircle = () => {
    if (!canvas) {
      return;
    }

    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 60,
      fill: "#e5e7eb",
      stroke: "#111111",
      strokeWidth: 1,
    });

    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  // ============================================================
  // ADD LINE
  // ============================================================

  const addLine = () => {
    if (!canvas) {
      return;
    }

    const line = new Line([60, 150, 240, 150], {
      stroke: "#111111",
      strokeWidth: 2,
      selectable: true,
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  // ============================================================
  // ADD FRAME
  // ============================================================



  // ============================================================
  // CONVERT FILE TO DATA URL
  // ============================================================

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error("Failed to read image file.")
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // ============================================================
  // HANDLE IMAGE UPLOAD
  // ============================================================

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imageUrl =
        await fileToDataUrl(file);

      const activeObject =
        canvas?.getActiveObject();

      if (activeObject?.idCardFrame) {
        onFrameImage?.(
          imageUrl,
          activeObject
        );
      } else {
        onImageBackground?.(
          imageUrl,
          background?.imageFit || "cover"
        );
      }
    } catch (error) {
      console.error(
        "Failed to process image:",
        error
      );
    } finally {
      event.target.value = "";
    }
  };

  // ============================================================
  // HANDLE BACKGROUND IMAGE
  // ============================================================

  const handleBackgroundImage = async (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imageUrl =
        await fileToDataUrl(file);

      onImageBackground?.(
        imageUrl,
        background?.imageFit || "cover"
      );
    } catch (error) {
      console.error(
        "Failed to process background image:",
        error
      );
    } finally {
      event.target.value = "";
    }
  };

  // ============================================================
  // CLEAR ENTIRE CANVAS
  // ============================================================

  const clearCanvas = () => {
    if (!canvas) {
      return;
    }

    const confirmed = window.confirm(
      "Clear the entire card? This will remove all objects from the current side."
    );

    if (!confirmed) {
      return;
    }

    canvas.clear();
    canvas.backgroundImage = null;
    canvas.backgroundColor = "#ffffff";
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    onBackgroundChange?.({
      type: "color",
      color: "#ffffff",
    });
  };

  // ============================================================
  // DUPLICATE ACTIVE OBJECT
  // ============================================================

  const duplicateObject = () => {
    if (!canvas) {
      return;
    }

    const activeObject =
      canvas.getActiveObject();

    if (!activeObject) {
      return;
    }

    activeObject.clone().then((clonedObject) => {
      clonedObject.set({
        left:
          (activeObject.left || 0) + 20,
        top:
          (activeObject.top || 0) + 20,
      });

      if (clonedObject.idCardFrame) {
        clonedObject.idCardFrameId =
          createFrameId();

        clonedObject.idCardFrameImage =
          null;

        clonedObject.idCardFrameImageUrl =
          null;

        clonedObject.idCardImageOffsetX = 0;
        clonedObject.idCardImageOffsetY = 0;
      }

      canvas.add(clonedObject);
      canvas.setActiveObject(clonedObject);
      canvas.requestRenderAll();
    });
  };

  return (
    <div className="id_card_toolbar">
      {/* ============================================================
          ELEMENTS
      ============================================================ */}

      <div className="id_card_toolbar_section">
        <h3>Elements</h3>

        <button
          type="button"
          onClick={addText}
          disabled={!canvas}
        >
          Text
        </button>
<div
  className="id_card_dynamic_field_wrapper"
  style={{
    position: "relative",
  }}
>
  <button
    type="button"
    onClick={() =>
      setShowDynamicFields(
        (prev) => !prev
      )
    }
    disabled={!canvas}
  >
    Dynamic Field
  </button>

  {showDynamicFields && (
    <div
      className="id_card_dynamic_field_menu"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 1000,
        minWidth: "220px",
        maxHeight: "420px",
        overflowY: "auto",
        background: "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "8px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.12)",
      }}
    >
      {dynamicFieldGroups.map(
        (group) => (
          <div
            key={group.title}
            className="id_card_dynamic_field_group"
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform:
                  "uppercase",
                padding:
                  "8px 10px 5px",
                color: "#6b7280",
              }}
            >
              {group.title}
            </div>

            {group.fields.map(
              (field) => (
                <button
                  key={field.key}
                  type="button"
onClick={() => {
  if (
    field.key === "studentPhoto"
  ) {
    onAssignDynamicPhoto?.();

} else if (
  field.key === "qrCode"
) {
  onAssignDynamicFieldToFrame?.(
    field.key,
    field.label
  );

} else {
    onAddDynamicField?.(
      field.key,
      field.label
    );
  }

  setShowDynamicFields(
    false
  );
}}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "none",
                    background:
                      "transparent",
                    textAlign: "left",
                    padding:
                      "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  {field.label}
                </button>
              )
            )}
          </div>
        )
      )}
    </div>
  )}
</div>

        <label className="id_card_toolbar_button">
          Image

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>

        <button
          type="button"
          disabled={!canvas}
        >
          QR Code
        </button>

        <button
          type="button"
          onClick={addRectangle}
          disabled={!canvas}
        >
          Rectangle
        </button>

        <button
          type="button"
          onClick={addRoundedRectangle}
          disabled={!canvas}
        >
          Rounded Rectangle
        </button>

<button
  type="button"
  onClick={onCreateFrame}
  disabled={!canvas}
>
  Frame
</button>

        <button
          type="button"
          onClick={addCircle}
          disabled={!canvas}
        >
          Circle
        </button>

        <button
          type="button"
          onClick={addLine}
          disabled={!canvas}
        >
          Line
        </button>

        <button
          type="button"
          onClick={() =>
            onDrawingModeChange?.(
              !isDrawingMode
            )
          }
          disabled={!canvas}
        >
          {isDrawingMode
            ? "Exit Pen"
            : "Pen"}
        </button>

        <button
          type="button"
          onClick={() =>
            onVectorModeChange?.(
              !isVectorMode
            )
          }
          disabled={!canvas}
        >
          {isVectorMode
            ? "Exit Vector"
            : "Vector"}
        </button>
      </div>

      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="id_card_toolbar_section">
        <h3>Background</h3>

        <button
          type="button"
          onClick={() =>
            onGradientBackground?.({
              gradientType:
                background?.gradientType ||
                "linear",

              color1:
                background?.color1 ||
                "#ffffff",

              color2:
                background?.color2 ||
                "#111111",

              angle:
                background?.angle || 0,
            })
          }
        >
          Gradient
        </button>

        <label className="id_card_toolbar_button">
          Background Image

          <input
            type="file"
            accept="image/*"
            onChange={
              handleBackgroundImage
            }
            style={{
              display: "none",
            }}
          />
        </label>

        <input
          type="color"
          value={
            background?.color ||
            "#ffffff"
          }
          onChange={(event) =>
            onBackgroundChange?.({
              type: "color",
              color:
                event.target.value,
            })
          }
        />

        <select
          value={
            background?.gradientType ||
            "linear"
          }
          onChange={(event) =>
            onGradientBackground?.({
              gradientType:
                event.target.value,

              color1:
                background?.color1 ||
                "#ffffff",

              color2:
                background?.color2 ||
                "#111111",

              angle:
                background?.angle || 0,
            })
          }
        >
          <option value="linear">
            Linear
          </option>

          <option value="radial">
            Radial
          </option>
        </select>

        <input
          type="color"
          value={
            background?.color1 ||
            "#ffffff"
          }
          onChange={(event) =>
            onGradientBackground?.({
              gradientType:
                background?.gradientType ||
                "linear",

              color1:
                event.target.value,

              color2:
                background?.color2 ||
                "#111111",

              angle:
                background?.angle || 0,
            })
          }
        />

        <input
          type="color"
          value={
            background?.color2 ||
            "#111111"
          }
          onChange={(event) =>
            onGradientBackground?.({
              gradientType:
                background?.gradientType ||
                "linear",

              color1:
                background?.color1 ||
                "#ffffff",

              color2:
                event.target.value,

              angle:
                background?.angle || 0,
            })
          }
        />

        {(
          background?.gradientType ||
          "linear"
        ) === "linear" && (
          <>
            <label>
              Angle
            </label>

            <input
              type="number"
              min="0"
              max="360"
              step="1"
              value={
                background?.angle ||
                0
              }
              onChange={(event) =>
                onGradientBackground?.({
                  gradientType:
                    "linear",

                  color1:
                    background?.color1 ||
                    "#ffffff",

                  color2:
                    background?.color2 ||
                    "#111111",

                  angle:
                    Number(
                      event.target.value
                    ),
                })
              }
            />
          </>
        )}
      </div>

      {/* ============================================================
          ACTIONS
      ============================================================ */}

      <div className="id_card_toolbar_section">
        <h3>Actions</h3>

        <button
          type="button"
          onClick={clearCanvas}
          disabled={!canvas}
        >
          Delete
        </button>

        <button
          type="button"
          onClick={duplicateObject}
          disabled={!canvas}
        >
          Duplicate
        </button>
      </div>
    </div>
  );
};

export default IDCardToolbar;