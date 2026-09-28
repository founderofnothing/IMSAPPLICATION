import React, {
  useEffect,
  useState,
} from "react";
import API from "../../../../api/axios";
import { toast } from "react-toastify";

const SubjectRecycleBin = () => {

  // ==================== STATE ====================

  const [
    deletedSubjects,
    setDeletedSubjects,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==================== FETCH DELETED SUBJECTS ====================

const fetchDeletedSubjects =
  async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          "/subjects/deleted"
        );

      setDeletedSubjects(
        response.data.data || []
      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch deleted subjects."

      );

    } finally {

      setLoading(false);

    }

};

// ==================== RESTORE SUBJECT ====================

const handleRestoreSubject = async (
  subjectId
) => {

  const confirmRestore =
    window.confirm(
      "Restore this subject?"
    );

  if (!confirmRestore) return;

  try {

    await API.patch(
      `/subjects/restore/${subjectId}`
    );

    toast.success(
      "Subject restored successfully."
    );

    fetchDeletedSubjects();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to restore subject."

    );

  }

};

// ==================== PERMANENT DELETE SUBJECT ====================

const handlePermanentDelete = async (
  subjectId
) => {

  const confirmDelete =
    window.confirm(

      "This subject will be permanently deleted.\n\nThis action cannot be undone."

    );

  if (!confirmDelete) return;

  try {

    await API.delete(
      `/subjects/permanent/${subjectId}`
    );

    toast.success(
      "Subject permanently deleted."
    );

    fetchDeletedSubjects();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to permanently delete subject."

    );

  }

};

  // ==================== INITIAL LOAD ====================

  useEffect(() => {

    fetchDeletedSubjects();

  }, []);

  // ==================== UI ====================

  return (

    <div className="subject-recycle-bin">

      {/* ==================== HEADER ==================== */}

      <div className="page-header">

        <h2>

          Subject Recycle Bin

        </h2>

        <p>

          Restore or permanently delete
          removed subjects.

        </p>

      </div>

      {/* ==================== TABLE ==================== */}

      {

        loading ?

        (

          <h4>

            Loading...

          </h4>

        )

        :

        deletedSubjects.length === 0 ?

        (

          <h4>

            No deleted subjects found.

          </h4>

        )

        :

        (

          <table>

            <thead>

              <tr>

                <th>

                  #

                </th>

                <th>

                  Programme

                </th>

                <th>

                  Year

                </th>

                <th>

                  Semester

                </th>

                <th>

                  Subject Code

                </th>

                <th>

                  Subject Name

                </th>

                <th>

                  Subject Type

                </th>

                <th>

                  Deleted On

                </th>

                <th>

                  Action

                </th>

              </tr>

            </thead>

            <tbody>

              {

                deletedSubjects.map(

                  (

                    subject,

                    index

                  ) => (

                    <tr
                      key={subject._id}
                    >

                      <td>

                        {index + 1}

                      </td>

                      <td>

                        {

                          subject
                          .programmeId
                          ?.programmeName

                        }

                      </td>

                      <td>

                        {

                          subject
                          .studyYear

                        }

                      </td>

                      <td>

                        {

                          subject
                          .semesterNumber

                        }

                      </td>

                      <td>

                        {

                          subject
                          .subjectCode

                        }

                      </td>

                      <td>

                        {

                          subject
                          .subjectName

                        }

                      </td>

                      <td>

                        {

                          subject
                          .subjectType

                        }

                      </td>

                      <td>

                        {

                          new Date(

                            subject.deletedAt

                          ).toLocaleDateString()

                        }

                      </td>

                  <td>

<button

onClick={() =>

handleRestoreSubject(
  subject._id
)

}

>

Restore

</button>

<button

onClick={() =>

handlePermanentDelete(
  subject._id
)

}

>

Delete Forever

</button>

</td>

                    </tr>

                  )

                )

              }

            </tbody>

          </table>

        )

      }

    </div>

  );

};

export default SubjectRecycleBin;