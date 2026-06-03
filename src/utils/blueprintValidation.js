// src/utils/blueprintValidation.js

export function cleanBlueprintJsonText(value = "") {
  return String(value)
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function countLectureResources(lectures = []) {
  return lectures.reduce((sum, lecture) => {
    return sum + (lecture.resources?.length || 0);
  }, 0);
}

function countLectureQuizzes(lectures = []) {
  return lectures.reduce((sum, lecture) => {
    const quizCount =
      lecture.resources?.filter(
        (resource) => String(resource.type || "").toUpperCase() === "QUIZ"
      ).length || 0;

    return sum + quizCount;
  }, 0);
}

function looksLikeDamagedTitle(title) {
  if (!title) return false;

  return (
    title.includes("http://") ||
    title.includes("https://") ||
    title.includes("](") ||
    title.includes('"title"') ||
    title.includes("%22") ||
    title.includes("%7B") ||
    title.includes("%7b") ||
    title.includes("%7D") ||
    title.includes("%7d")
  );
}

export function hasOwnField(obj, fieldName) {
  return Boolean(obj) && Object.prototype.hasOwnProperty.call(obj, fieldName);
}

function isTrueLike(value) {
  return value === true || String(value).toLowerCase() === "true";
}

export function parsePositiveInteger(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    return null;
  }

  return number;
}

export function getSectionNumberError(aiForm) {
  const minSections = parsePositiveInteger(aiForm.minSections);
  const maxSections = parsePositiveInteger(aiForm.maxSections);

  if (minSections == null) {
    return "Min. Kapitel muss mindestens 1 sein.";
  }

  if (maxSections == null) {
    return "Max. Kapitel muss mindestens 1 sein.";
  }

  if (minSections > maxSections) {
    return "Min. Kapitel darf nicht größer als Max. Kapitel sein.";
  }

  if (maxSections > 30) {
    return "Max. Kapitel darf aktuell maximal 30 sein.";
  }

  return "";
}

