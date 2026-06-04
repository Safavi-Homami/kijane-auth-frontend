// src/data/courseBlueprintAiSpec.js

export const COURSE_BLUEPRINT_AI_DEFAULTS = {
  blueprintVersion: "1.0",
  courseType: "AI_GENERATED",

  language: "Deutsch",

  minSections: 3,
  maxSections: 6,

  minLecturesPerSection: 2,
  maxLecturesPerSection: 6,

  minResourcesPerLecture: 2,
  maxResourcesPerLecture: 5,

  chapterQuizEnabled: true,

  // WICHTIG:
  // Abschlussprüfungen werden ab jetzt NICHT mehr automatisch durch KI/Blueprint erzeugt.
  // Der Trainer erstellt die Abschlussprüfung später manuell im Kurs.
  finalExamEnabled: false,

  defaultPassingPercentage: 70,
  defaultSelfTestTimeLimitMinutes: 0,
  defaultMaxAttempts: 10,
};

export const buildCourseBlueprintAiSpec = (options = {}) => {
  const config = {
    ...COURSE_BLUEPRINT_AI_DEFAULTS,
    ...options,

    // Sicherheitsnetz:
    // Auch wenn irgendwo noch finalExamEnabled=true übergeben wird,
    // bleibt die Spezifikation trotzdem ohne automatische Abschlussprüfung.
    finalExamEnabled: false,
  };

  return `
# Course Blueprint AI Specification V1

Ziel:
Die KI erzeugt ausschließlich gültiges JSON für den Course-Blueprint-Import der Clavisimo/Kijane-Kursplattform.

Die KI erzeugt nur den Kursaufbau:
- Kursdaten
- Kapitel
- Lectures
- Lernresources
- optionale Kapitelquizze als Selbsttests

Die KI erzeugt KEINE Abschlussprüfung.
Die Abschlussprüfung wird später manuell durch den Trainer im Kurs erstellt.

Die Ausgabe muss ein reines JSON-Objekt sein.
Keine Markdown-Erklärung außerhalb des JSON.
Keine Markdown-Code-Fences um das gesamte JSON.
Keine Kommentare im JSON.
Keine zusätzlichen Texte vor oder nach dem JSON.

Sprache der Kursinhalte:
${config.language}

Grundstruktur:

{
  "blueprintVersion": "${config.blueprintVersion}",
  "courseType": "${config.courseType}",
  "course": {
    "title": "",
    "description": "",
    "targetAudience": "",
    "prerequisites": "",
    "notes": "",
    "estimatedDurationHours": 0,
    "visible": true,
    "sections": []
  }
}

Pflichtfelder:
- blueprintVersion
- courseType
- course
- course.title
- course.description
- course.targetAudience
- course.prerequisites
- course.notes
- course.sections

Verbotene Felder:
- course.finalExam
- "finalExam": null
- courseFinalExam: true
- certificateEnabled: true für normale Kapitelquizze

Wichtig:
Die KI darf kein Feld "finalExam" im course-Objekt erzeugen, auch nicht mit null.
Die KI darf keine Abschlussprüfung erzeugen.
Die KI darf courseFinalExam niemals auf true setzen.
Die KI darf certificateEnabled niemals auf true setzen.

Erlaubte Resource-Typen:
- TEXT
- CODE_EXAMPLE
- EXERCISE
- LINK
- VIDEO
- QUIZ
- IMAGE

TEXT Resource:

{
  "type": "TEXT",
  "title": "",
  "content": ""
}

CODE_EXAMPLE Resource:

{
  "type": "CODE_EXAMPLE",
  "title": "",
  "content": "",
  "explanation": ""
}

EXERCISE Resource:

{
  "type": "EXERCISE",
  "title": "",
  "task": "",
  "expectedResult": "",
  "explanation": ""
}

LINK Resource:

{
  "type": "LINK",
  "title": "",
  "url": ""
}

VIDEO Resource:

{
  "type": "VIDEO",
  "title": "",
  "url": ""
}

IMAGE Resource:

{
  "type": "IMAGE",
  "title": "",
  "url": "",
  "explanation": ""
}

QUIZ Resource als Kapitel-Selbsttest:

{
  "type": "QUIZ",
  "title": "",
  "description": "",
  "passingPercentage": ${config.defaultPassingPercentage},
  "timeLimitMinutes": ${config.defaultSelfTestTimeLimitMinutes},
  "maxAttempts": ${config.defaultMaxAttempts},
  "courseFinalExam": false,
  "certificateEnabled": false,
  "questions": []
}

Quiz-Frage:

{
  "text": "",
  "points": 1,
  "multipleChoice": false,
  "answers": []
}

Quiz-Antwort:

{
  "text": "",
  "correct": true
}

Kursstruktur-Regeln:
1. Jeder Kurs soll mindestens ${config.minSections} Kapitel enthalten.
2. Jeder Kurs soll maximal ${config.maxSections} Kapitel enthalten.
3. Jedes Kapitel soll mindestens ${config.minLecturesPerSection} Lectures enthalten.
4. Jedes Kapitel soll maximal ${config.maxLecturesPerSection} Lectures enthalten.
5. Jede Lecture soll mindestens ${config.minResourcesPerLecture} Resources enthalten.
6. Jede Lecture soll maximal ${config.maxResourcesPerLecture} Resources enthalten.
7. Jede Lecture soll fachlich zusammenhängend sein.
8. Kapitel sollen logisch aufeinander aufbauen.
9. Die Reihenfolge soll didaktisch sinnvoll sein: Einführung, Grundlagen, Anwendung, Übung, Vertiefung.
10. Am Ende des Kurses darf die KI einen normalen Wiederholungsabschnitt oder eine Zusammenfassung erzeugen, aber keine Abschlussprüfung.
11. Eine Lecture soll nicht nur aus einem Quiz bestehen.
12. Pro Lecture soll mindestens eine erklärende Lernresource enthalten sein.
13. Kapitel sollen nicht künstlich aufgebläht werden, sondern fachlich sinnvoll strukturiert sein.

Kapitelquiz-Regel:
${
  config.chapterQuizEnabled
    ? "Kapitelquizze sind erlaubt und sollen als normale Selbsttests erzeugt werden."
    : "Kapitelquizze sollen nicht erzeugt werden."
}

Quiz-Regeln:
1. Kapitelquizze sind normale Selbsttests.
2. Kapitelquizze dürfen nur courseFinalExam=false haben.
3. Kapitelquizze müssen certificateEnabled=false haben.
4. Kapitelquizze dürfen keine Kurszertifikate auslösen.
5. Eine Abschlussprüfung darf nicht im Blueprint erzeugt werden.
6. course.finalExam darf nicht erzeugt werden.
7. "finalExam": null darf ebenfalls nicht erzeugt werden.
8. Innerhalb normaler Lecture-Resources darf courseFinalExam niemals true sein.
9. passingPercentage muss zwischen 1 und 100 liegen.
10. Standard passingPercentage ist ${config.defaultPassingPercentage}.
11. timeLimitMinutes soll für Selbsttests ${config.defaultSelfTestTimeLimitMinutes} sein.
12. timeLimitMinutes=0 bedeutet: kein relevantes Zeitlimit.
13. maxAttempts soll ${config.defaultMaxAttempts} sein.
14. Jede Frage braucht mindestens zwei Antworten.
15. Jede Frage braucht mindestens eine richtige Antwort.
16. Single-Choice-Fragen dürfen nur eine richtige Antwort haben.
17. Multiple-Choice-Fragen dürfen mehrere richtige Antworten haben.
18. Fragen sollen eindeutig formuliert sein.
19. Antworten sollen fachlich korrekt und nicht irreführend sein.
20. Es sollen keine doppelten Antwortmöglichkeiten erzeugt werden.
21. Selbsttest-Fragen sollen den Lernstoff wiederholen und nicht wie eine offizielle Prüfung formuliert sein.

Didaktische Regeln:
1. Lerntexte sollen klar, verständlich und anfängerfreundlich sein.
2. Lerntexte sollen nicht zu kurz sein.
3. Eine TEXT-Resource soll normalerweise mehrere kurze Absätze enthalten.
4. Wichtige Begriffe sollen erklärt werden, nicht nur genannt.
5. Inhalte sollen praxisnah sein.
6. Jede Lecture soll einen klaren Lernzweck haben.
7. Übungen sollen zur vorherigen Lecture passen.
8. Erwartete Ergebnisse bei Übungen dürfen sichtbar sein, weil sie aktuell als normale Lernresource importiert werden.
9. Selbsttest-Fragen sollen das Kapitel wiederholen, aber nicht als offizielle Prüfung formuliert sein.
10. Der Kurs soll nach dem Import durch den Trainer weiter bearbeitbar bleiben.
11. Der Trainer erstellt die echte Abschlussprüfung später selbst manuell im Kurs.
12. Jede Lecture soll möglichst eine Kombination aus Erklärung, Beispiel und Übung enthalten.
13. Keine extrem oberflächlichen Ein-Satz-Erklärungen erzeugen.
14. Schwierige Begriffe sollen mit einfachen Beispielen erklärt werden.
15. Wenn ein Thema für Einsteiger gedacht ist, soll die Erklärung langsam und schrittweise erfolgen.
16. Wenn der Kurs praxisorientiert ist, sollen Beispiele realistische Anwendungssituationen enthalten.

Qualitätsregeln für Lerntexte:
1. TEXT.content soll ausführlicher sein als nur ein kurzer Satz.
2. TEXT.content soll bei wichtigen Themen mindestens 2 bis 4 kurze Absätze enthalten.
3. Jeder Absatz soll gut lesbar sein.
4. Fachbegriffe sollen direkt erklärt werden.
5. Theorie soll mit einfachen Beispielen verbunden werden.
6. Keine langen, unstrukturierten Textblöcke erzeugen.
7. Aufzählungen dürfen mit "- " erzeugt werden.
8. Überschriften innerhalb von content dürfen mit "#", "##" oder "###" erzeugt werden.
9. Keine beschädigten Markdown-Fragmente erzeugen.
10. Keine URLs, JSON-Fragmente oder Markdown-Links in title-Felder schreiben.
11. title-Felder sollen kurz, sauber und lesbar sein.
12. content-Felder dürfen längere Erklärungen enthalten.

Regeln für Code-Beispiele:
1. Code-Beispiele sollen lauffähig und einfach erklärbar sein.
2. Code-Beispiele sollen kurz, verständlich und passend zur jeweiligen Lecture sein.
3. Code-Beispiele sollen nicht unnötig komplex sein.
4. Zu jedem Code-Beispiel muss eine verständliche Erklärung erzeugt werden.
5. CODE_EXAMPLE.content darf nur Code enthalten.
6. CODE_EXAMPLE.explanation muss die Erklärung enthalten.
7. Keine erklärenden Sätze direkt in CODE_EXAMPLE.content schreiben.
8. Keine Texte wie "Erklärung:" direkt an den Code anhängen.
9. Code darf NICHT als eine einzige lange Zeile erzeugt werden.
10. Code muss mehrzeilig und lesbar formatiert werden.
11. Code muss sinnvolle Einrückungen enthalten.
12. Klassen, Methoden, Kontrollstrukturen, Schleifen und Bedingungen müssen mit Zeilenumbrüchen formatiert werden.
13. Öffnende und schließende geschweifte Klammern sollen übersichtlich gesetzt werden.
14. Lange Codezeilen sollen vermieden werden.
15. Jede Codezeile soll möglichst gut lesbar bleiben.
16. Wenn ein Beispiel länger wird, soll es lieber in mehrere einfache Zeilen aufgeteilt werden.
17. Keine kompletten Java-Klassen, JavaScript-Funktionen, C++-Programme oder SQL-Beispiele in einer einzigen Zeile erzeugen.

Spezialregeln für Programmiersprachen außer SQL:
1. Wenn das Thema eine Programmiersprache ist, sollen Code-Beispiele möglichst mit Funktionen oder Methoden arbeiten.
2. Ein Code-Beispiel soll zeigen, wie eine Funktion/Methode definiert wird.
3. Ein Code-Beispiel soll zeigen, wie diese Funktion/Methode aufgerufen wird.
4. Die explanation soll erklären, was die Funktion/Methode zurückgibt oder ausgibt.
5. Die explanation soll die wichtigsten Codezeilen erklären.
6. Nicht jede einzelne Zeile muss erklärt werden, aber die fachlich wichtigen Zeilen müssen erklärt werden.
7. Wenn main, Startfunktion oder Einstiegspunkt nötig ist, darf er verwendet werden.
8. Der Code soll trotzdem einsteigerfreundlich bleiben.
9. Methoden- oder Funktionsnamen sollen sprechend sein.
10. Beispiele sollen einfache, realistische Eingaben und Ausgaben verwenden.

Beispielstruktur für Programmiersprachen:
- Funktion oder Methode definieren
- Funktion oder Methode im Hauptprogramm aufrufen
- Ergebnis oder Ausgabe zeigen
- wichtige Codezeilen erklären

Spezialregeln für Java:
1. Java-Code soll lesbar formatiert sein.
2. Wenn möglich, soll eine Methode verwendet werden.
3. Die main-Methode darf zeigen, wie die Methode aufgerufen wird.
4. Beispiel:
   public class Main {
       static int verdoppeln(int zahl) {
           return zahl * 2;
       }

       public static void main(String[] args) {
           int ergebnis = verdoppeln(5);
           System.out.println(ergebnis);
       }
   }

Spezialregeln für JavaScript:
1. JavaScript-Code soll lesbar formatiert sein.
2. Wenn möglich, soll eine Funktion verwendet werden.
3. Der Funktionsaufruf soll gezeigt werden.
4. Beispiel:
   function begruessen(name) {
       return "Hallo " + name;
   }

   const nachricht = begruessen("Sara");
   console.log(nachricht);

Spezialregeln für C++:
1. C++-Code soll lesbar formatiert sein.
2. Wenn möglich, soll eine Funktion verwendet werden.
3. Der Funktionsaufruf soll in main gezeigt werden.
4. Strings mit doppelten Anführungszeichen müssen im JSON korrekt escaped werden.
5. Beispiel:
   #include <iostream>
   using namespace std;

   int verdoppeln(int zahl) {
       return zahl * 2;
   }

   int main() {
       int ergebnis = verdoppeln(5);
       cout << ergebnis << endl;
       return 0;
   }

Spezialregeln für SQL:
1. SQL ist keine normale Programmiersprache mit Methoden.
2. Bei SQL sollen Beispiele stattdessen realistische Tabellenkontexte enthalten.
3. Ein SQL-Beispiel soll erklären, welche Tabelle verwendet wird.
4. Ein SQL-Beispiel soll erklären, welche Spalten wichtig sind.
5. Ein SQL-Beispiel soll die Query zeigen.
6. Die explanation soll erklären, was die Query zurückliefert.
7. Wenn sinnvoll, soll ein erwartetes Ergebnis beschrieben werden.
8. SQL-Code soll mehrzeilig formatiert sein.
9. Beispiel:
   SELECT name, email
   FROM users
   WHERE active = true;
10. SQL-Erklärungen sollen besonders auf SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY und LIMIT eingehen, wenn diese verwendet werden.

Regeln für Übungen:
1. Übungen sollen klar zwischen Aufgabe, erwartetem Ergebnis und Erklärung unterscheiden.
2. EXERCISE.task muss die Aufgabe enthalten.
3. EXERCISE.expectedResult muss das erwartete Ergebnis enthalten.
4. EXERCISE.explanation muss erklären, wie man ungefähr zur Lösung kommt.
5. Übungen sollen nicht zu schwer für die Zielgruppe sein.
6. Übungen sollen direkt zur vorherigen Erklärung oder zum vorherigen Code-Beispiel passen.
7. Übungen dürfen keine offizielle Prüfung simulieren.
8. Übungen sollen praktisch und nachvollziehbar sein.

Formatierungsregeln für Lerntexte:
1. Lange Texte sollen in kurze, gut lesbare Absätze aufgeteilt werden.
2. Aufzählungen dürfen mit "- " erzeugt werden.
3. Überschriften innerhalb von content dürfen mit "#", "##" oder "###" erzeugt werden.
4. Keine beschädigten Markdown-Fragmente erzeugen.
5. Keine URLs, JSON-Fragmente oder Markdown-Links in title-Felder schreiben.
6. title-Felder sollen kurz, sauber und lesbar sein.
7. content-Felder dürfen längere Erklärungen enthalten.
8. Bei EXERCISE sollen task, expectedResult und explanation sauber getrennt befüllt werden.
9. Bei CODE_EXAMPLE soll content nur den Code enthalten und explanation die Erklärung.
10. Keine Texte wie "**Erklärung:**" direkt an Code anhängen, wenn dafür ein separates Feld explanation vorhanden ist.

Technische Regeln:
1. Die KI darf keine Datenbank-IDs erzeugen.
2. Die KI darf keine userId erzeugen.
3. Die KI darf keine authorId erzeugen.
4. Die KI darf keine courseId erzeugen.
5. Die KI darf keine sectionId erzeugen.
6. Die KI darf keine lectureId erzeugen.
7. Die KI darf keine resourceId erzeugen.
8. IDs werden ausschließlich vom Backend erzeugt.
9. JSON muss syntaktisch gültig sein.
10. Strings müssen korrekt escaped sein.
11. Zeilenumbrüche in Texten und Code müssen im JSON korrekt als \\n gespeichert werden.
12. Doppelte Anführungszeichen innerhalb von Code müssen im JSON korrekt escaped werden.
13. Backslashes müssen korrekt escaped werden.
14. Keine Kommentare innerhalb des JSON.
15. Keine Markdown-Code-Fences um das gesamte JSON.
16. Keine versteckten Abschlussprüfungs-Container erzeugen.
17. Keine Felder erzeugen, die eine Resource als Abschlussprüfung markieren.
18. Keine beschädigten JSON- oder Markdown-Fragmente in title-Feldern erzeugen.
19. Keine sehr langen einzeiligen content-Werte für Code-Beispiele erzeugen.
20. CODE_EXAMPLE.content muss lesbaren, mehrzeiligen Code enthalten.
21. CODE_EXAMPLE.explanation muss eine normale Erklärung enthalten, keinen Code.
22. EXERCISE.task muss die Aufgabe enthalten.
23. EXERCISE.expectedResult muss das erwartete Ergebnis enthalten.
24. EXERCISE.explanation muss die Erklärung enthalten.
25. Vor der finalen Antwort muss die KI gedanklich prüfen, ob das JSON mit JSON.parse eingelesen werden könnte.
26. Wenn Code doppelte Anführungszeichen enthält, müssen diese innerhalb des JSON-Strings korrekt escaped werden.
27. Das JSON darf kein trailing comma enthalten.
28. Das JSON darf keine undefinierten Werte enthalten.
29. Das JSON darf keine JavaScript-Ausdrücke enthalten.
30. Das JSON darf nur gültige JSON-Werte enthalten: string, number, boolean, object, array oder null.
31. Für verbotene Felder darf auch null nicht verwendet werden.
32. Insbesondere "finalExam": null darf nicht erzeugt werden.

Empfohlene Kursstruktur:
- ${config.minSections} bis ${config.maxSections} Kapitel
- ${config.minLecturesPerSection} bis ${config.maxLecturesPerSection} Lectures pro Kapitel
- ${config.minResourcesPerLecture} bis ${config.maxResourcesPerLecture} Resources pro Lecture
- pro Kapitel optional ein Kapitelquiz als Selbsttest
- keine automatische Abschlussprüfung
- keine course.finalExam-Struktur
- keine "finalExam": null Struktur

Empfohlene Resource-Verteilung pro Lecture:
- 1 TEXT-Resource mit verständlicher Erklärung
- 1 CODE_EXAMPLE oder EXERCISE, wenn es fachlich passt
- optional weitere TEXT-, CODE_EXAMPLE-, EXERCISE-, LINK-, VIDEO- oder IMAGE-Resources
- QUIZ nur als Selbsttest, bevorzugt am Ende eines Kapitels

Wichtig:
Die finale Antwort der KI muss ausschließlich das JSON enthalten.
Das JSON darf keine Abschlussprüfung enthalten.
Das JSON darf kein course.finalExam enthalten.
Das JSON darf kein "finalExam": null enthalten.
Das JSON darf kein courseFinalExam=true enthalten.
Das JSON darf kein certificateEnabled=true enthalten.
Das JSON darf nicht außen mit Markdown-Code-Fences umschlossen werden.
Code innerhalb von Resource-Inhalten muss sauber mehrzeilig formatiert sein.
Code innerhalb von JSON-Strings muss korrekt escaped sein.
`;
};

export const COURSE_BLUEPRINT_AI_SPEC_V1 = buildCourseBlueprintAiSpec();