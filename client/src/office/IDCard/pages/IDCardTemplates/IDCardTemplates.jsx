import { useEffect, useState } from "react";
import API from "../../../../api/axios";
import { toast } from "react-toastify";

const IDCardTemplates = () => {

    const [templates, setTemplates] =
  useState([]);

const [loading, setLoading] =
  useState(true);

const [error, setError] =
  useState("");

  const [assignmentPopupOpen, setAssignmentPopupOpen] =
  useState(false);

const [selectedTemplate, setSelectedTemplate] =
  useState(null);

const [institutions, setInstitutions] =
  useState([]);

const [selectedInstitution, setSelectedInstitution] =
  useState("");

const [institutionLoading, setInstitutionLoading] =
  useState(false);

const [assigning, setAssigning] =
  useState(false);

  const [assignments, setAssignments] =
  useState({});


  const fetchTemplates = async () => {
  try {
    setLoading(true);
    setError("");

    const response =
      await API.get(
        "/id-card/templates"
      );

    setTemplates(
      response.data?.templates || []
    );

    console.log(
      "ID CARD TEMPLATES:",
      response.data?.templates
    );

  } catch (error) {
    console.error(
      "FAILED TO FETCH ID CARD TEMPLATES:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Failed to load ID card templates."
    );

  } finally {
    setLoading(false);
  }
};


const fetchTemplateAssignment = async (
  templateId
) => {
  try {
    const response =
      await API.get(
        `/id-card/template-assignments/template/${templateId}`
      );

    return response.data?.data || null;

  } catch (error) {
    console.error(
      `FAILED TO FETCH ASSIGNMENT FOR TEMPLATE ${templateId}:`,
      error
    );

    return null;
  }
};




const fetchInstitutions = async () => {
  try {
    setInstitutionLoading(true);

    const response =
      await API.get("/institutions");

    setInstitutions(
      response.data?.data || []
    );

    console.log(
      "INSTITUTIONS:",
      response.data?.data
    );

  } catch (error) {
    console.error(
      "FAILED TO FETCH INSTITUTIONS:",
      error
    );

    window.alert(
      error.response?.data?.message ||
        "Failed to load institutions."
    );

  } finally {
    setInstitutionLoading(false);
  }
};


const openAssignmentPopup = (
  template
) => {
  setSelectedTemplate(template);
  setSelectedInstitution("");
  setAssignmentPopupOpen(true);

  fetchInstitutions();
};


const closeAssignmentPopup = () => {
  setAssignmentPopupOpen(false);
  setSelectedTemplate(null);
  setSelectedInstitution("");
};

const handleAssignTemplate = async () => {

  if (!selectedTemplate?._id) {
    toast.error("No template selected.");
    return;
  }

  if (!selectedInstitution) {
    toast.error("Please select an institution.");
    return;
  }

  try {

    setAssigning(true);

    const response =
      await API.post(
        "/id-card/template-assignments",
        {
          templateId:
            selectedTemplate._id,

          institutionId:
            selectedInstitution,
        }
      );

    const newAssignment =
      response.data?.data;

    if (!newAssignment) {
      throw new Error(
        "Assignment was created but no assignment data was returned."
      );
    }

    setAssignments(
      (currentAssignments) => ({
        ...currentAssignments,

        [selectedTemplate._id]: [
          ...(currentAssignments[
            selectedTemplate._id
          ] || []),

          newAssignment,
        ],
      })
    );

    toast.success(
      "ID card template assigned successfully."
    );

    closeAssignmentPopup();

  } catch (error) {

    console.error(
      "FAILED TO ASSIGN ID CARD TEMPLATE:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to assign ID card template."
    );

  } finally {

    setAssigning(false);

  }
};


const handleUnassignTemplate = async (
  institutionId,
  templateId
) => {

  if (!institutionId) {
    toast.error(
      "No institution selected."
    );
    return;
  }

  try {

    await API.patch(
      `/id-card/template-assignments/institution/${institutionId}/unassign`
    );

    setAssignments(
      (currentAssignments) => ({
        ...currentAssignments,
        [templateId]:
          (
            currentAssignments[
              templateId
            ] || []
          ).filter(
            (assignment) =>
              assignment.institutionId?._id !==
              institutionId
          ),
      })
    );

    toast.success(
      "ID card template unassigned successfully."
    );

  } catch (error) {

    console.error(
      "FAILED TO UNASSIGN ID CARD TEMPLATE:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to unassign ID card template."
    );
  }
};

const handleDeleteTemplate = async (
  templateId
) => {
  const confirmed =
    window.confirm(
      "Are you sure you want to delete this ID card template?"
    );

  if (!confirmed) {
    return;
  }

  try {
    await API.delete(
      `/id-card/templates/${templateId}`
    );

    setTemplates(
      (currentTemplates) =>
        currentTemplates.filter(
          (template) =>
            template._id !== templateId
        )
    );

    window.alert(
      "ID card template deleted successfully."
    );

  } catch (error) {
    console.error(
      "FAILED TO DELETE ID CARD TEMPLATE:",
      error
    );

    window.alert(
      error.response?.data?.message ||
        "Failed to delete ID card template."
    );
  }
};


const handlePublishTemplate = async (
  templateId
) => {
  try {
    const response =
      await API.patch(
        `/id-card/templates/${templateId}/publish`
      );

    const updatedTemplate =
      response.data?.template;

    setTemplates(
      (currentTemplates) =>
        currentTemplates.map(
          (template) =>
            template._id === templateId
              ? {
                  ...template,
                  ...updatedTemplate,
                }
              : template
        )
    );

    window.alert(
      "ID card template published successfully."
    );

  } catch (error) {
    console.error(
      "FAILED TO PUBLISH ID CARD TEMPLATE:",
      error
    );

    window.alert(
      error.response?.data?.message ||
        "Failed to publish ID card template."
    );
  }
};


const handleUnpublishTemplate = async (
  templateId
) => {
  try {
    const response =
      await API.patch(
        `/id-card/templates/${templateId}/unpublish`
      );

    const updatedTemplate =
      response.data?.template;

    setTemplates(
      (currentTemplates) =>
        currentTemplates.map(
          (template) =>
            template._id === templateId
              ? {
                  ...template,
                  ...updatedTemplate,
                }
              : template
        )
    );

    window.alert(
      "ID card template unpublished successfully."
    );

  } catch (error) {
    console.error(
      "FAILED TO UNPUBLISH ID CARD TEMPLATE:",
      error
    );

    window.alert(
      error.response?.data?.message ||
        "Failed to unpublish ID card template."
    );
  }
};



useEffect(() => {
  const loadTemplatesAndAssignments =
    async () => {

      try {
        setLoading(true);
        setError("");

        const response =
          await API.get(
            "/id-card/templates"
          );

        const fetchedTemplates =
          response.data?.templates || [];

        setTemplates(
          fetchedTemplates
        );

        const assignmentResults =
          await Promise.all(
            fetchedTemplates.map(
              async (template) => {

                const assignment =
                  await fetchTemplateAssignment(
                    template._id
                  );

                return {
                  templateId:
                    template._id,

                  assignment,
                };
              }
            )
          );

const assignmentMap = {};

assignmentResults.forEach(
  ({
    templateId,
    assignment,
  }) => {

    assignmentMap[
      templateId
    ] = Array.isArray(assignment)
      ? assignment
      : [];

  }
);

        setAssignments(
          assignmentMap
        );

      } catch (error) {

        console.error(
          "FAILED TO LOAD ID CARD TEMPLATES:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load ID card templates."
        );

      } finally {
        setLoading(false);
      }
    };

  loadTemplatesAndAssignments();
}, []);
  return (
    <div className="id_card_templates_page">

      {/* ============================================================
          HEADER
      ============================================================ */}


      {/* assign template to int  */}
      

      <div className="id_card_templates_header">

        <div>
          <h1>
            ID Card Templates
          </h1>

          <p>
            Create and manage institutional ID card templates.
          </p>
        </div>

<button
  type="button"
  className="id_card_create_template_btn"
  onClick={() =>
    window.location.href =
      "/office_assistant/IDCardDesigner"
  }
>
  + Create Template
</button>

      </div>


      {/* ============================================================
          TEMPLATE CONTENT
      ============================================================ */}

<div className="id_card_templates_content">

  {loading && (
    <div className="id_card_templates_empty">
      <h3>
        Loading templates...
      </h3>
    </div>
  )}

  {!loading && error && (
    <div className="id_card_templates_empty">
      <h3>
        Unable to load templates
      </h3>

      <p>
        {error}
      </p>
    </div>
  )}

  {!loading &&
    !error &&
    templates.length === 0 && (
      <div className="id_card_templates_empty">

        <h3>
          No templates found
        </h3>

        <p>
          Create your first ID card template.
        </p>

      </div>
    )}

  {!loading &&
    !error &&
    templates.length > 0 && (
      <div className="id_card_templates_grid">

        {templates.map((template) => (
<div
  key={template._id}
  className="id_card_template_card"
>

  <h3>
    {template.name}
  </h3>

  <p>
    {template.description ||
      "No description"}
  </p>

  <span>
    {template.status}
  </span>

  <span>
    Version {template.version}
  </span>

{template.status === "published" && (
  <div className="id_card_template_assignment_status">

    {assignments[template._id]?.length > 0 ? (
      <>
        <strong>
          Assigned Institutions (
          {assignments[template._id].length}
          )
        </strong>

        <div className="id_card_assigned_institutions">

          {assignments[template._id].map(
            (assignment) => {

              const institution =
                assignment.institutionId;

              return (
                <div
                  key={assignment._id}
                  className="id_card_assigned_institution"
                >

                  <div>
                    <span>
                      {institution?.institutionName}
                    </span>

                    <small>
                      {institution?.institutionCode}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleUnassignTemplate(
                        institution?._id,
                        template._id
                      )
                    }
                  >
                    Unassign
                  </button>

                </div>
              );
            }
          )}

        </div>
      </>
    ) : (
      <span>
        Not Assigned
      </span>
    )}

  </div>
)}

<div className="id_card_template_actions">

  <button
    type="button"
    onClick={() =>
      window.location.href =
        `/office_assistant/IDCardDesigner/${template._id}`
    }
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() =>
      handleDeleteTemplate(
        template._id
      )
    }
  >
    Delete
  </button>

</div>

{template.status === "published" ? (
  <button
    type="button"
    onClick={() =>
      handleUnpublishTemplate(
        template._id
      )
    }
  >
    Unpublish
  </button>
) : (
  <button
    type="button"
    onClick={() =>
      handlePublishTemplate(
        template._id
      )
    }
  >
    Publish
  </button>
)}

{template.status === "published" && (
  <button
    type="button"
    onClick={() =>
      openAssignmentPopup(template)
    }
  >
    Assign to Institution
  </button>
)}
</div>
        ))}

      </div>
    )}