function extractJsonErrorPosition(message) {
  const match = String(message || "").match(/position\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function extractJsonErrorLineColumn(message) {
  const match = String(message || "").match(/line\s+(\d+)\s+column\s+(\d+)/i);

  if (!match) return null;

  return {
    line: Number(match[1]),
    column: Number(match[2]),
  };
}

function getLineAndColumnFromPosition(text, position) {
  if (position == null || Number.isNaN(position)) {
    return null;
  }

  const safeText = String(text || "");
  const beforeError = safeText.slice(0, position);
  const line = beforeError.split("\n").length;
  const lastLineBreakIndex = beforeError.lastIndexOf("\n");
  const column = position - lastLineBreakIndex;

  return { line, column };
}

function getJsonErrorContext(text, lineNumber, radius = 2) {
  if (!lineNumber) return "";

  const lines = String(text || "").split("\n");
  const start = Math.max(0, lineNumber - 1 - radius);
  const end = Math.min(lines.length, lineNumber + radius);

  return lines
    .slice(start, end)
    .map((line, index) => {
      const realLineNumber = start + index + 1;
      const marker = realLineNumber === lineNumber ? "→" : " ";
      return `${marker} ${realLineNumber}: ${line}`;
    })
    .join("\n");
}

function buildJsonErrorTips(context = "") {
  const lowerContext = String(context || "").toLowerCase();

  const tips = [
    "Prüfe fehlende Kommas zwischen Feldern oder Objekten.",
    "Prüfe, ob ein String mit doppelten Anführungszeichen korrekt geschlossen wurde.",
    'Häufig bei Code-Beispielen: Anführungszeichen im Code müssen im JSON escaped werden, z. B. \\"Hallo\\" statt "Hallo".',
    "Prüfe, ob geschweifte Klammern { } und eckige Klammern [ ] vollständig geschlossen sind.",
  ];

  if (
    lowerContext.includes("cout") ||
    lowerContext.includes("#include") ||
    lowerContext.includes("std::") ||
    lowerContext.includes("system.out.println") ||
    lowerContext.includes("console.log")
  ) {
    tips.unshift(
      "Wahrscheinliches Code-Problem bei C++, Java oder JavaScript: Zeichenketten im Code enthalten doppelte Anführungszeichen und müssen im JSON escaped werden."
    );
  }

  if (
    lowerContext.includes("select ") ||
    lowerContext.includes("insert ") ||
    lowerContext.includes("update ") ||
    lowerContext.includes("delete ") ||
    lowerContext.includes("begin") ||
    lowerContext.includes("end;")
  ) {
    tips.unshift(
      "Bei SQL/Oracle/PLSQL: Prüfe Semikolons, BEGIN/END-Blöcke und Strings. Einfache Anführungszeichen sind meistens okay, doppelte Anführungszeichen müssen aber im JSON korrekt bleiben."
    );
  }

  if (
    lowerContext.includes("$") ||
    lowerContext.includes("bash") ||
    lowerContext.includes("sudo") ||
    lowerContext.includes("git ") ||
    lowerContext.includes("\\")
  ) {
    tips.unshift(
      "Bei Bash/Linux/Git: Prüfe Backslashes, Pfade und Sonderzeichen. Backslashes müssen im JSON oft doppelt geschrieben werden, z. B. \\\\."
    );
  }

  return tips;
}

export function buildFriendlyJsonParseError(jsonText, error) {
  const rawMessage = error?.message || "Unbekannter JSON-Fehler";

  const directLocation = extractJsonErrorLineColumn(rawMessage);
  const position = extractJsonErrorPosition(rawMessage);

  const calculatedLocation =
    directLocation || getLineAndColumnFromPosition(jsonText, position);

  const context = calculatedLocation
    ? getJsonErrorContext(jsonText, calculatedLocation.line)
    : "";

  const message = calculatedLocation
    ? `Ungültiges JSON in Zeile ${calculatedLocation.line}, Spalte ${calculatedLocation.column}: ${rawMessage}`
    : `Ungültiges JSON: ${rawMessage}`;

  return {
    message,
    rawMessage,
    position,
    line: calculatedLocation?.line || null,
    column: calculatedLocation?.column || null,
    context,
    tips: buildJsonErrorTips(context),
  };
}

function analyzeResource(resource, contextLabel, errors, warnings) {
  if (!resource) {
    warnings.push(`${contextLabel}: Resource ist leer.`);
    return;
  }

  const type = String(resource.type || "").toUpperCase();

  if (!type) {
    warnings.push(`${contextLabel}: Resource-Type fehlt.`);
  }

  if (isTrueLike(resource.courseFinalExam)) {
    errors.push(
      `${contextLabel}: courseFinalExam darf im KI-Blueprint nicht verwendet werden. Abschlussprüfungen werden später manuell durch den Trainer erstellt.`
    );
  }

  if (isTrueLike(resource.certificateEnabled)) {
    errors.push(
      `${contextLabel}: certificateEnabled=true ist im KI-Blueprint nicht erlaubt. Kapitelquizze sind nur Selbsttests.`
    );
  }

  if (resource.title && looksLikeDamagedTitle(resource.title)) {
    warnings.push(
      `${contextLabel}: Möglicherweise beschädigter Resource-Titel gefunden: "${resource.title.substring(
        0,
        80
      )}..."`
    );
  }

  if (type === "QUIZ") {
    if (!resource.questions || resource.questions.length === 0) {
      warnings.push(`${contextLabel}: Quiz enthält keine Fragen.`);
    }

    if (
      resource.passingPercentage != null &&
      (Number(resource.passingPercentage) < 1 ||
        Number(resource.passingPercentage) > 100)
    ) {
      errors.push(
        `${contextLabel}: passingPercentage muss zwischen 1 und 100 liegen.`
      );
    }
  }
}

export function analyzeBlueprintJson(jsonText) {
  const cleanedJsonText = cleanBlueprintJsonText(jsonText);

  if (!cleanedJsonText.trim()) {
    return null;
  }

  const errors = [];
  const warnings = [];

  let parsed;

  try {
    parsed = JSON.parse(cleanedJsonText);
  } catch (err) {
    const parseErrorDetails = buildFriendlyJsonParseError(cleanedJsonText, err);

    return {
      validJson: false,
      errors: [parseErrorDetails.message],
      warnings: [],
      summary: null,
      parseErrorDetails,
    };
  }

  const course = parsed.course;

  if (!course) {
    errors.push("course-Objekt fehlt.");
  }

  if (course && !course.title?.trim()) {
    errors.push("Kurstitel fehlt.");
  }

  if (hasOwnField(course, "finalExam")) {
    errors.push(
      "course.finalExam darf im KI-Blueprint nicht vorhanden sein. Die Abschlussprüfung soll der Trainer später manuell im Kurs erstellen."
    );
  }

  const sections = course?.sections || [];

  if (sections.length === 0) {
    errors.push("Der Blueprint enthält keine Kapitel.");
  }

  let lectureCount = 0;
  let resourceCount = 0;
  let quizCount = 0;
  let chapterQuizCount = 0;

  sections.forEach((section, sectionIndex) => {
    const sectionLabel = `Kapitel ${sectionIndex + 1}`;

    if (!section?.title?.trim()) {
      warnings.push(`${sectionLabel}: Titel fehlt.`);
    }

    const lectures = section?.lectures || [];
    lectureCount += lectures.length;

    if (lectures.length === 0) {
      warnings.push(
        `Kapitel "${section?.title || sectionIndex + 1}" enthält keine Lectures.`
      );
    }

    resourceCount += countLectureResources(lectures);
    quizCount += countLectureQuizzes(lectures);

    if (section?.chapterQuiz) {
      chapterQuizCount++;

      lectureCount++;
      quizCount++;
      resourceCount++;

      analyzeResource(
        section.chapterQuiz,
        `${sectionLabel} / Kapitelquiz`,
        errors,
        warnings
      );
    }

    lectures.forEach((lecture, lectureIndex) => {
      const lectureLabel = `${sectionLabel}, Lecture ${lectureIndex + 1}`;

      if (!lecture?.title?.trim()) {
        warnings.push(`${lectureLabel}: Titel fehlt.`);
      }

      const resources = lecture?.resources || [];

      if (resources.length === 0) {
        warnings.push(
          `Lecture "${lecture?.title || lectureIndex + 1}" enthält keine Ressourcen.`
        );
      }

      resources.forEach((resource, resourceIndex) => {
        analyzeResource(
          resource,
          `${lectureLabel}, Resource ${resourceIndex + 1}`,
          errors,
          warnings
        );
      });
    });
  });

  if (lectureCount === 0) {
    errors.push("Der Blueprint enthält keine Lectures.");
  }

  if (resourceCount === 0) {
    errors.push("Der Blueprint enthält keine Ressourcen.");
  }

  const hasFinalExam = hasOwnField(course, "finalExam");

  return {
    validJson: true,
    errors,
    warnings,
    summary: {
      title: course?.title || "Ohne Titel",
      sections: sections.length,
      lectures: lectureCount,
      resources: resourceCount,
      quizzes: quizCount,
      chapterQuizzes: chapterQuizCount,
      hasFinalExam,
      finalExamTitle:
        course?.finalExam?.title || "Automatische Abschlussprüfung",
    },
  };
}

const AUTO_REPAIR_STRING_FIELDS = [
  "title",
  "description",
  "content",
  "explanation",
  "task",
  "expectedResult",
  "notes",
  "targetAudience",
  "prerequisites",
  "text",
];

function isEscaped(text, index) {
  let backslashCount = 0;
  let i = index - 1;

  while (i >= 0 && text[i] === "\\") {
    backslashCount++;
    i--;
  }

  return backslashCount % 2 === 1;
}

function nextNonWhitespaceChar(text, index) {
  let i = index;

  while (i < text.length && /\s/.test(text[i])) {
    i++;
  }

  return text[i] || "";
}

function nextNonWhitespaceIndex(text, index) {
  let i = index;

  while (i < text.length && /\s/.test(text[i])) {
    i++;
  }

  return i;
}

const AUTO_REPAIR_ALLOWED_NEXT_FIELDS = new Set([
  ...AUTO_REPAIR_STRING_FIELDS,
  "type",
  "url",
  "passingPercentage",
  "timeLimitMinutes",
  "maxAttempts",
  "courseFinalExam",
  "certificateEnabled",
  "questions",
  "answers",
  "correct",
  "points",
  "multipleChoice",
  "sections",
  "lectures",
  "resources",
  "estimatedDurationHours",
  "visible",
  "blueprintVersion",
  "courseType",
  "course",
]);

function getJsonFieldNameAfterComma(text, commaIndex) {
  let i = commaIndex + 1;
  let hasLineBreak = false;

  while (i < text.length && /\s/.test(text[i])) {
    if (text[i] === "\n" || text[i] === "\r") {
      hasLineBreak = true;
    }

    i++;
  }

  // Wichtig:
  // Ein echtes Blueprint-Feld kommt in unserem formatierten JSON normalerweise
  // nach Komma + Zeilenumbruch.
  // cURL/JSON-Body hat oft ,"password": ohne Zeilenumbruch.
  if (!hasLineBreak) {
    return null;
  }

  if (text[i] !== `"`) {
    return null;
  }

  i++;
  const keyStart = i;

  while (i < text.length) {
    if (text[i] === `"` && !isEscaped(text, i)) {
      const key = text.slice(keyStart, i);
      const afterKeyIndex = nextNonWhitespaceIndex(text, i + 1);

      if (text[afterKeyIndex] === ":") {
        return key;
      }

      return null;
    }

    i++;
  }

  return null;
}

function looksLikeJsonFieldAfterComma(text, commaIndex) {
  const fieldName = getJsonFieldNameAfterComma(text, commaIndex);

  return Boolean(fieldName) && AUTO_REPAIR_ALLOWED_NEXT_FIELDS.has(fieldName);
}

function looksLikeObjectEndAfterString(text, quoteIndex) {
  const objectEndIndex = nextNonWhitespaceIndex(text, quoteIndex + 1);

  if (text[objectEndIndex] !== "}") {
    return false;
  }

  const afterObjectIndex = nextNonWhitespaceIndex(text, objectEndIndex + 1);
  const afterObjectChar = text[afterObjectIndex] || "";

  return (
    afterObjectChar === "" ||
    afterObjectChar === "," ||
    afterObjectChar === "]" ||
    afterObjectChar === "}"
  );
}
function repairStringFields(text) {
  const fieldPattern = new RegExp(
    `"(${AUTO_REPAIR_STRING_FIELDS.join("|")})"\\s*:\\s*"`,
    "g"
  );

  let result = "";
  let lastIndex = 0;
  let fixes = 0;
  let match;

  while ((match = fieldPattern.exec(text)) !== null) {
    const valueStart = fieldPattern.lastIndex;

    result += text.slice(lastIndex, valueStart);

    let i = valueStart;

    while (i < text.length) {
      const char = text[i];

      if (char === "\r") {
        i++;
        continue;
      }

      if (char === "\n") {
        result += "\\n";
        fixes++;
        i++;
        continue;
      }

      if (char === `"` && !isEscaped(text, i)) {
        const nextIndex = nextNonWhitespaceIndex(text, i + 1);
        const nextChar = text[nextIndex] || "";

        if (nextChar === "}" && looksLikeObjectEndAfterString(text, i)) {
            result += char;
            i++;
            break;
        }

        if (nextChar === "," && looksLikeJsonFieldAfterComma(text, nextIndex)) {
            result += char;
            i++;
            break;
        }

        result += `\\"`;
        fixes++;
        i++;
        continue;
        }

      result += char;
      i++;
    }

    lastIndex = i;
    fieldPattern.lastIndex = i;
  }

  result += text.slice(lastIndex);

  return {
    text: result,
    fixes,
  };
}

export function repairBlueprintJsonText(rawText) {
  if (!rawText) {
    return {
      text: "",
      changed: false,
      fixes: [],
    };
  }

  let text = String(rawText);
  const originalText = text;
  const fixes = [];

  const cleanedFences = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (cleanedFences !== text.trim()) {
    text = cleanedFences;
    fixes.push("Markdown-Code-Fences entfernt");
  }

  const normalizedQuotes = text
    .replace(/[“”]/g, `"`)
    .replace(/[‘’]/g, `'`);

  if (normalizedQuotes !== text) {
    text = normalizedQuotes;
    fixes.push("typografische Anführungszeichen normalisiert");
  }

  const repairedFields = repairStringFields(text);

if (repairedFields.fixes > 0) {
  text = repairedFields.text;
  fixes.push(
    `${repairedFields.fixes} problematische Zeichen in JSON-Strings repariert`
  );
}

// ✅ Windows-Pfade / ungültige Backslashes reparieren
const repairedBackslashes = repairInvalidBackslashesInsideJsonStrings(text);

if (repairedBackslashes !== text) {
  text = repairedBackslashes;
  fixes.push("ungültige Backslashes in JSON-Strings repariert");
}

const removedTrailingCommas = text.replace(/,\s*([}\]])/g, "$1");



  if (removedTrailingCommas !== text) {
    text = removedTrailingCommas;
    fixes.push("überflüssige Kommas entfernt");
  }

  return {
    text,
    changed: text !== originalText,
    fixes,
  };
}

function repairInvalidBackslashesInsideJsonStrings(jsonText) {
  let result = "";
  let insideString = false;

  const isHex = (char) => /^[0-9a-fA-F]$/.test(char || "");

  for (let i = 0; i < jsonText.length; i++) {
    const char = jsonText[i];
    const next = jsonText[i + 1];

    if (char === '"' && !isEscaped(jsonText, i)) {
      insideString = !insideString;
      result += char;
      continue;
    }

    if (insideString && char === "\\") {
      const validSimpleEscapes = ['"', "\\", "/", "b", "f", "n", "r", "t"];

      if (validSimpleEscapes.includes(next)) {
        result += char;
        continue;
      }

      // \u ist nur gültig, wenn danach exakt 4 Hex-Zeichen kommen.
      if (
        next === "u" &&
        isHex(jsonText[i + 2]) &&
        isHex(jsonText[i + 3]) &&
        isHex(jsonText[i + 4]) &&
        isHex(jsonText[i + 5])
      ) {
        result += char;
        continue;
      }

      // Alles andere ist ein ungültiger Backslash, z. B. C:\clavisimo\uploads
      result += "\\\\";
      continue;
    }

    result += char;
  }

  return result;
}

