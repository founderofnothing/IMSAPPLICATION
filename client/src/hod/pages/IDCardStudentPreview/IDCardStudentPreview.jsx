import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import jsPDF from "jspdf";

import IDCardCanvas from "../../../office/IDCard/components/canvas/IDCardCanvas";

const IDCardStudentPreview = ({
  student,
  idCardData,
  loading,
  onClose,
}) => {
  const canvasRef = useRef(null);

  const [canvasReady, setCanvasReady] =
    useState(false);

  const [previewSide, setPreviewSide] =
    useState("front");


    const [isVerified, setIsVerified] =
  useState(false);

  const [generatingCard, setGeneratingCard] =
  useState(false);

const [capturedCards, setCapturedCards] =
  useState({
    front: null,
    back: null,
  });
  const handleCanvasReady =
    useCallback((canvas) => {
      setCanvasReady(Boolean(canvas));
    }, []);


    // ============================================================
// CAPTURE FRONT + BACK ID CARD
// ============================================================

const handleGenerateIDCard =
  async () => {

    if (
      !isVerified ||
      generatingCard
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

if (
  !canvas?.loadPreviewDesign ||
  !canvas?.renderStudentDynamicFields ||
  !canvas?.exportPrintImage
) {

      console.error(
        "ID CARD GENERATION METHODS NOT AVAILABLE"
      );

      return;
    }

    try {

      setGeneratingCard(true);

      console.log(
        "STARTING ID CARD CAPTURE"
      );

      // ======================================================
      // CAPTURE FRONT
      // ======================================================

      console.log(
        "CAPTURING FRONT ID CARD"
      );

      await canvas.loadPreviewDesign(
        idCardData.template.design.front
      );

      await canvas.renderStudentDynamicFields(
        idCardData.student
      );

const frontImage =
  canvas.exportPrintImage();



      if (!frontImage) {
        throw new Error(
          "Failed to capture front ID card."
        );
      }

      console.log(
        "FRONT ID CARD CAPTURED"
      );


      // ======================================================
      // CAPTURE BACK
      // ======================================================

      console.log(
        "CAPTURING BACK ID CARD"
      );

      await canvas.loadPreviewDesign(
        idCardData.template.design.back
      );

      await canvas.renderStudentDynamicFields(
        idCardData.student
      );

const backImage =
  canvas.exportPrintImage();

      if (!backImage) {
        throw new Error(
          "Failed to capture back ID card."
        );
      }

      console.log(
        "BACK ID CARD CAPTURED"
      );


      // ======================================================
      // STORE BOTH SIDES
      // ======================================================

      setCapturedCards({
        front: frontImage,
        back: backImage,
      });

      console.log(
        "BOTH ID CARD SIDES CAPTURED",
        {
          front: Boolean(frontImage),
          back: Boolean(backImage),
        }
      );

    } catch (error) {

      console.error(
        "ID CARD GENERATION ERROR:",
        error
      );

    } finally {

      setGeneratingCard(false);

    }
  };


  // ============================================================
// GENERATE PRINT-QUALITY PDF
// ============================================================

const handleGeneratePDF = () => {

  if (
    !capturedCards.front ||
    !capturedCards.back
  ) {
    console.warn(
      "PDF GENERATION: Front or back card image missing."
    );

    return;
  }

  try {

    console.log(
      "STARTING ID CARD PDF GENERATION"
    );

    // --------------------------------------------------------
    // Read the actual high-resolution image dimensions
    // --------------------------------------------------------

    const image =
      new Image();

    image.src =
      capturedCards.front;

    image.onload = () => {

      const imageWidth =
        image.naturalWidth;

      const imageHeight =
        image.naturalHeight;

      console.log(
        "PDF SOURCE DIMENSIONS:",
        {
          width: imageWidth,
          height: imageHeight,
        }
      );

      // ------------------------------------------------------
      // Convert the source ratio into millimetres.
      //
      // We use 54mm width as the physical card width.
      // Height is calculated from the actual source ratio,
      // preventing stretching.
      // ------------------------------------------------------

      const cardWidthMm =
        54;

      const cardHeightMm =
        cardWidthMm *
        (imageHeight / imageWidth);

      console.log(
        "PDF CARD DIMENSIONS:",
        {
          widthMm: cardWidthMm,
          heightMm: cardHeightMm,
        }
      );

      // ------------------------------------------------------
      // Create PDF at exact card dimensions.
      //
      // No A4 page.
      // No arbitrary scaling.
      // ------------------------------------------------------

      const pdf =
        new jsPDF({
          orientation:
            "portrait",

          unit:
            "mm",

          format: [
            cardWidthMm,
            cardHeightMm * 2,
          ],

          compress:
            false,
        });

      // ------------------------------------------------------
      // FRONT
      // ------------------------------------------------------

      pdf.addImage(
        capturedCards.front,
        "PNG",
        0,
        0,
        cardWidthMm,
        cardHeightMm,
        undefined,
        "NONE"
      );

      // ------------------------------------------------------
      // BACK
      // ------------------------------------------------------

      pdf.addImage(
        capturedCards.back,
        "PNG",
        0,
        cardHeightMm,
        cardWidthMm,
        cardHeightMm,
        undefined,
        "NONE"
      );

      console.log(
        "ID CARD PDF GENERATED"
      );

      // ------------------------------------------------------
      // DOWNLOAD
      // ------------------------------------------------------

      pdf.save(
        `${student.registerNumber || "student"}-ID-Card.pdf`
      );
    };

    image.onerror = () => {

      console.error(
        "PDF GENERATION: Failed to read front image."
      );

    };

  } catch (error) {

    console.error(
      "ID CARD PDF GENERATION ERROR:",
      error
    );

  }
};

  // ============================================================
  // LOAD TEMPLATE + RENDER STUDENT
  // ============================================================

  useEffect(() => {
    const loadStudentPreview = async () => {
      console.log(
        "ID CARD PREVIEW EFFECT:",
        {
          idCardData,
          canvasReady,
          previewSide,
        }
      );

      if (
        !canvasReady ||
        !idCardData?.template?.design
      ) {
        return;
      }

      if (
        !canvasRef.current?.loadPreviewDesign
      ) {
        console.log(
          "LOAD PREVIEW DESIGN METHOD NOT AVAILABLE"
        );

        return;
      }

      const sideDesign =
        idCardData.template.design[
          previewSide
        ];

      if (!sideDesign) {
        console.log(
          "PREVIEW SIDE DESIGN NOT FOUND:",
          previewSide
        );

        return;
      }

      console.log(
        `CALLING LOAD ${previewSide.toUpperCase()} PREVIEW DESIGN`
      );

      // ========================================================
      // STEP 1 — LOAD TEMPLATE DESIGN
      // ========================================================

      await canvasRef.current.loadPreviewDesign(
        sideDesign
      );

      // ========================================================
      // STEP 2 — RENDER STUDENT DATA
      // ========================================================

      if (
        !canvasRef.current
          ?.renderStudentDynamicFields
      ) {
        console.log(
          "STUDENT DYNAMIC RENDER METHOD NOT AVAILABLE"
        );

        return;
      }

      console.log(
        "CALLING STUDENT DYNAMIC RENDER"
      );

      await canvasRef.current
        .renderStudentDynamicFields(
          idCardData.student
        );

      console.log(
        "STUDENT ID CARD PREVIEW READY"
      );
    };

    loadStudentPreview();
  }, [
    idCardData,
    canvasReady,
    previewSide,
  ]);

  // ============================================================
  // NO STUDENT
  // ============================================================

  if (!student) {
    return null;
  }

  return (
    <div className="id_card_student_preview">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="id_card_student_preview_header">

        <div>
          <h2>
            ID Card Preview
          </h2>

          <p>
            Review the student's ID card.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
        >
          Close
        </button>

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="id_card_student_preview_loading">
          Loading ID card...
        </div>

      ) : !idCardData ? (

        <div className="id_card_student_preview_empty">
          ID card data unavailable.
        </div>

      ) : (

        <div className="id_card_student_preview_content">

          {/* ==================================================
              STUDENT INFORMATION
              ================================================== */}

          <div className="id_card_student_preview_student">

            <h3>
              {student.studentName}
            </h3>

            <p>
              {student.registerNumber}
            </p>

          </div>


          {/* ==================================================
              FRONT / BACK SWITCH
              ================================================== */}

          <div className="id_card_student_preview_side_switch">

            <button
              type="button"
              className={
                previewSide === "front"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPreviewSide("front")
              }
            >
              Front
            </button>

            <button
              type="button"
              className={
                previewSide === "back"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPreviewSide("back")
              }
            >
              Back
            </button>

          </div>


          {/* ==================================================
              FABRIC CANVAS
              ================================================== */}

          <div className="id_card_student_preview_canvas">

            <IDCardCanvas
              ref={canvasRef}
              onCanvasReady={
                handleCanvasReady
              }
            />

          </div>


          {/* ==================================================
              VERIFICATION
              ================================================== */}

          <div className="id_card_student_preview_verification">

            <label>

              <input
                type="checkbox"
                checked={isVerified}
                onChange={(event) =>
                  setIsVerified(
                    event.target.checked
                  )
                }
              />

              <span>
                I have verified the student's
                ID card details and photo.
              </span>

            </label>


<button
  type="button"
  disabled={
    !isVerified ||
    generatingCard
  }
  onClick={
    handleGenerateIDCard
  }
>
  {generatingCard
    ? "Preparing ID Card..."
    : "Generate ID Card"}
</button>

          </div>

{/* ============================================================
    CAPTURED ID CARD RESULT
============================================================ */}

{capturedCards.front &&
  capturedCards.back && (

    <div className="id_card_student_preview_captured">

      <div className="id_card_student_preview_captured_header">

        <h3>
          ID Card Ready
        </h3>

        <p>
          Front and back sides have been prepared successfully.
        </p>

        <button
  type="button"
  onClick={handleGeneratePDF}
>
  Generate PDF
</button>

      </div>

      <div className="id_card_student_preview_captured_sides">

        {/* ================= FRONT ================= */}

        <div className="id_card_student_preview_captured_side">

          <h4>
            Front
          </h4>

          <img
            src={capturedCards.front}
            alt="Student ID card front"
          />

        </div>


        {/* ================= BACK ================= */}

        <div className="id_card_student_preview_captured_side">

          <h4>
            Back
          </h4>

          <img
            src={capturedCards.back}
            alt="Student ID card back"
          />

        </div>

      </div>

    </div>

)}
        

        </div>

      )}

    </div>
  );
};

export default IDCardStudentPreview;