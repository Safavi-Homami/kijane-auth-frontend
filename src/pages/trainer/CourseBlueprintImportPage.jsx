import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../CourseStyles.css";
import { buildCourseBlueprintAiSpec } from "../../data/courseBlueprintAiSpec";
import {
  analyzeBlueprintJson,
  cleanBlueprintJsonText,
  repairBlueprintJsonText,
  getSectionNumberError,
  parsePositiveInteger,
  hasOwnField,
  buildFriendlyJsonParseError,
} from "../../utils/blueprintValidation";

const BLUEPRINT_EXAMPLES = [
  {
    key: "java-no-final",
    label: "Java Test ohne Abschlussprüfung",
    path: "/blueprints/examples/java-blueprint-test-no-final-exam.json",
  },
];

const AI_LANGUAGES = [
  "Deutsch",
  "Englisch",
  "Arabisch",
  "Persisch",
  "Französisch",
  "Spanisch",
];

const AI_DIFFICULTY_LEVELS = [
  "Einsteiger",
  "Fortgeschritten",
  "Praxisorientiert",
  "Expertenniveau",
];

const DEFAULT_AI_FORM = {
  topic: "",
  courseTitle: "",
  targetAudience: "Einsteiger",
  language: "Deutsch",
  difficulty: "Einsteiger",
  minSections: "3",
  maxSections: "6",
  chapterQuizEnabled: true,
  extraNotes: "",
};