</div>

{assignmentPopupOpen && (
  <div className="id_card_assignment_overlay">

    <div className="id_card_assignment_popup">

      <div className="id_card_assignment_header">

        <div>
          <h2>
            Assign ID Card Template
          </h2>

          <p>
            Select an institution for this template.
          </p>
        </div>

        <button
          type="button"
          onClick={closeAssignmentPopup}
        >
          ×
        </button>

      </div>


      <div className="id_card_assignment_body">

        {/* TEMPLATE */}

        <div className="id_card_assignment_section">

          <h3>
            Selected Template
          </h3>

          <div className="id_card_assignment_template">

            <strong>
              {selectedTemplate?.name}
            </strong>

            <span>
              Version {selectedTemplate?.version}
            </span>

          </div>

        </div>


        {/* INSTITUTION */}

        <div className="id_card_assignment_section">

          <h3>
            Institution
          </h3>

          {institutionLoading ? (
            <p>
              Loading institutions...
            </p>
          ) : (
            <select
              value={selectedInstitution}
              onChange={(e) =>
                setSelectedInstitution(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Institution
              </option>

{institutions.map(
  (institution) => {

    const alreadyAssigned =
      assignments[
        selectedTemplate?._id
      ]?.some(
        (assignment) =>
          assignment.institutionId?._id ===
          institution._id
      );

    return (
      <option
        key={institution._id}
        value={institution._id}
        disabled={alreadyAssigned}
      >
        {institution.institutionName}
        {alreadyAssigned
          ? " — Already Assigned"
          : ""}
      </option>
    );

  }
)}

            </select>
          )}

        </div>


        {/* SELECTED INSTITUTION DETAILS */}

        {selectedInstitution && (
          <div className="id_card_assignment_institution_details">

            {(() => {

              const institution =
                institutions.find(
                  (item) =>
                    item._id ===
                    selectedInstitution
                );

              if (!institution) {
                return null;
              }

              return (
                <>
                  <h3>
                    Institution Details
                  </h3>

                  <p>
                    <strong>
                      Name:
                    </strong>{" "}
                    {institution.institutionName}
                  </p>

                  <p>
                    <strong>
                      Code:
                    </strong>{" "}
                    {institution.institutionCode}
                  </p>

                  <p>
                    <strong>
                      Departments:
                    </strong>{" "}
                    {institution.departments?.length ||
                      0}
                  </p>
                </>
              );

            })()}

          </div>
        )}

      </div>


      <div className="id_card_assignment_footer">

        <button
          type="button"
          onClick={closeAssignmentPopup}
        >
          Cancel
        </button>

<button
  type="button"
  disabled={
    !selectedInstitution ||
    assigning
  }
  onClick={handleAssignTemplate}
>
  {assigning
    ? "Assigning..."
    : "Assign Template"}
</button>

      </div>

    </div>

  </div>
)}

    </div>
  );
};

export default IDCardTemplates;