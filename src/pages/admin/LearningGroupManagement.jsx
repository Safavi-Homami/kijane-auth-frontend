import { useEffect, useMemo, useState } from "react";
import api, { adminApi, learningGroupApi } from "../../api";
import "./LearningGroupManagement.css";

const SELECTED_GROUP_STORAGE_KEY = "clavisimo.selectedLearningGroupId";

export default function LearningGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const [members, setMembers] = useState([]);
  const [courseAccesses, setCourseAccesses] = useState([]);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDescription, setEditGroupDescription] = useState("");

  const [groupSearch, setGroupSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
  };

  const selectedGroup = useMemo(
    () => groups.find((g) => String(g.id) === String(selectedGroupId)),
    [groups, selectedGroupId]
  );

  const selectedGroupName = selectedGroup?.name || "";

  const selectedGroupIsActive = selectedGroup?.active === true;

  const activeMembers = useMemo(() => {
    return members.filter((member) => member.active === true);
  }, [members]);

  const activeCourseAccesses = useMemo(() => {
    return courseAccesses.filter((access) => access.active === true);
  }, [courseAccesses]);

  const activeMemberUserIds = useMemo(() => {
    return new Set(activeMembers.map((member) => Number(member.userId)));
  }, [activeMembers]);

  const activeCourseIds = useMemo(() => {
    return new Set(
      activeCourseAccesses.map((access) => Number(access.courseId))
    );
  }, [activeCourseAccesses]);

  const activeMemberLabels = useMemo(() => {
    return activeMembers.map((member) => {
      if (member.fullName && member.username) {
        return `${member.fullName} (${member.username})`;
      }

      return member.fullName || member.username || `User-ID: ${member.userId}`;
    });
  }, [activeMembers]);

  const activeCourseTitles = useMemo(() => {
    return activeCourseAccesses.map((access) => {
      const courseFromList = courses.find(
        (course) => Number(course.id) === Number(access.courseId)
      );

      return (
        access.courseTitle ||
        courseFromList?.title ||
        `Kurs-ID: ${access.courseId}`
      );
    });
  }, [activeCourseAccesses, courses]);

  const availableUsers = useMemo(() => {
    return users.filter((user) => {
      if (!user?.id) return false;

      // Aktive Mitglieder nicht erneut anbieten.
      // Inaktive Mitglieder bleiben auswählbar, damit man sie reaktivieren kann.
      return !activeMemberUserIds.has(Number(user.id));
    });
  }, [users, activeMemberUserIds]);

  const availableCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!course?.id) return false;

      // Aktive Gruppen-Kursfreigaben nicht erneut anbieten.
      // Inaktive Freigaben bleiben auswählbar, damit man sie reaktivieren kann.
      return !activeCourseIds.has(Number(course.id));
    });
  }, [courses, activeCourseIds]);

  const filteredGroups = useMemo(() => {
    const term = normalizeText(groupSearch);

    if (!term) return groups;

    return groups.filter((group) => {
      const label = `${group.name || ""} ${group.description || ""} ${
        group.id || ""
      }`;

      return (
        normalizeText(label).includes(term) ||
        String(group.id) === String(selectedGroupId)
      );
    });
  }, [groups, groupSearch, selectedGroupId]);

  const filteredAvailableUsers = useMemo(() => {
    const term = normalizeText(userSearch);

    if (!term) return availableUsers;

    return availableUsers.filter((user) => {
      const label = `${user.fullName || ""} ${user.username || ""} ${
        user.email || ""
      } ${user.id || ""}`;

      return normalizeText(label).includes(term);
    });
  }, [availableUsers, userSearch]);

  const filteredAvailableCourses = useMemo(() => {
    const term = normalizeText(courseSearch);

    if (!term) return availableCourses;

    return availableCourses.filter((course) => {
      const label = `${course.title || ""} ${course.id || ""}`;

      return normalizeText(label).includes(term);
    });
  }, [availableCourses, courseSearch]);

  const hasGroupEditChanges = useMemo(() => {
    if (!selectedGroup) return false;

    return (
      editGroupName.trim() !== String(selectedGroup.name || "").trim() ||
      editGroupDescription.trim() !==
        String(selectedGroup.description || "").trim()
    );
  }, [selectedGroup, editGroupName, editGroupDescription]);

  const groupNameExists = (name, ignoreGroupId = "") => {
    const normalizedName = normalizeText(name);

    if (!normalizedName) return false;

    return groups.some((group) => {
      return (
        normalizeText(group.name) === normalizedName &&
        String(group.id) !== String(ignoreGroupId)
      );
    });
  };

  const extractErrorMessage = (err, fallback) => {
    const payload = err?.response?.data;

    let rawMessage = "";

    if (typeof payload === "string") {
      rawMessage = payload;
    } else {
      rawMessage = payload?.message || payload?.error || "";
    }

    const normalizedMessage = normalizeText(rawMessage);

    if (
      normalizedMessage.includes("exist") ||
      normalizedMessage.includes("duplicate") ||
      normalizedMessage.includes("unique") ||
      normalizedMessage.includes("already")
    ) {
      return "Eine Gruppe mit diesem Namen existiert bereits. Bitte wähle die vorhandene Gruppe aus oder verwende einen eindeutigen Namen.";
    }

    return String(rawMessage || fallback);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("de-DE");
  };

  const formatList = (items) => {
    if (!items || items.length === 0) return "-";
    return items.join(", ");
  };

  const resolveNextGroupId = (loadedGroups, preferredGroupId = "") => {
    if (!loadedGroups || loadedGroups.length === 0) {
      return "";
    }

    const ids = new Set(loadedGroups.map((group) => String(group.id)));

    if (preferredGroupId && ids.has(String(preferredGroupId))) {
      return String(preferredGroupId);
    }

    const storedGroupId = sessionStorage.getItem(SELECTED_GROUP_STORAGE_KEY);

    if (storedGroupId && ids.has(String(storedGroupId))) {
      return String(storedGroupId);
    }

    const firstActiveGroup = loadedGroups.find((group) => group.active === true);

    if (firstActiveGroup?.id) {
      return String(firstActiveGroup.id);
    }

    return String(loadedGroups[0].id);
  };

  const loadInitialData = async (preferredGroupId = "") => {
    setLoading(true);
    setError("");

    try {
      const [groupsData, coursesRes, usersRes] = await Promise.all([
        learningGroupApi.listGroups(),
        api.get("/courses"),
        adminApi.listUsers({ q: "", role: "" }),
      ]);

      const loadedGroups = groupsData || [];
      const loadedCourses = coursesRes.data || [];

      setGroups(loadedGroups);
      setCourses(loadedCourses);

      if (Array.isArray(usersRes)) {
        setUsers(usersRes);
      } else {
        setUsers(usersRes?.content || []);
      }

      const nextGroupId = resolveNextGroupId(loadedGroups, preferredGroupId);

      if (nextGroupId) {
        sessionStorage.setItem(SELECTED_GROUP_STORAGE_KEY, nextGroupId);
        setSelectedGroupId(nextGroupId);
      } else {
        sessionStorage.removeItem(SELECTED_GROUP_STORAGE_KEY);
        setSelectedGroupId("");
      }
    } catch (err) {
      console.error("Initialdaten konnten nicht geladen werden");
      setError("Gruppen, Kurse oder Benutzer konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId) => {
    if (!groupId) {
      setMembers([]);
      setCourseAccesses([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [membersData, accessData] = await Promise.all([
        learningGroupApi.listMembers(groupId),
        learningGroupApi.listCourseAccesses(groupId),
      ]);

      setMembers(membersData || []);
      setCourseAccesses(accessData || []);
    } catch (err) {
      console.error("Gruppendaten konnten nicht geladen werden");
      setError("Mitglieder oder Kursfreigaben konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setSelectedUserId("");
    setSelectedCourseId("");

    if (selectedGroupId) {
      sessionStorage.setItem(SELECTED_GROUP_STORAGE_KEY, selectedGroupId);
    } else {
      sessionStorage.removeItem(SELECTED_GROUP_STORAGE_KEY);
    }

    loadGroupDetails(selectedGroupId);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!selectedGroup) {
      setEditGroupName("");
      setEditGroupDescription("");
      return;
    }

    setEditGroupName(selectedGroup.name || "");
    setEditGroupDescription(selectedGroup.description || "");
  }, [selectedGroup?.id, selectedGroup?.name, selectedGroup?.description]);

  const handleSelectGroup = (groupId) => {
  setMessage("");
  setError("");

  // Wichtig:
  // Wenn rechts eine bestehende Gruppe ausgewählt wird,
  // soll links nicht mehr versehentlich ein alter Gruppenname stehen.
  setNewGroupName("");
  setNewGroupDescription("");

  setSelectedUserId("");
  setSelectedCourseId("");
  setUserSearch("");
  setCourseSearch("");

  setSelectedGroupId(groupId);

  if (groupId) {
    sessionStorage.setItem(SELECTED_GROUP_STORAGE_KEY, groupId);
  } else {
    sessionStorage.removeItem(SELECTED_GROUP_STORAGE_KEY);
  }
};

  const handleCreateGroup = async () => {
    setMessage("");
    setError("");

    const name = newGroupName.trim();
    const description = newGroupDescription.trim();

    if (!name) {
      setError("Bitte einen Gruppennamen eingeben.");
      return;
    }

    if (groupNameExists(name)) {
      setError(
        `Die Gruppe "${name}" existiert bereits. Bitte wähle die vorhandene Gruppe rechts aus und bearbeite sie dort.`
      );
      return;
    }

    try {
      const created = await learningGroupApi.createGroup({
        name,
        description,
      });

      const createdGroupId = String(created.id);

      setNewGroupName("");
      setNewGroupDescription("");

      sessionStorage.setItem(SELECTED_GROUP_STORAGE_KEY, createdGroupId);
      setSelectedGroupId(createdGroupId);

      await loadInitialData(createdGroupId);
      await loadGroupDetails(createdGroupId);

      setMessage(`Gruppe "${created.name || name}" wurde erstellt.`);
    } catch (err) {
      console.error("Gruppe konnte nicht erstellt werden");
      setError(extractErrorMessage(err, "Gruppe konnte nicht erstellt werden."));
    }
  };

  const handleUpdateGroup = async () => {
  setMessage("");
  setError("");

  if (!selectedGroupId || !selectedGroup) {
    setError("Bitte zuerst eine Gruppe auswählen.");
    return;
  }

  const name = editGroupName.trim();
  const description = editGroupDescription.trim();

  if (!name) {
    setError("Bitte einen Gruppennamen eingeben.");
    return;
  }

  if (groupNameExists(name, selectedGroupId)) {
    setError(
      `Eine andere Gruppe mit dem Namen "${name}" existiert bereits. Bitte verwende einen eindeutigen Gruppennamen.`
    );
    return;
  }

  try {
    const updated = await learningGroupApi.updateGroup(
      Number(selectedGroupId),
      {
        name,
        description,
      }
    );

    const updatedGroupId = String(updated?.id || selectedGroupId);

    const updatedName = updated?.name ?? name;
    const updatedDescription = updated?.description ?? description;

    // Wichtig: lokale Gruppenliste sofort aktualisieren,
    // damit rechts die neue Beschreibung sofort sichtbar wird.
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        String(group.id) === String(updatedGroupId)
          ? {
              ...group,
              name: updatedName,
              description: updatedDescription,
            }
          : group
      )
    );

    setEditGroupName(updatedName);
    setEditGroupDescription(updatedDescription);

    sessionStorage.setItem(SELECTED_GROUP_STORAGE_KEY, updatedGroupId);
    setSelectedGroupId(updatedGroupId);

    await loadGroupDetails(updatedGroupId);

    setMessage(`Gruppe "${updatedName}" wurde aktualisiert.`);
  } catch (err) {
    console.error("Gruppe konnte nicht aktualisiert werden");
    setError(
      extractErrorMessage(err, "Gruppe konnte nicht aktualisiert werden.")
    );
  }
};

  const handleSetGroupActive = async (active) => {
    setMessage("");
    setError("");

    if (!selectedGroupId) {
      setError("Bitte zuerst eine Gruppe auswählen.");
      return;
    }

    try {
      await learningGroupApi.setGroupActive(selectedGroupId, active);

      await loadInitialData(selectedGroupId);
      await loadGroupDetails(selectedGroupId);

      setMessage(
        active
          ? `Gruppe "${selectedGroup?.name || selectedGroupId}" wurde aktiviert.`
          : `Gruppe "${selectedGroup?.name || selectedGroupId}" wurde deaktiviert.`
      );
    } catch (err) {
      console.error("Gruppenstatus konnte nicht geändert werden");
      setError(
        extractErrorMessage(err, "Gruppenstatus konnte nicht geändert werden.")
      );
    }
  };

  const handleAddMember = async () => {
    setMessage("");
    setError("");

    if (!selectedGroupId || !selectedUserId) {
      setError("Bitte Gruppe und Benutzer auswählen.");
      return;
    }

    const selectedUser = users.find(
      (user) => String(user.id) === String(selectedUserId)
    );

    const userLabel =
      selectedUser?.fullName ||
      selectedUser?.username ||
      `User-ID: ${selectedUserId}`;

    try {
      await learningGroupApi.addMember(
        Number(selectedGroupId),
        Number(selectedUserId)
      );

      const courseInfo =
        activeCourseTitles.length > 0
          ? ` Aktive Kursfreigaben dieser Gruppe: ${formatList(
              activeCourseTitles
            )}.`
          : " Für diese Gruppe gibt es aktuell noch keine aktive Kursfreigabe.";

      setSelectedUserId("");
      setUserSearch("");

      await loadGroupDetails(selectedGroupId);

      setMessage(
        `Benutzer "${userLabel}" wurde zur Gruppe "${
          selectedGroup?.name || selectedGroupId
        }" hinzugefügt oder aktiviert.${courseInfo}`
      );
    } catch (err) {
      console.error("Benutzer konnte nicht hinzugefügt werden", err);
      setError(
        extractErrorMessage(
          err,
          "Benutzer konnte nicht zur Gruppe hinzugefügt werden."
        )
      );
    }
  };

  const handleSetMemberActive = async (memberId, active) => {
    setMessage("");
    setError("");

    const member = members.find((item) => Number(item.id) === Number(memberId));
    const memberLabel =
      member?.fullName || member?.username || `Mitglied-ID: ${memberId}`;

    try {
      await learningGroupApi.setMemberActive(memberId, active);

      await loadGroupDetails(selectedGroupId);

      setMessage(
        active
          ? `Mitglied "${memberLabel}" wurde aktiviert.`
          : `Mitglied "${memberLabel}" wurde deaktiviert.`
      );
    } catch (err) {
      console.error("Mitgliedstatus konnte nicht geändert werden", err);
      setError(
        extractErrorMessage(err, "Mitgliedstatus konnte nicht geändert werden.")
      );
    }
  };

  const handleGrantCourseToGroup = async () => {
    setMessage("");
    setError("");

    if (!selectedGroupId || !selectedCourseId) {
      setError("Bitte Gruppe und Kurs auswählen.");
      return;
    }

    const selectedCourse = courses.find(
      (course) => String(course.id) === String(selectedCourseId)
    );

    const courseTitle =
      selectedCourse?.title || `Kurs-ID: ${selectedCourseId}`;

    const groupName = selectedGroup?.name || `Gruppe-ID: ${selectedGroupId}`;

    try {
      await learningGroupApi.grantCourseToGroup(
        Number(selectedGroupId),
        Number(selectedCourseId)
      );

      const memberInfo =
        activeMemberLabels.length > 0
          ? ` Aktive Gruppenmitglieder: ${formatList(activeMemberLabels)}.`
          : " Diese Gruppe hat aktuell keine aktiven Mitglieder.";

      setSelectedCourseId("");
      setCourseSearch("");

      await loadGroupDetails(selectedGroupId);

      setMessage(
        `Kurs "${courseTitle}" wurde für Gruppe "${groupName}" freigegeben oder aktiviert.${memberInfo}`
      );
    } catch (err) {
      console.error("Kurs konnte nicht freigegeben werden", err);
      setError(
        extractErrorMessage(
          err,
          "Kurs konnte für diese Gruppe nicht freigegeben werden."
        )
      );
    }
  };

  const handleSetCourseAccessActive = async (accessId, active) => {
    setMessage("");
    setError("");

    const access = courseAccesses.find(
      (item) => Number(item.id) === Number(accessId)
    );

    const courseTitle =
      access?.courseTitle ||
      courses.find((course) => Number(course.id) === Number(access?.courseId))
        ?.title ||
      `Freigabe-ID: ${accessId}`;

    try {
      await learningGroupApi.setCourseAccessActive(accessId, active);

      await loadGroupDetails(selectedGroupId);

      setMessage(
        active
          ? `Gruppen-Kursfreigabe für "${courseTitle}" wurde aktiviert.`
          : `Gruppen-Kursfreigabe für "${courseTitle}" wurde deaktiviert.`
      );
    } catch (err) {
      console.error("Gruppen-Kursfreigabe konnte nicht geändert werden", err);
      setError(
        extractErrorMessage(
          err,
          "Gruppen-Kursfreigabe konnte nicht geändert werden."
        )
      );
    }
  };

  return (
    <div className="learning-group-page">
      <div className="learning-group-header">
        <p className="learning-group-eyebrow">Admin</p>
        <h2>Lerngruppen verwalten</h2>
        <p>
          Erstelle Gruppen, füge Benutzer hinzu und gib Kurse für komplette
          Gruppen frei.
        </p>
      </div>

      {message && <div className="learning-group-success">{message}</div>}
      {error && <div className="learning-group-error">{error}</div>}

      <div className="learning-group-grid">
        <section className="learning-group-card">
          <h3>1. Neue Gruppe erstellen</h3>

          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Gruppenname, z. B. Java Anfänger 2026"
            disabled={loading}
          />

          <textarea
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            placeholder="Beschreibung optional"
            disabled={loading}
          />

          <button
            className="learning-group-primary"
            onClick={handleCreateGroup}
            disabled={loading || !newGroupName.trim()}
          >
            Gruppe erstellen
          </button>

          <p className="learning-group-muted">
            Hinweis: Bestehende Gruppen bitte rechts auswählen und dort
            bearbeiten.
          </p>
        </section>

        <section className="learning-group-card">
          <h3>2. Gruppe auswählen & bearbeiten</h3>

          <input
            type="text"
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            placeholder="Gruppe suchen..."
            disabled={loading}
          />

          <select
            value={selectedGroupId}
            onChange={(e) => handleSelectGroup(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Gruppe auswählen --</option>

            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} {group.active ? "" : "(inaktiv)"}
              </option>
            ))}
          </select>

          {groupSearch && filteredGroups.length === 0 && (
            <p className="learning-group-muted">
              Keine passende Gruppe gefunden.
            </p>
          )}

          {selectedGroup && (
            <div className="learning-group-info">
              <strong>{selectedGroup.name}</strong>
              <span>{selectedGroup.description || "Keine Beschreibung"}</span>

              <span>
                Status: {selectedGroup.active ? "Aktiv" : "Inaktiv"} · ID:{" "}
                {selectedGroup.id}
              </span>

              <span>Erstellt von: {selectedGroup.createdByUsername || "-"}</span>

              <span>
                Aktive Mitglieder: {activeMembers.length} · Aktive Kurse:{" "}
                {activeCourseAccesses.length}
              </span>

              <input
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                placeholder="Gruppenname bearbeiten"
                disabled={loading}
              />

              <textarea
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
                placeholder="Beschreibung bearbeiten"
                disabled={loading}
              />

              <button
                className="learning-group-primary"
                onClick={handleUpdateGroup}
                disabled={
                  loading || !editGroupName.trim() || !hasGroupEditChanges
                }
              >
                Änderungen speichern
              </button>

              <div className="learning-group-actions">
                {selectedGroup.active ? (
                  <button
                    className="learning-group-danger"
                    onClick={() => handleSetGroupActive(false)}
                    disabled={loading}
                  >
                    Gruppe deaktivieren
                  </button>
                ) : (
                  <button
                    className="learning-group-primary"
                    onClick={() => handleSetGroupActive(true)}
                    disabled={loading}
                  >
                    Gruppe aktivieren
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="learning-group-grid">
        <section className="learning-group-card">
          <h3>
        3. Benutzer zur ausgewählten Gruppe hinzufügen
        {selectedGroupName ? `: ${selectedGroupName}` : ""}
        </h3>

          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Benutzer suchen: Name, E-Mail oder ID..."
            disabled={!selectedGroupId || loading}
          />

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={!selectedGroupId || loading}
          >
            <option value="">-- Benutzer auswählen --</option>

            {filteredAvailableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.username} ({user.username})
              </option>
            ))}
          </select>

          {selectedGroupId && userSearch && filteredAvailableUsers.length === 0 && (
            <p className="learning-group-muted">
              Kein passender Benutzer gefunden oder Benutzer ist bereits aktiv in
              dieser Gruppe.
            </p>
          )}

         <button
            className="learning-group-primary"
            onClick={handleAddMember}
            disabled={
                !selectedGroupId ||
                !selectedUserId ||
                loading ||
                !selectedGroupIsActive
            }
            >
            {selectedGroupName
                ? `Benutzer zu "${selectedGroupName}" hinzufügen`
                : "Benutzer hinzufügen"}
            </button>
        </section>

        <section className="learning-group-card">
          <h3>
            4. Kurs für ausgewählte Gruppe freigeben
            {selectedGroupName ? `: ${selectedGroupName}` : ""}
            </h3>

          <input
            type="text"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder="Kurs suchen..."
            disabled={!selectedGroupId || loading}
          />

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={!selectedGroupId || loading}
          >
            <option value="">-- Kurs auswählen --</option>

            {filteredAvailableCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          {selectedGroupName ? (
                <p className="learning-group-muted">
                    Freigabe gilt für die aktuell ausgewählte Gruppe:{" "}
                    <strong>{selectedGroupName}</strong>
                </p>
                ) : (
                <p className="learning-group-muted">
                    Bitte zuerst rechts eine Gruppe auswählen.
                </p>
                )}

          {selectedGroupId &&
            courseSearch &&
            filteredAvailableCourses.length === 0 && (
              <p className="learning-group-muted">
                Kein passender Kurs gefunden oder Kurs ist bereits aktiv für
                diese Gruppe freigegeben.
              </p>
            )}

          <button
            className="learning-group-primary"
            onClick={handleGrantCourseToGroup}
            disabled={
                !selectedGroupId ||
                !selectedCourseId ||
                loading ||
                !selectedGroupIsActive
            }
            >
            {selectedGroupName
                ? `Kurs für "${selectedGroupName}" freigeben`
                : "Kurs für Gruppe freigeben"}
            </button>
        </section>
      </div>

      <section className="learning-group-card learning-group-list">
        <h3>Gruppenmitglieder</h3>

        {!selectedGroupId && (
          <p className="learning-group-muted">
            Bitte zuerst eine Gruppe auswählen.
          </p>
        )}

        {selectedGroupId && loading && (
          <p className="learning-group-muted">Lade Mitglieder…</p>
        )}

        {selectedGroupId && !loading && members.length === 0 && (
          <p className="learning-group-muted">
            Diese Gruppe hat noch keine Mitglieder.
          </p>
        )}

        {selectedGroupId && members.length > 0 && (
          <table className="learning-group-table">
            <thead>
              <tr>
                <th>Benutzer</th>
                <th>Status</th>
                <th>Aktive Kurse dieser Gruppe</th>
                <th>Hinzugefügt von</th>
                <th>Datum</th>
                <th>Aktion</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.fullName || member.username}</strong>
                    <br />
                    <span>{member.username}</span>
                    <br />
                    <span>User-ID: {member.userId}</span>
                  </td>

                  <td>
                    {member.active ? (
                      <span className="badge-active">Aktiv</span>
                    ) : (
                      <span className="badge-inactive">Inaktiv</span>
                    )}
                  </td>

                  <td>
                    {member.active ? (
                      activeCourseTitles.length > 0 ? (
                        <ul className="learning-group-mini-list">
                          {activeCourseTitles.map((title) => (
                            <li key={`${member.id}-${title}`}>{title}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="learning-group-muted">
                          Keine aktive Kursfreigabe
                        </span>
                      )
                    ) : (
                      <span className="learning-group-muted">
                        Mitglied inaktiv
                      </span>
                    )}
                  </td>

                  <td>{member.addedByUsername || "-"}</td>

                  <td>{formatDate(member.addedAt)}</td>

                  <td>
                    {member.active ? (
                      <button
                        className="learning-group-danger"
                        onClick={() => handleSetMemberActive(member.id, false)}
                        disabled={loading}
                      >
                        Deaktivieren
                      </button>
                    ) : (
                      <button
                        className="learning-group-primary small"
                        onClick={() => handleSetMemberActive(member.id, true)}
                        disabled={loading}
                      >
                        Aktivieren
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="learning-group-card learning-group-list">
        <h3>Kursfreigaben dieser Gruppe</h3>

        {!selectedGroupId && (
          <p className="learning-group-muted">
            Bitte zuerst eine Gruppe auswählen.
          </p>
        )}

        {selectedGroupId && loading && (
          <p className="learning-group-muted">Lade Kursfreigaben…</p>
        )}

        {selectedGroupId && !loading && courseAccesses.length === 0 && (
          <p className="learning-group-muted">
            Für diese Gruppe gibt es noch keine Kursfreigaben.
          </p>
        )}

        {selectedGroupId && courseAccesses.length > 0 && (
          <table className="learning-group-table">
            <thead>
              <tr>
                <th>Kurs</th>
                <th>Gruppe</th>
                <th>Status</th>
                <th>Aktive Mitglieder</th>
                <th>Freigegeben von</th>
                <th>Datum</th>
                <th>Aktion</th>
              </tr>
            </thead>

            <tbody>
              {courseAccesses.map((access) => (
                <tr key={access.id}>
                  <td>
                    <strong>{access.courseTitle || "-"}</strong>
                    <br />
                    <span>Kurs-ID: {access.courseId}</span>
                  </td>

                  <td>
                    <strong>{access.groupName || selectedGroup?.name || "-"}</strong>
                    <br />
                    <span>Gruppen-ID: {access.groupId || selectedGroupId}</span>
                  </td>

                  <td>
                    {access.active ? (
                      <span className="badge-active">Aktiv</span>
                    ) : (
                      <span className="badge-inactive">Inaktiv</span>
                    )}
                  </td>

                  <td>
                    {access.active ? (
                      activeMemberLabels.length > 0 ? (
                        <ul className="learning-group-mini-list">
                          {activeMemberLabels.map((label) => (
                            <li key={`${access.id}-${label}`}>{label}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="learning-group-muted">
                          Keine aktiven Mitglieder
                        </span>
                      )
                    ) : (
                      <span className="learning-group-muted">
                        Kursfreigabe inaktiv
                      </span>
                    )}
                  </td>

                  <td>{access.grantedByUsername || "-"}</td>

                  <td>{formatDate(access.grantedAt)}</td>

                  <td>
                    {access.active ? (
                      <button
                        className="learning-group-danger"
                        onClick={() =>
                          handleSetCourseAccessActive(access.id, false)
                        }
                        disabled={loading}
                      >
                        Deaktivieren
                      </button>
                    ) : (
                      <button
                        className="learning-group-primary small"
                        onClick={() =>
                          handleSetCourseAccessActive(access.id, true)
                        }
                        disabled={loading}
                      >
                        Aktivieren
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="learning-group-note">
        Hinweis: Eine Gruppenfreigabe wirkt nur sauber, wenn die Gruppe aktiv
        ist, das Mitglied aktiv ist und die Kursfreigabe aktiv ist.
      </div>
    </div>
  );
}