function CourseBlueprintImportPage() {
  const navigate = useNavigate();

  const workflowStartRef = useRef(null);
  const jsonTextareaRef = useRef(null);
  const jsonLineNumbersRef = useRef(null);
  const generatedPromptRef = useRef(null);
  const importActionRef = useRef(null);
  const importResultRef = useRef(null);
  const aiPromptSectionRef = useRef(null);
  const promptCopyMessageRef = useRef(null);
  const importInProgressRef = useRef(false);

  const [jsonCursorInfo, setJsonCursorInfo] = useState({
    line: 1,
    column: 1,
  });

  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [exampleLoading, setExampleLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [repairMessage, setRepairMessage] = useState("");
  const [scrollToImportAction, setScrollToImportAction] = useState(false);
  const [scrollToImportResult, setScrollToImportResult] = useState(false);
  const [isPageNearTop, setIsPageNearTop] = useState(true);

  const [aiForm, setAiForm] = useState(DEFAULT_AI_FORM);

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [lastPromptSignature, setLastPromptSignature] = useState("");

  const blueprintAnalysis = useMemo(
    () => analyzeBlueprintJson(jsonText),
    [jsonText]
  );

  const jsonLineNumbers = useMemo(() => {
    const lineCount = Math.max(1, jsonText.split("\n").length);

    return Array.from({ length: lineCount }, (_, index) => index + 1).join("\n");
  }, [jsonText]);

  const currentPromptSignature = useMemo(() => {
    return JSON.stringify(aiForm);
  }, [aiForm]);

  const promptOutdated = Boolean(
    generatedPrompt &&
      lastPromptSignature &&
      lastPromptSignature !== currentPromptSignature
  );

  const sectionNumberError = useMemo(() => {
    return getSectionNumberError(aiForm);
  }, [aiForm.minSections, aiForm.maxSections]);

  const importDisabled =
    loading ||
    Boolean(result) ||
    !jsonText.trim() ||
    blueprintAnalysis?.validJson === false ||
    (blueprintAnalysis?.errors?.length || 0) > 0;

  const workflowCurrentStep = useMemo(() => {
    if (result) return 6;

    if (
      jsonText.trim() &&
      blueprintAnalysis?.validJson === true &&
      (blueprintAnalysis?.errors?.length || 0) === 0
    ) {
      return 5;
    }

    if (jsonText.trim()) return 4;

    if (generatedPrompt && !promptOutdated) return 3;

    if (aiForm.topic.trim()) return 2;

    return 1;
  }, [
    result,
    jsonText,
    blueprintAnalysis,
    generatedPrompt,
    promptOutdated,
    aiForm.topic,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      workflowStartRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!scrollToImportAction || !jsonText.trim()) return;

    const timer = setTimeout(() => {
      importActionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setScrollToImportAction(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [scrollToImportAction, jsonText]);

  useEffect(() => {
    if (!scrollToImportResult || !result) return;

    const timer = setTimeout(() => {
      importResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setScrollToImportResult(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [scrollToImportResult, result]);

  useEffect(() => {
    const updateFloatingButtonDirection = () => {
      setIsPageNearTop(window.scrollY < 180);
    };

    updateFloatingButtonDirection();
    window.addEventListener("scroll", updateFloatingButtonDirection, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateFloatingButtonDirection);
    };
  }, []);

  const workflowSteps = [
    {
      number: 1,
      title: "Kursdaten",
      text: "Thema und Struktur eingeben",
    },
    {
      number: 2,
      title: "Prompt",
      text: "KI-Prompt erstellen",
    },
    {
      number: 3,
      title: "Kopieren",
      text: "Prompt in KI-Tool verwenden",
    },
    {
      number: 4,
      title: "JSON",
      text: "KI-JSON unten einfügen",
    },
    {
      number: 5,
      title: "Prüfen",
      text: "Blueprint-Vorschau kontrollieren",
    },
    {
      number: 6,
      title: "Import",
      text: "Kurs speichern und öffnen",
    },
  ];

  const updateJsonCursorInfo = (target) => {
    const cursorPosition = target.selectionStart ?? 0;
    const textBeforeCursor = target.value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split("\n");

    setJsonCursorInfo({
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    });
  };

  const handleJsonTextareaChange = (e) => {
    setJsonText(e.target.value);
    setResult(null);
    setError("");
    setRepairMessage("");

    updateJsonCursorInfo(e.target);
  };

  const handleJsonTextareaScroll = () => {
    if (!jsonTextareaRef.current || !jsonLineNumbersRef.current) return;

    jsonLineNumbersRef.current.scrollTop = jsonTextareaRef.current.scrollTop;
  };

  const loadExample = async () => {
    if (jsonText.trim()) {
      const confirmed = window.confirm(
        "Achtung: Der aktuelle Blueprint-JSON-Inhalt wird überschrieben.\n\n" +
          "Wenn du gerade einen KI-Blueprint eingefügt hast, geht dieser Text verloren.\n\n" +
          "Möchtest du wirklich die Beispiel-Datei laden?"
      );

      if (!confirmed) {
        return;
      }
    }

    setResult(null);
    setError("");
    setExampleLoading(true);

    const selectedExample = BLUEPRINT_EXAMPLES[0];

    if (!selectedExample) {
      setError("Keine gültige Beispiel-Datei ausgewählt.");
      setExampleLoading(false);
      return;
    }

    try {
      const response = await fetch(selectedExample.path, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Beispiel-Datei konnte nicht geladen werden.");
      }

      const blueprint = await response.json();

      if (blueprint?.course && hasOwnField(blueprint.course, "finalExam")) {
        delete blueprint.course.finalExam;
      }

      setJsonText(JSON.stringify(blueprint, null, 2));
      setScrollToImportAction(true);
    } catch (err) {
      console.error("Example blueprint loading failed:", err);
      setError(
        `Beispiel-Datei konnte nicht geladen werden. Bitte prüfe, ob diese Datei existiert und gültiges JSON enthält: public${selectedExample.path}`
      );
    } finally {
      setExampleLoading(false);
    }
  };

  const updateAiForm = (field, value) => {
    setAiForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setCopyMessage("");
    setError("");
  };

  const updateAiNumberField = (field, value) => {
    const cleanedValue = String(value ?? "").replace(/\D/g, "");

    setAiForm((prev) => ({
      ...prev,
      [field]: cleanedValue,
    }));

    setCopyMessage("");
    setError("");
  };

  const buildAiPrompt = () => {
    setError("");
    setResult(null);
    setCopyMessage("");

    if (!aiForm.topic.trim()) {
      setError("Bitte zuerst ein Kursthema für den KI-Prompt eingeben.");
      return;
    }

    if (sectionNumberError) {
      setError(sectionNumberError);
      return;
    }

    const minSections = parsePositiveInteger(aiForm.minSections);
    const maxSections = parsePositiveInteger(aiForm.maxSections);

    if (!minSections || !maxSections) {
      setError("Bitte Min. Kapitel und Max. Kapitel korrekt ausfüllen.");
      return;
    }

    const spec = buildCourseBlueprintAiSpec({
      language: aiForm.language,
      minSections,
      maxSections,
      chapterQuizEnabled: aiForm.chapterQuizEnabled,
      finalExamEnabled: false,
    });

    const prompt = `
Du bist ein erfahrener Kursdidaktiker und Software-Trainer.

Erzeuge einen vollständigen Course Blueprint als gültiges JSON für meine Kursplattform.

Wichtig:
- Antworte ausschließlich mit gültigem JSON.
- Keine Markdown-Erklärung.
- Keine Code-Fences.
- Keine Kommentare.
- Kein Text vor oder nach dem JSON.
- Erzeuge KEINE Abschlussprüfung.
- Verwende KEIN course.finalExam.
- Verwende KEIN courseFinalExam innerhalb normaler Resources.
- Verwende KEIN certificateEnabled=true für Kapitelquizze.
- Die Abschlussprüfung wird später manuell durch den Trainer im Kurs erstellt.

Kurswunsch:
- Thema: ${aiForm.topic}
- Gewünschter Kurstitel: ${
      aiForm.courseTitle.trim() || "Bitte einen passenden Titel erzeugen"
    }
- Zielgruppe: ${aiForm.targetAudience}
- Sprache: ${aiForm.language}
- Schwierigkeitsgrad: ${aiForm.difficulty}
- Kapitelanzahl: ${minSections} bis ${maxSections}
- Kapitelquizzes: ${aiForm.chapterQuizEnabled ? "Ja" : "Nein"}
- Abschlussprüfung: Nein. Keine course.finalExam erzeugen. Der Trainer erstellt die Abschlussprüfung später manuell.

Zusätzliche Hinweise:
${aiForm.extraNotes.trim() || "Keine zusätzlichen Hinweise."}

Halte dich exakt an diese Spezifikation:

${spec}
`.trim();

    setGeneratedPrompt(prompt);
    setLastPromptSignature(currentPromptSignature);

    setTimeout(() => {
      generatedPromptRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const copyGeneratedPrompt = async () => {
    if (!generatedPrompt || promptOutdated) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyMessage("Prompt wurde kopiert ✅");
    } catch (err) {
      console.error("Prompt copy failed:", err);
      setCopyMessage("Prompt konnte nicht automatisch kopiert werden.");
    }

    setTimeout(() => {
      promptCopyMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  };

  const applyAutoRepair = (value, showMessage = true) => {
    const repaired = repairBlueprintJsonText(value);

    if (repaired.changed) {
      setJsonText(repaired.text);

      if (showMessage) {
        setRepairMessage(
          `JSON wurde automatisch korrigiert: ${repaired.fixes.join(", ")}.`
        );
      }
    }

    return repaired.text;
  };

  const handleJsonPaste = (e) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text") || "";
    const repaired = repairBlueprintJsonText(pastedText);

    setJsonText(repaired.text);
    setResult(null);
    setError("");
    setScrollToImportAction(true);

    if (repaired.changed) {
      setRepairMessage(
        `JSON wurde automatisch korrigiert: ${repaired.fixes.join(", ")}.`
      );
    } else {
      setRepairMessage("");
    }
  };

  const handleImport = async () => {
    if (importInProgressRef.current || loading || result) {
      return;
    }

    importInProgressRef.current = true;
    setLoading(true);
    setError("");

    const jsonForImport = applyAutoRepair(jsonText, true);

    try {
      if (!jsonForImport.trim()) {
        setError("Bitte zuerst einen Blueprint einfügen.");
        return;
      }

      let parsedBlueprint;

      try {
        parsedBlueprint = JSON.parse(cleanBlueprintJsonText(jsonForImport));

        const analysis = analyzeBlueprintJson(jsonForImport);

        if (analysis?.errors?.length > 0) {
          setError(analysis.errors[0]);
          return;
        }

        if (
          parsedBlueprint?.course &&
          hasOwnField(parsedBlueprint.course, "finalExam")
        ) {
          setError(
            "course.finalExam darf im KI-Blueprint nicht vorhanden sein. Bitte entferne die Abschlussprüfung aus dem JSON."
          );
          return;
        }

        setJsonText(JSON.stringify(parsedBlueprint, null, 2));
      } catch (parseError) {
        const parseErrorDetails = buildFriendlyJsonParseError(
          cleanBlueprintJsonText(jsonForImport),
          parseError
        );

        setError(parseErrorDetails.message);
        return;
      }

      const response = await api.post(
        "/course-blueprints/import",
        parsedBlueprint
      );

      setResult(response.data);
      setScrollToImportResult(true);
    } catch (err) {
      console.error("Blueprint import failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Blueprint konnte nicht importiert werden."
      );
    } finally {
      importInProgressRef.current = false;
      setLoading(false);
    }
  };

  const resetBlueprintWorkflow = () => {
    const confirmed = window.confirm(
      "Möchtest du den aktuellen Blueprint, den generierten Prompt und das Import-Ergebnis wirklich zurücksetzen?\n\n" +
        "Das ist sinnvoll, wenn du einen neuen Kurs-Blueprint vorbereiten möchtest."
    );

    if (!confirmed) return;

    importInProgressRef.current = false;
    setAiForm(DEFAULT_AI_FORM);
    setJsonText("");
    setGeneratedPrompt("");
    setCopyMessage("");
    setLastPromptSignature("");
    setResult(null);
    setError("");
    setRepairMessage("");
    setScrollToImportAction(false);
    setScrollToImportResult(false);
    setJsonCursorInfo({
      line: 1,
      column: 1,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToCourseList = () => {
    const hasPreparedBlueprint = jsonText.trim().length > 0;
    const hasGeneratedPrompt = generatedPrompt.trim().length > 0;

    if ((hasPreparedBlueprint || hasGeneratedPrompt) && !result) {
      const confirmed = window.confirm(
        "Du hast einen Blueprint oder KI-Prompt vorbereitet, aber noch nicht importiert.\n\n" +
          "Möchtest du wirklich zur Kursliste wechseln?"
      );

      if (!confirmed) return;
    }

    navigate("/courses");
  };

  const scrollToPageTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToAiPromptSection = () => {
    aiPromptSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleFloatingNavigation = () => {
    if (isPageNearTop) {
      scrollToAiPromptSection();
      return;
    }

    scrollToPageTop();
  };

  const cardStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #111827 55%, #020617 100%)",
    borderRadius: "22px",
    padding: "30px",
    boxShadow: "0 18px 45px rgba(2, 6, 23, 0.35)",
    marginTop: "28px",
    position: "relative",
    zIndex: 10,
    pointerEvents: "auto",
    color: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  };

  const workflowBoxStyle = {
    marginBottom: "24px",
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  };

  const workflowGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  };

  const getWorkflowItemStyle = (stepNumber) => {
    const isActive = workflowCurrentStep === stepNumber;
    const isDone = workflowCurrentStep > stepNumber;

    return {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px",
      borderRadius: "14px",
      background: isActive
        ? "rgba(13, 110, 253, 0.22)"
        : isDone
        ? "rgba(34, 197, 94, 0.13)"
        : "rgba(255,255,255,0.05)",
      border: isActive
        ? "1px solid rgba(96, 165, 250, 0.55)"
        : isDone
        ? "1px solid rgba(74, 222, 128, 0.35)"
        : "1px solid rgba(148, 163, 184, 0.16)",
      color: "#f8fafc",
    };
  };

  const getWorkflowCircleStyle = (stepNumber) => {
    const isActive = workflowCurrentStep === stepNumber;
    const isDone = workflowCurrentStep > stepNumber;

    return {
      width: "32px",
      height: "32px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontWeight: 800,
      background: isActive ? "#0d6efd" : isDone ? "#16a34a" : "#334155",
      color: "white",
      boxShadow: isActive
        ? "0 0 0 4px rgba(13, 110, 253, 0.18)"
        : "none",
    };
  };

  const buttonRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
    position: "relative",
    zIndex: 20,
    pointerEvents: "auto",
  };

  const buttonBaseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "48px",
    padding: "12px 18px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    position: "relative",
    zIndex: 30,
    pointerEvents: "auto",
  };

  const secondaryButtonStyle = {
    ...buttonBaseStyle,
    border: "1px solid rgba(203, 213, 225, 0.35)",
    background: exampleLoading ? "#334155" : "#e5e7eb",
    color: "#111827",
    cursor: exampleLoading ? "not-allowed" : "pointer",
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    border: "none",
    background: loading || importDisabled ? "#64748b" : "#0d6efd",
    color: "white",
    cursor: loading || importDisabled ? "not-allowed" : "pointer",
    boxShadow:
      loading || importDisabled
        ? "none"
        : "0 10px 22px rgba(13, 110, 253, 0.28)",
  };

  const outlineButtonStyle = {
    ...buttonBaseStyle,
    border: "1px solid rgba(203, 213, 225, 0.45)",
    background: "rgba(255,255,255,0.08)",
    color: "#f8fafc",
  };

  const backToTopButtonStyle = {
    position: "fixed",
    left: "50%",
    bottom: "22px",
    transform: "translateX(-50%)",
    width: "48px",
    height: "48px",
    borderRadius: "999px",
    border: "1px solid rgba(148, 163, 184, 0.45)",
    background: "rgba(100, 116, 139, 0.88)",
    color: "white",
    fontSize: "24px",
    fontWeight: 800,
    cursor: "pointer",
    zIndex: 9999,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const sectionBoxStyle = {
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "24px",
    background: "rgba(255, 255, 255, 0.06)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    background: "white",
    color: "#0f172a",
  };

  const smallLabelStyle = {
    display: "block",
    fontWeight: 700,
    fontSize: "14px",
    marginBottom: "6px",
    color: "#e5e7eb",
  };

  const lightLabelStyle = {
    display: "block",
    fontWeight: 700,
    marginBottom: "8px",
    textAlign: "center",
    color: "#e5e7eb",
  };

  const helperTextStyle = {
    textAlign: "center",
    color: "#cbd5e1",
    marginBottom: "18px",
  };

  const promptTextareaStyle = {
    width: "100%",
    minHeight: "260px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.45)",
    fontFamily: "monospace",
    fontSize: "13px",
    lineHeight: "1.5",
    resize: "vertical",
    background: "#020617",
    color: "#e5e7eb",
  };

  const jsonEditorWrapperStyle = {
    display: "grid",
    gridTemplateColumns: "64px 1fr",
    width: "100%",
    minHeight: "420px",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.45)",
    background: "#020617",
    overflow: "hidden",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
  };

  const jsonLineNumbersStyle = {
    margin: 0,
    padding: "16px 10px",
    fontFamily: "monospace",
    fontSize: "14px",
    lineHeight: "1.5",
    textAlign: "right",
    color: "#64748b",
    background: "#0f172a",
    borderRight: "1px solid rgba(148, 163, 184, 0.25)",
    userSelect: "none",
    overflow: "hidden",
    whiteSpace: "pre",
  };

  const jsonTextareaStyle = {
    width: "100%",
    minHeight: "420px",
    padding: "16px",
    border: "none",
    outline: "none",
    fontFamily: "monospace",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "vertical",
    background: "transparent",
    color: "#e5e7eb",
    whiteSpace: "pre",
    overflow: "auto",
  };

  const promptButtonLabel = generatedPrompt
    ? promptOutdated
      ? "KI-Prompt aktualisieren"
      : "KI-Prompt neu erstellen"
    : "KI-Prompt erstellen";

  const canCopyPrompt = Boolean(generatedPrompt && !promptOutdated);

  return (
    <div className="page-background">
      <button
        type="button"
        onClick={handleFloatingNavigation}
        style={backToTopButtonStyle}
        title={isPageNearTop ? "Zum KI-Prompt" : "Nach oben"}
        aria-label={isPageNearTop ? "Zum KI-Prompt springen" : "Nach oben"}
      >
        {isPageNearTop ? "↓" : "↑"}
      </button>

      <div className="container">
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              onClick={goToCourseList}
              style={{
                ...outlineButtonStyle,
                width: "auto",
                minHeight: "40px",
                padding: "9px 16px",
                fontSize: "14px",
              }}
            >
              ← Zur Kursliste
            </button>
          </div>

          <div ref={workflowStartRef} style={workflowBoxStyle}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "14px",
                textAlign: "center",
                color: "#f8fafc",
                fontSize: "22px",
              }}
            >
              Workflow
            </h2>

            <div style={workflowGridStyle}>
              {workflowSteps.map((step) => (
                <div key={step.number} style={getWorkflowItemStyle(step.number)}>
                  <div style={getWorkflowCircleStyle(step.number)}>
                    {workflowCurrentStep > step.number ? "✓" : step.number}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: "14px" }}>
                      {step.title}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#cbd5e1",
                        marginTop: "2px",
                      }}
                    >
                      {step.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={aiPromptSectionRef} style={sectionBoxStyle}>
            <h2
              style={{
                marginTop: 0,
                textAlign: "center",
                color: "#f8fafc",
              }}
            >
              🤖 KI-Kurs-Prompt erstellen
            </h2>

            <p style={helperTextStyle}>
              Erstelle aus deinen Angaben einen Prompt. Den Prompt kannst du in
              eine KI kopieren. Das erzeugte JSON fügst du danach unten beim
              Blueprint-Import ein.
            </p>

            <div style={gridStyle}>
              <div>
                <label style={smallLabelStyle}>Kursthema *</label>
                <input
                  style={inputStyle}
                  value={aiForm.topic}
                  onChange={(e) => updateAiForm("topic", e.target.value)}
                  placeholder="z. B. Java Grundlagen, Spring Security, SQL..."
                />
              </div>

              <div>
                <label style={smallLabelStyle}>Kurstitel optional</label>
                <input
                  style={inputStyle}
                  value={aiForm.courseTitle}
                  onChange={(e) => updateAiForm("courseTitle", e.target.value)}
                  placeholder="z. B. Java Grundlagen für Einsteiger"
                />
              </div>

              <div>
                <label style={smallLabelStyle}>Zielgruppe</label>
                <input
                  style={inputStyle}
                  value={aiForm.targetAudience}
                  onChange={(e) =>
                    updateAiForm("targetAudience", e.target.value)
                  }
                  placeholder="z. B. Anfänger, Trainer, Backend-Entwickler"
                />
              </div>

              <div>
                <label style={smallLabelStyle}>Sprache</label>
                <select
                  style={inputStyle}
                  value={aiForm.language}
                  onChange={(e) => updateAiForm("language", e.target.value)}
                >
                  {AI_LANGUAGES.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={smallLabelStyle}>Schwierigkeitsgrad</label>
                <select
                  style={inputStyle}
                  value={aiForm.difficulty}
                  onChange={(e) => updateAiForm("difficulty", e.target.value)}
                >
                  {AI_DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={smallLabelStyle}>Min. Kapitel</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  style={inputStyle}
                  value={aiForm.minSections}
                  onChange={(e) =>
                    updateAiNumberField("minSections", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={smallLabelStyle}>Max. Kapitel</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  style={inputStyle}
                  value={aiForm.maxSections}
                  onChange={(e) =>
                    updateAiNumberField("maxSections", e.target.value)
                  }
                />
              </div>
            </div>

            {sectionNumberError && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(251, 191, 36, 0.14)",
                  border: "1px solid rgba(251, 191, 36, 0.35)",
                  color: "#fde68a",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ⚠️ {sectionNumberError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "18px",
                flexWrap: "wrap",
                marginTop: "18px",
                marginBottom: "18px",
                justifyContent: "center",
              }}
            >
              <label
                style={{
                  fontWeight: 700,
                  color: "#f8fafc",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "999px",
                  padding: "9px 14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={aiForm.chapterQuizEnabled}
                  onChange={(e) =>
                    updateAiForm("chapterQuizEnabled", e.target.checked)
                  }
                  style={{ marginRight: "8px" }}
                />
                Kapitelquizzes erzeugen
              </label>

              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  color: "#fed7aa",
                  fontWeight: 700,
                  fontSize: "14px",
                  background: "rgba(249, 115, 22, 0.12)",
                  border: "1px solid rgba(249, 115, 22, 0.28)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                🎓 Abschlussprüfung wird nicht automatisch erzeugt. Der Trainer
                erstellt sie später manuell im Kurs.
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={smallLabelStyle}>Zusätzliche Hinweise</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "90px",
                  resize: "vertical",
                }}
                value={aiForm.extraNotes}
                onChange={(e) => updateAiForm("extraNotes", e.target.value)}
                placeholder="z. B. viele Praxisbeispiele, einfache Sprache, Fokus auf Backend, keine langen Videos..."
              />
            </div>

            <div style={buttonRowStyle}>
              <button
                type="button"
                onClick={buildAiPrompt}
                style={{
                  ...buttonBaseStyle,
                  border: "none",
                  background: "#0d6efd",
                  color: "white",
                  boxShadow: "0 10px 22px rgba(13, 110, 253, 0.28)",
                }}
              >
                {promptButtonLabel}
              </button>
            </div>

            {promptOutdated && (
              <div
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  color: "#fde68a",
                  background: "rgba(251, 191, 36, 0.12)",
                  border: "1px solid rgba(251, 191, 36, 0.28)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "12px",
                }}
              >
                ⚠️ Du hast Eingaben geändert. Bitte den KI-Prompt aktualisieren,
                bevor du ihn kopierst.
              </div>
            )}

            {generatedPrompt && (
              <div ref={generatedPromptRef}>
                <label style={smallLabelStyle}>Generierter KI-Prompt</label>

                <textarea
                  value={generatedPrompt}
                  readOnly
                  style={promptTextareaStyle}
                />

                {/* ✅ Kopieren-Button bewusst NACH dem schwarzen Prompt-Feld */}
                <div
                  style={{
                    ...buttonRowStyle,
                    marginTop: "14px",
                    marginBottom: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={copyGeneratedPrompt}
                    disabled={!canCopyPrompt}
                    style={{
                      ...buttonBaseStyle,
                      border: "none",
                      background: canCopyPrompt ? "#16a34a" : "#64748b",
                      color: "white",
                      cursor: canCopyPrompt ? "pointer" : "not-allowed",
                      opacity: canCopyPrompt ? 1 : 0.65,
                      boxShadow: canCopyPrompt
                        ? "0 10px 22px rgba(22, 163, 74, 0.28)"
                        : "none",
                    }}
                  >
                    📋 Prompt kopieren
                  </button>
                </div>

                {/* ✅ Hinweis/Meldung bewusst NACH dem Kopieren-Button */}
                <div
                  ref={promptCopyMessageRef}
                  style={{
                    marginBottom: "12px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: copyMessage.includes("✅")
                      ? "rgba(34, 197, 94, 0.13)"
                      : copyMessage
                      ? "rgba(239, 68, 68, 0.13)"
                      : "rgba(59, 130, 246, 0.13)",
                    border: copyMessage.includes("✅")
                      ? "1px solid rgba(74, 222, 128, 0.35)"
                      : copyMessage
                      ? "1px solid rgba(248, 113, 113, 0.35)"
                      : "1px solid rgba(96, 165, 250, 0.35)",
                    color: copyMessage.includes("✅")
                      ? "#bbf7d0"
                      : copyMessage
                      ? "#fecaca"
                      : "#bfdbfe",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {copyMessage.includes("✅")
                    ? "✅ Prompt wurde kopiert. Füge ihn jetzt in dein KI-Werkzeug ein, kopiere danach das erzeugte JSON und füge es unten in den Blueprint-JSON-Bereich ein."
                    : copyMessage
                    ? `⚠️ ${copyMessage} Du kannst den Prompt trotzdem manuell markieren und kopieren. Danach das erzeugte JSON unten einfügen.`
                    : "Nächster Schritt: Klicke auf „Prompt kopieren“, füge ihn in dein KI-Werkzeug ein und füge danach das erzeugte JSON unten ein."}
                </div>
              </div>
            )}
          </div>

          <div style={buttonRowStyle}>
            <button
              type="button"
              onClick={loadExample}
              disabled={exampleLoading}
              style={secondaryButtonStyle}
            >
              {exampleLoading
                ? "Beispiel-Datei wird geladen..."
                : "Beispiel-Datei laden"}
            </button>
          </div>

          {repairMessage && (
            <div
              style={{
                marginBottom: "16px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "#dbeafe",
                color: "#1e40af",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              🛠 {repairMessage}
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "#fee2e2",
                color: "#991b1b",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              ❌ {error}
            </div>
          )}

          {blueprintAnalysis?.validJson === false && (
            <div
              style={{
                marginBottom: "16px",
                padding: "16px",
                borderRadius: "12px",
                background: "#fee2e2",
                color: "#991b1b",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                ❌ {blueprintAnalysis.errors[0]}
              </div>

              {blueprintAnalysis.parseErrorDetails?.context && (
                <pre
                  style={{
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    background: "#7f1d1d",
                    color: "#fee2e2",
                    padding: "14px",
                    borderRadius: "10px",
                    overflowX: "auto",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    marginBottom: "12px",
                  }}
                >
                  {blueprintAnalysis.parseErrorDetails.context}
                </pre>
              )}

              {blueprintAnalysis.parseErrorDetails?.tips?.length > 0 && (
                <div
                  style={{
                    textAlign: "left",
                    background: "#fff7ed",
                    color: "#7c2d12",
                    padding: "14px",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ marginBottom: "8px", fontWeight: 800 }}>
                    Mögliche Ursache:
                  </div>

                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {blueprintAnalysis.parseErrorDetails.tips.map(
                      (tip, index) => (
                        <li key={index}>{tip}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <label style={{ ...lightLabelStyle, marginBottom: 0 }}>
              Blueprint JSON
            </label>

            <span
              style={{
                color: "#cbd5e1",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Zeile {jsonCursorInfo.line}, Spalte {jsonCursorInfo.column}
            </span>
          </div>

          <div style={jsonEditorWrapperStyle}>
            <pre
              ref={jsonLineNumbersRef}
              style={jsonLineNumbersStyle}
              aria-hidden="true"
            >
              {jsonLineNumbers}
            </pre>

            <textarea
              ref={jsonTextareaRef}
              value={jsonText}
              onPaste={handleJsonPaste}
              onChange={handleJsonTextareaChange}
              onScroll={handleJsonTextareaScroll}
              onClick={(e) => updateJsonCursorInfo(e.currentTarget)}
              onKeyUp={(e) => updateJsonCursorInfo(e.currentTarget)}
              placeholder="Blueprint JSON hier einfügen..."
              wrap="off"
              spellCheck={false}
              style={jsonTextareaStyle}
            />
          </div>

          {blueprintAnalysis?.summary && (
            <div
              style={{
                marginTop: "18px",
                marginBottom: "18px",
                padding: "18px",
                borderRadius: "14px",
                background:
                  blueprintAnalysis.errors.length > 0
                    ? "#fee2e2"
                    : blueprintAnalysis.warnings.length > 0
                    ? "#fffbeb"
                    : "#ecfdf5",
                border:
                  blueprintAnalysis.errors.length > 0
                    ? "1px solid #fca5a5"
                    : blueprintAnalysis.warnings.length > 0
                    ? "1px solid #facc15"
                    : "1px solid #86efac",
                color: "#0f172a",
              }}
            >
              <h2 style={{ marginTop: 0, textAlign: "center" }}>
                Blueprint-Vorschau
              </h2>

              <p style={{ textAlign: "center", fontWeight: 700 }}>
                {blueprintAnalysis.summary.title}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                  marginTop: "14px",
                  textAlign: "center",
                }}
              >
                <div>
                  <strong>Kapitel</strong>
                  <br />
                  {blueprintAnalysis.summary.sections}
                </div>

                <div>
                  <strong>Lectures</strong>
                  <br />
                  {blueprintAnalysis.summary.lectures}
                </div>

                <div>
                  <strong>Ressourcen</strong>
                  <br />
                  {blueprintAnalysis.summary.resources}
                </div>

                <div>
                  <strong>Quizze</strong>
                  <br />
                  {blueprintAnalysis.summary.quizzes}
                </div>

                <div>
                  <strong>Kapitelquizze</strong>
                  <br />
                  {blueprintAnalysis.summary.chapterQuizzes}
                </div>

                <div>
                  <strong>Abschlussprüfung</strong>
                  <br />
                  {blueprintAnalysis.summary.hasFinalExam
                    ? "Im JSON gefunden – nicht erlaubt"
                    : "Nein"}
                </div>
              </div>

              {!blueprintAnalysis.summary.hasFinalExam && (
                <p
                  style={{
                    marginTop: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#166534",
                  }}
                >
                  ✅ Keine automatische Abschlussprüfung. Trainer erstellt sie
                  später manuell.
                </p>
              )}

              {blueprintAnalysis.summary.hasFinalExam && (
                <p
                  style={{
                    marginTop: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#991b1b",
                  }}
                >
                  ❌ Dieses JSON enthält noch eine automatische
                  Abschlussprüfung:{" "}
                  {blueprintAnalysis.summary.finalExamTitle || "Ohne Titel"}
                </p>
              )}

              {blueprintAnalysis.errors.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    color: "#991b1b",
                    fontWeight: 700,
                  }}
                >
                  <div>❌ Fehler:</div>
                  <ul>
                    {blueprintAnalysis.errors.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {blueprintAnalysis.warnings.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    color: "#92400e",
                    fontWeight: 700,
                  }}
                >
                  <div>⚠️ Hinweise:</div>
                  <ul>
                    {blueprintAnalysis.warnings
                      .slice(0, 6)
                      .map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                  </ul>

                  {blueprintAnalysis.warnings.length > 6 && (
                    <p>
                      Weitere Hinweise vorhanden:{" "}
                      {blueprintAnalysis.warnings.length - 6}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {jsonText.trim() && (
            <div
              ref={importActionRef}
              style={{
                marginTop: "18px",
                padding: "18px",
                borderRadius: "14px",
                background: importDisabled
                  ? "rgba(100, 116, 139, 0.16)"
                  : "rgba(13, 110, 253, 0.14)",
                border: importDisabled
                  ? "1px solid rgba(148, 163, 184, 0.25)"
                  : "1px solid rgba(96, 165, 250, 0.4)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: importDisabled ? "#cbd5e1" : "#bfdbfe",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                {result
                  ? "Dieser Blueprint wurde bereits importiert. Öffne den Kurs unten oder starte über Reset einen neuen Import."
                  : importDisabled
                  ? "JSON wurde eingefügt. Bitte prüfe zuerst Fehler oder Warnungen in der Vorschau."
                  : "JSON ist bereit. Du kannst den Blueprint jetzt importieren."}
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={importDisabled}
                style={{
                  ...primaryButtonStyle,
                  maxWidth: "520px",
                  margin: "0 auto",
                }}
              >
                {result
                  ? "Blueprint bereits importiert"
                  : loading
                  ? "Importiere..."
                  : "Blueprint importieren"}
              </button>
            </div>
          )}

          {result && (
            <div
              ref={importResultRef}
              style={{
                marginTop: "18px",
                marginBottom: "16px",
                padding: "18px",
                borderRadius: "14px",
                background: "#dcfce7",
                color: "#14532d",
                textAlign: "center",
                border: "1px solid #86efac",
              }}
            >
              <h2 style={{ marginTop: 0 }}>✅ Import erfolgreich</h2>

              <p>
                <strong>Kurs:</strong> {result.title}
              </p>

              <p>
                <strong>Course-ID:</strong> {result.courseId}
              </p>

              <p>
                <strong>Kapitel:</strong> {result.sectionsCreated} |{" "}
                <strong>Lectures:</strong> {result.lecturesCreated} |{" "}
                <strong>Ressourcen:</strong> {result.resourcesCreated} |{" "}
                <strong>Quizze:</strong> {result.quizzesCreated}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                  marginTop: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${result.courseId}`)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#16a34a",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Kurs öffnen
                </button>

                <button
                  type="button"
                  onClick={resetBlueprintWorkflow}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "1px solid #94a3b8",
                    background: "#e5e7eb",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Neuen Blueprint starten
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseBlueprintImportPage;