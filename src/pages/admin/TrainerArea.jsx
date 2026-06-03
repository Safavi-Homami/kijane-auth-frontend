import { useEffect, useState } from "react";
import AddCourseForm from "../AddCourseForm";
import CreateAuthorPage from "../trainer/CreateAuthorPage";
import Modal from "../../components/Modal";
import api from "../../api";

export default function TrainerArea() {
  const [authors, setAuthors] = useState([]);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  useEffect(() => {
    api.get("/authors/my").then((res) => setAuthors(res.data));
  }, []);

  return (
    <div>
      {/* Buttons */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowCourseModal(true)}
        >
          + Neuer Kurs
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setShowAuthorModal(true)}
        >
          + Neuer Autor
        </button>
      </div>

      {/* Modal: Kurs */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
      >
        <AddCourseForm
          authors={authors}
          onClose={() => setShowCourseModal(false)}  // ✅ WICHTIG
        />
      </Modal>

      {/* Modal: Autor */}
      <Modal
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
      >
        <CreateAuthorPage
          onClose={() => setShowAuthorModal(false)} // ✅ WICHTIG
        />
      </Modal>
    </div>
  );
}