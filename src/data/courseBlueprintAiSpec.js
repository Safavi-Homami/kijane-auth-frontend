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

Harte Ausgaberegeln:
1. Die Ausgabe muss ein reines JSON-Objekt sein.
2. Das erste Zeichen der Antwort muss { sein.
3. Das letzte Zeichen der Antwort muss } sein.
4. Vor der öffnenden geschweiften Klammer darf kein Text stehen.
5. Nach der schließenden geschweiften Klammer darf kein Text stehen.
6. Die KI darf keine Einleitung wie "Hier ist das JSON", "Ja, ..." oder ähnliche Sätze schreiben.
7. Keine Markdown-Erklärung außerhalb des JSON.
8. Keine Markdown-Code-Fences um das gesamte JSON.
9. Keine Kommentare im JSON.
10. Keine zusätzlichen Texte vor oder nach dem JSON.
11. Die JSON-Struktur selbst darf niemals escaped werden.
12. Normale Feldnamen wie "title", "orderIndex", "resources", "type", "content" und "explanation" dürfen nicht mit Backslashes geschrieben werden.
13. Escaping gilt nur innerhalb von String-Werten, niemals für JSON-Feldnamen, Objekte, Arrays, Kommas oder Klammern.

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

Video-Regeln:
1. Wenn das Kursthema fachlich sinnvoll über Videos unterstützt werden kann, soll pro Kapitel mindestens eine Video-Unterstützung erzeugt werden.
2. Wenn eine echte, plausible und thematisch passende Video-URL sicher bekannt ist, darf eine VIDEO-Resource erzeugt werden.
3. Die KI darf keine frei erfundenen Video-URLs erzeugen.
4. VIDEO.url darf nur echte Video-URLs enthalten.
5. VIDEO.url darf keine Suchseite, keinen Platzhalter und keine ungültige URL enthalten.
6. Wenn keine sichere echte Video-URL bekannt ist, muss stattdessen eine LINK-Resource mit einer passenden YouTube-Suchanfrage erzeugt werden.
7. Eine YouTube-Suchanfrage als LINK muss eine gültige https-URL sein.
8. Beispiel für eine gültige YouTube-Such-URL:
   "https://www.youtube.com/results?search_query=Java+Variablen+Deutsch"
9. Bei C++ muss die YouTube-Suche "C%2B%2B" oder "C++" korrekt als URL verwenden.
10. Keine Markdown-Links in url-Feldern erzeugen.
11. Keine url-Werte im Format "[https://...](https://...)" erzeugen.
12. Der Titel einer Video-Suche soll mit "Video-Suche:" beginnen.
13. Für die spätere Erweiterung mit eigenen Videos soll der Trainer die erzeugten VIDEO- oder LINK-Resources nach dem Import bearbeiten können.

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
14. Jedes Kapitel soll, wenn fachlich sinnvoll, mindestens eine Resource zur Video-Unterstützung enthalten.
15. Wenn echte VIDEO-URLs nicht sicher verfügbar sind, soll stattdessen eine LINK-Resource mit einer passenden YouTube-Suchanfrage erzeugt werden.
16. Eine Lecture darf nicht nur aus einem Video oder Link bestehen. Video-Resources müssen durch TEXT, CODE_EXAMPLE oder EXERCISE fachlich eingebettet werden.
17. Video- oder Link-Resources sollen den Lernfluss unterstützen, aber nicht die Erklärung ersetzen.
18. Für Version 1 Beta soll keine erzwungene Spezial-Lecture "Kapitel-Selbsttest und Praxisaufgabe" erzeugt werden.
19. Kapitelquizze dürfen am Ende eines Kapitels erscheinen, sollen aber die JSON-Stabilität nicht gefährden.
20. Wenn komplexe Quiz- oder Code-Strukturen ungültiges JSON riskieren, soll die KI einfachere Lernresources erzeugen.

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
22. Kapitelquizze sollen nicht nur theoretische Definitionen abfragen.
23. Kapitelquizze sollen Verständnis, Anwendung und typische Fehler prüfen.
24. Pro Kapitelquiz soll es eine Mischung aus einfachen, mittleren und anspruchsvolleren Fragen geben.
25. Mindestens eine Frage pro Kapitelquiz soll eine praktische Anwendungssituation beschreiben.
26. Bei technischen Kursen soll mindestens eine Frage pro Kapitelquiz ein konkretes Beispiel, eine kurze Fehlersituation, eine Konfiguration oder ein realistisches Szenario enthalten.
27. Fragen sollen nicht zu offensichtlich sein. Falsche Antworten sollen plausible typische Anfängerfehler darstellen.
28. Quizfragen sollen den tatsächlichen Kenntnisstand prüfen, nicht nur auswendig gelerntes Wissen.
29. Die KI darf sich an allgemein bekannten Quiz-Best-Practices orientieren, aber keine konkreten Fragen aus dem Internet wörtlich kopieren.
30. Jede Quizfrage soll eindeutig lösbar sein.
31. Jede Antwortoption soll fachlich sinnvoll formuliert sein.
32. Die richtige Antwort darf nicht durch auffällige Länge, Formulierung oder Stil sofort erkennbar sein.
33. Keine Antwortoptionen wie "Alle Antworten sind richtig" oder "Keine der Antworten ist richtig", außer es ist didaktisch wirklich sinnvoll.
34. Quizfragen sollen zu den Inhalten des Kapitels passen und keine Themen abfragen, die vorher nicht erklärt wurden.
35. Wenn multipleChoice=false ist, darf genau eine Antwort correct=true haben.
36. Wenn multipleChoice=true ist, sollen mehrere richtige Antworten möglich sein; falls nur eine Antwort richtig ist, soll multipleChoice=false verwendet werden.
37. Bei Multiple-Choice-Fragen soll aus dem Fragetext klar erkennbar sein, dass mehrere Antworten möglich sind.
38. Pro Kapitelquiz sollen nach Möglichkeit 4 bis 8 Fragen erzeugt werden.
39. Bei kurzen Einsteigerkapiteln reichen 3 bis 6 Fragen.
40. Bei praxisorientierten oder Expertenkursen sollen 5 bis 10 Fragen erzeugt werden.
41. Für Version 1 Beta ist gültiges JSON wichtiger als besonders komplexe Quizfragen.

Regeln für Code-Quizfragen:
1. Bei Programmiersprachen, SQL, DevOps, Administration, Bash, Git, Linux und ähnlichen IT-Themen dürfen Quizze Code-, Befehl-, Query- oder Konfigurationsfragen enthalten.
2. Code-Quizfragen sollen nicht nur fragen, was ein Befehl heißt, sondern prüfen, ob der Lernende den Code oder das Szenario versteht.
3. Eine Code-Quizfrage kann fragen:
   - Welche Ausgabe entsteht?
   - Welche Aussage über den Code ist richtig?
   - Welche Zeile enthält einen typischen Fehler?
   - Welche Änderung wäre sinnvoll?
   - Welche Query liefert das gewünschte Ergebnis?
   - Welche Option ist sicherer oder sauberer?
4. Codeausschnitte in Quizfragen müssen kurz bleiben.
5. Codeausschnitte in Quizfragen sollen möglichst ohne doppelte Anführungszeichen formuliert werden.
6. Wenn doppelte Anführungszeichen im Code nötig wären, soll die KI lieber eine normale Verständnisfrage ohne Codeblock erzeugen.
7. Code in Quizfragen soll nicht mehrzeilig sein, wenn dadurch ungültiges JSON entstehen könnte.
8. Lange Codeausschnitte gehören in CODE_EXAMPLE.content, nicht in Quizfragen.
9. Bei Einsteigerkursen sollen Code-Quizfragen einfache Konzepte prüfen, z. B. Variablen, Bedingungen, Schleifen, Funktionen, Rückgabewerte oder einfache Fehler.
10. Bei fortgeschrittenen Kursen dürfen Code-Quizfragen komplexere Konzepte prüfen, aber nur wenn das JSON stabil bleibt.
11. Falsche Antworten bei Codefragen sollen typische Missverständnisse abbilden.
12. Codefragen sind erwünscht, aber nicht zwingend in jedem Kapitel.
13. Wenn Codefragen das JSON-Risiko erhöhen, soll die KI stattdessen kurze Verständnisfragen zu Code, Ausgabe oder typischen Fehlern erzeugen.
14. Wenn das Kapitel keine Programmiersprache behandelt, sollen stattdessen praxisnahe Szenariofragen erzeugt werden.
15. Keine Quizfrage darf ein vollständiges Programm als Text enthalten.
16. Keine Quizfrage darf Markdown-Code-Fences enthalten.

Qualitätsregeln für bessere Quizfragen:
1. Quizfragen sollen unterschiedliche Denkleistungen prüfen:
   - Wiedererkennen
   - Verstehen
   - Anwenden
   - Fehler erkennen
   - kleine Entscheidungen treffen
2. Ein Kapitelquiz soll nicht nur aus einfachen Begriffsfragen bestehen.
3. Jede Quizfrage soll einen klaren Zweck haben.
4. Die Frage soll möglichst konkret sein.
5. Gute Quizfragen sollen häufige Fehlannahmen sichtbar machen.
6. Antwortmöglichkeiten sollen nicht lächerlich offensichtlich falsch sein.
7. Distraktoren sollen realistische falsche Denkwege darstellen.
8. Fragen sollen nicht unnötig kompliziert formuliert sein.
9. Fragen sollen keine Tricks verwenden, die nichts mit dem Lernziel zu tun haben.
10. Bei Einsteigerkursen sollen Quizfragen fair und lernunterstützend bleiben.
11. Bei praxisorientierten Kursen sollen Quizfragen mehr Anwendungssituationen enthalten.
12. Bei Expertenniveau sollen Quizfragen stärker Analyse, Vergleich, Fehlerdiagnose und Begründung prüfen.
13. Wenn eine Frage auf Code basiert, soll der Code sehr kurz sein.
14. Wenn eine Frage auf einem Szenario basiert, soll das Szenario kurz, realistisch und eindeutig sein.
15. Quizfragen sollen nicht einfach Sätze aus der TEXT-Resource wiederholen.
16. Quizfragen sollen keine URLs enthalten.

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
17. Jede Lecture soll mehr bieten als eine kurze Definition. Sie soll erklären, warum das Thema wichtig ist, wann man es verwendet und welches konkrete Problem dadurch gelöst wird.
18. Bei technischen und berufspraktischen Themen soll jede Lecture mindestens ein realistisches Beispiel aus der Praxis enthalten.
19. Bei Programmiersprachen soll der Kurs schrittweise wachsen: zuerst einfache Beispiele, danach Varianten, danach kleine zusammenhängende Programme oder Mini-Projekte.
20. Einsteigerkurse sollen einfache Begriffe gründlich erklären, ohne kindlich oder oberflächlich zu wirken.
21. Fortgeschrittene oder praxisorientierte Kurse sollen realistischere Szenarien, typische Fehler und bessere Lösungswege enthalten.
22. Jede Lecture soll nach Möglichkeit enthalten:
   - Erklärung des Konzepts
   - einfaches Beispiel
   - praktisches Beispiel
   - typische Fehler oder Stolperfallen
   - kurze Übung
23. Die KI soll Inhalte für erwachsene Lernende schreiben: klar, respektvoll, praxisnah und nicht schulisch-flach.
24. Quizze sollen als Lernkontrolle dienen und dem Lernenden zeigen, ob er die wichtigsten Konzepte verstanden hat.
25. Quizze sollen Theorie und Praxis kombinieren.
26. Bei Programmiersprachen sollen Quizfragen auch praktische Verständnissituationen enthalten, aber nicht auf Kosten gültigen JSONs.
27. Bei Datenbankkursen sollen Quizfragen SQL-Verständnis prüfen.
28. Bei Linux/Bash/Git/Admin-Themen sollen Quizfragen Befehle, Ausgaben oder typische Fehlersituationen bewerten.
29. Die KI soll keine perfekte Abschlussprüfung simulieren.

Regeln für Schlüsselbegriffe und Konzeptabdeckung:
1. Wichtige Schlüsselbegriffe eines Kapitels müssen erklärt werden, bevor sie in Übungen oder Quizfragen verwendet werden.
2. Bei Programmiersprachen müssen zentrale Begriffe wie Variable, Datentyp, Operator, Kontrollstruktur, Bedingung, Schleife, Funktion, Methode, Parameter, Rückgabewert, Array, Liste, Objekt und Klasse jeweils erklärt werden, wenn sie im Kurs vorkommen.
3. Jeder zentrale Begriff soll mindestens eine kurze Erklärung und ein passendes Beispiel erhalten.
4. Bei Programmiersprachen soll zu zentralen Begriffen möglichst ein kleines Codebeispiel erzeugt werden.
5. Die KI darf wichtige Fachbegriffe nicht nur nennen, sondern muss ihre Bedeutung und Verwendung erklären.
6. Ein Quiz darf keine Begriffe abfragen, die im Kapitel vorher nicht erklärt wurden.
7. Eine Übung darf keine Konzepte verlangen, die vorher nicht erklärt oder gezeigt wurden.
8. Wenn ein Kapitel viele Begriffe enthält, sollen die Begriffe auf mehrere Lectures verteilt werden.
9. Keine Lecture soll zu viele neue Begriffe gleichzeitig einführen.
10. Sprachspezifische Schlüsselbegriffe müssen zur jeweiligen Sprache passen.
11. Java-Begriffe gelten nur für Java.
12. C++-Begriffe gelten nur für C++.
13. JavaScript-Begriffe gelten nur für JavaScript.
14. Python-Begriffe gelten nur für Python.
15. SQL-Begriffe gelten nur für SQL.

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
13. TEXT.content soll bei zentralen Themen mindestens 3 bis 6 kurze Absätze enthalten.
14. TEXT.content soll nicht nur erklären, was etwas ist, sondern auch warum es wichtig ist und wie man es praktisch verwendet.
15. Bei Programmierthemen soll TEXT.content den Zusammenhang zwischen Konzept und Code erklären.
16. Jede wichtige Lecture soll mindestens ein konkretes Alltagsszenario, Projektszenario oder Praxisbeispiel enthalten.
17. Wenn ein Thema häufige Anfängerfehler hat, sollen diese kurz genannt und erklärt werden.
18. Die Erklärung soll nicht zu knapp sein. Lieber mehrere klare Absätze als eine sehr kurze Antwort.
19. Die KI soll nicht nur Stichworte liefern, sondern vollständige Lerninhalte, die ein Trainer nach dem Import direkt weiterbearbeiten kann.
20. TEXT.content darf keine komplette JSON-Struktur enthalten.

Allgemeine Regeln für Code-Beispiele:
1. Code-Beispiele sollen lauffähig und einfach erklärbar sein.
2. Code-Beispiele sollen kurz, verständlich und passend zur jeweiligen Lecture sein.
3. Code-Beispiele sollen nicht unnötig komplex sein.
4. Zu jedem Code-Beispiel muss eine verständliche Erklärung erzeugt werden.
5. CODE_EXAMPLE.content darf nur Code enthalten.
6. CODE_EXAMPLE.explanation muss die Erklärung enthalten.
7. Keine erklärenden Sätze direkt in CODE_EXAMPLE.content schreiben.
8. Keine Texte wie "Erklärung:" direkt an den Code anhängen.
9. Code-Beispiele sollen stabil und JSON-sicher sein.
10. Für Version 1 Beta ist gültiges JSON wichtiger als perfekte Code-Formatierung.
11. Lange Codebeispiele sollen vermieden werden.
12. Wenn mehrzeiliger Code erzeugt wird, muss die gesamte JSON-Ausgabe trotzdem gültig bleiben.
13. Lange Codezeilen sollen vermieden werden.
14. Wenn ein Beispiel länger wird, soll es lieber in mehrere einfache Beispiele aufgeteilt werden.
15. Sprachregeln dürfen nicht vermischt werden.
16. Java-Code darf keine C++-Syntax verwenden.
17. C++-Code darf keine Java-Syntax verwenden.
18. JavaScript-Code darf keine Java- oder C++-Syntax verwenden.
19. Python-Code darf keine Java-, JavaScript- oder C++-Syntax verwenden.
20. SQL-Code darf nicht wie eine normale Programmiersprache mit main-Funktion dargestellt werden.

Erweiterte Regeln für Code-Beispiele:
1. Bei Programmiersprachen soll möglichst jede wichtige Lecture eine CODE_EXAMPLE-Resource enthalten.
2. Wenn eine Lecture kein Code-Beispiel enthält, soll sie dafür eine konkrete EXERCISE-Resource enthalten.
3. Die ersten Lectures eines Kurses sollen sehr einfache Code-Beispiele enthalten.
4. Spätere Lectures sollen schrittweise umfangreichere und realistischere Code-Beispiele enthalten.
5. Ein Kurs über eine Programmiersprache soll nicht nur isolierte Mini-Snippets enthalten, sondern auch kleine zusammenhängende Beispiele.
6. Pro Kapitel soll mindestens ein etwas größeres Praxisbeispiel oder Mini-Projekt entstehen, wenn dadurch gültiges JSON nicht gefährdet wird.
7. CODE_EXAMPLE.explanation soll die wichtigsten Codezeilen oder Codeblöcke konkret erläutern.
8. CODE_EXAMPLE.explanation soll zusätzlich nennen:
   - welches Problem der Code löst
   - welche Eingaben oder Voraussetzungen es gibt
   - welches Ergebnis oder welche Ausgabe erwartet wird
   - welche typischen Fehler Anfänger machen könnten
9. Bei Programmiersprachen soll der Code nach Möglichkeit ausführbar sein.
10. Code-Beispiele sollen didaktisch aufeinander aufbauen.
11. Wenn der Kurs Expertenniveau oder praxisorientiert ist, dürfen Code-Beispiele länger und realistischer sein, solange sie gültiges JSON nicht gefährden.
12. Bei Einsteigerkursen soll komplexer Code langsam vorbereitet und nicht ohne Erklärung eingeführt werden.

Spracherkennung für Code-Regeln:
1. Die KI muss zuerst das Kursthema bestimmen.
2. Wenn das Thema Java ist, gelten die Java-Regeln.
3. Wenn das Thema C++ ist, gelten die C++-Regeln.
4. Wenn das Thema JavaScript ist, gelten die JavaScript-Regeln.
5. Wenn das Thema Python ist, gelten die Python-Regeln.
6. Wenn das Thema SQL ist, gelten die SQL-Regeln.
7. Wenn das Thema eine andere Programmiersprache ist, gelten nur die allgemeinen Programmiersprachen-Regeln.
8. Es dürfen keine Regeln verschiedener Programmiersprachen vermischt werden.
9. Beispiele, Begriffe, Syntax und Standardbibliotheken müssen zur gewählten Sprache passen.
10. Wenn das Thema C++ ist, darf die KI keine Java-Klassen wie public class Main verwenden.
11. Wenn das Thema Java ist, darf die KI keine C++-Includes wie #include verwenden.
12. Wenn das Thema JavaScript ist, darf die KI keine Java-main-Methode verwenden.
13. Wenn das Thema SQL ist, darf die KI keine main-Funktion, keine Klassen und keine Methoden erzwingen.

Allgemeine Programmiersprachen-Regeln außer SQL:
1. Wenn das Thema eine Programmiersprache außer SQL ist, sollen Code-Beispiele möglichst mit Funktionen oder Methoden arbeiten, wenn das für die Sprache üblich ist.
2. Ein Code-Beispiel soll zeigen, wie eine Funktion oder Methode definiert wird, wenn das Thema dafür geeignet ist.
3. Ein Code-Beispiel soll zeigen, wie diese Funktion oder Methode aufgerufen wird, wenn das Thema dafür geeignet ist.
4. Die explanation soll erklären, was die Funktion oder Methode zurückgibt oder ausgibt.
5. Die explanation soll die wichtigsten Codezeilen erklären.
6. Nicht jede einzelne Zeile muss erklärt werden, aber die fachlich wichtigen Zeilen müssen erklärt werden.
7. Wenn main, Startfunktion oder Einstiegspunkt für die Sprache üblich ist, darf er verwendet werden.
8. Der Code soll trotzdem einsteigerfreundlich bleiben.
9. Methoden- oder Funktionsnamen sollen sprechend sein.
10. Beispiele sollen einfache, realistische Eingaben und Ausgaben verwenden.
11. Jede Programmiersprachen-Lecture soll nach Möglichkeit mindestens ein kleines Codebeispiel enthalten.
12. Pro Kapitel soll mindestens ein Codebeispiel entstehen, das etwas größer ist als ein einzelner Funktionsaufruf, wenn dadurch gültiges JSON nicht gefährdet wird.
13. Der Schwierigkeitsgrad der Codebeispiele soll innerhalb des Kurses steigen.
14. Die KI soll nicht nur "Hallo Welt"-ähnliche Beispiele wiederholen.
15. Beispiele sollen konkrete Mini-Aufgaben lösen, z. B. Berechnung, Validierung, Listenverarbeitung, Benutzereingabe, Dateioperation oder einfache Geschäftslogik.
16. Wenn möglich, soll eine spätere Lecture ein kleines zusammenhängendes Mini-Projekt zeigen.
17. Bei jedem größeren Beispiel soll erklärt werden, wie man den Code ausführt oder testet.
18. Bei jedem größeren Beispiel soll ein erwartetes Ergebnis oder eine Beispielausgabe beschrieben werden.

Spezialregeln für Java:
1. Diese Regeln gelten nur, wenn das Kursthema Java ist.
2. Java-Code darf Java-Klassen, Methoden und die main-Methode verwenden.
3. Java-Code darf public class Main verwenden.
4. Java-Code darf System.out.println verwenden.
5. Java-Code darf static Methoden für einfache Beispiele verwenden.
6. Java-Code darf primitive Datentypen wie int, double und boolean verwenden.
7. Java-Code darf String verwenden.
8. Java-Code darf Arrays und Listen verwenden, wenn sie im Kurs erklärt wurden.
9. Java-Code darf keine C++-Includes wie #include verwenden.
10. Java-Code darf kein cout und kein cin verwenden.
11. Java-Code darf keine Python-Syntax verwenden.
12. Java-Code soll lesbar und einsteigerfreundlich bleiben.
13. Für Beta dürfen Java-Beispiele kurz sein, wenn dadurch das JSON stabiler bleibt.
14. Java-Beispielmuster:
   public class Main {
       static int verdoppeln(int zahl) {
           return zahl * 2;
       }

       public static void main(String[] args) {
           int ergebnis = verdoppeln(5);
           System.out.println(ergebnis);
       }
   }

Spezialregeln für C++:
1. Diese Regeln gelten nur, wenn das Kursthema C++ ist.
2. C++-Code darf #include verwenden.
3. C++-Code darf using namespace std verwenden, wenn es für Einsteiger einfacher ist.
4. C++-Code darf int main verwenden.
5. C++-Code darf cout und cin verwenden.
6. C++-Code darf Funktionen außerhalb von main definieren.
7. C++-Code darf keine Java-Klassen wie public class Main verwenden.
8. C++-Code darf kein System.out.println verwenden.
9. C++-Code darf keine JavaScript-Funktion mit function als Hauptmuster verwenden.
10. C++-Code darf keine Python-Syntax verwenden.
11. Bei C++-Codebeispielen sollen für Version 1 Beta möglichst einfache Zahlenbeispiele verwendet werden.
12. C++-Codebeispiele sollen möglichst wenige doppelte Anführungszeichen enthalten.
13. Wenn Textausgaben nötig sind, sollen sie kurz bleiben.
14. Die KI soll keine komplexen C++-Programme mit vielen String-Literalen erzeugen.
15. Für Einsteiger sind einfache Beispiele mit int, double, if, for, Funktionen, Arrays und vector ausreichend.
16. Wenn String-Literale nötig sind, muss die gesamte JSON-Ausgabe trotzdem gültig bleiben.
17. Bei C++ ist gültiges JSON wichtiger als perfekte mehrzeilige Code-Formatierung.
18. Für C++ Video-Suchlinks soll in der URL C%2B%2B verwendet werden.
19. C++-Beispielmuster:
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

Spezialregeln für JavaScript:
1. Diese Regeln gelten nur, wenn das Kursthema JavaScript ist.
2. JavaScript-Code darf function verwenden.
3. JavaScript-Code darf const und let verwenden.
4. JavaScript-Code darf console.log verwenden.
5. JavaScript-Code darf keine Java-main-Methode verwenden.
6. JavaScript-Code darf keine C++-Includes verwenden.
7. JavaScript-Code darf kein cout und kein cin verwenden.
8. JavaScript-Code soll einfache Funktionen, Bedingungen, Schleifen, Arrays und Objekte erklären.
9. Für Beta dürfen JavaScript-Beispiele kurz sein, wenn dadurch das JSON stabiler bleibt.
10. JavaScript-Beispielmuster:
   function verdoppeln(zahl) {
       return zahl * 2;
   }

   const ergebnis = verdoppeln(5);
   console.log(ergebnis);

Spezialregeln für Python:
1. Diese Regeln gelten nur, wenn das Kursthema Python ist.
2. Python-Code darf def verwenden.
3. Python-Code darf print verwenden.
4. Python-Code darf Listen, Dictionaries und einfache Funktionen verwenden.
5. Python-Code darf keine geschweiften Klammern für normale Blöcke verwenden.
6. Python-Code darf keine Java-main-Methode verwenden.
7. Python-Code darf keine C++-Includes verwenden.
8. Python-Code darf kein cout und kein cin verwenden.
9. Python-Code muss auf Einrückung achten.
10. Für Beta dürfen Python-Beispiele kurz sein, wenn dadurch das JSON stabiler bleibt.
11. Python-Beispielmuster:
   def verdoppeln(zahl):
       return zahl * 2

   ergebnis = verdoppeln(5)
   print(ergebnis)

Spezialregeln für SQL:
1. Diese Regeln gelten nur, wenn das Kursthema SQL ist.
2. SQL ist keine normale Programmiersprache mit Methoden.
3. Bei SQL sollen Beispiele realistische Tabellenkontexte enthalten.
4. Ein SQL-Beispiel soll erklären, welche Tabelle verwendet wird.
5. Ein SQL-Beispiel soll erklären, welche Spalten wichtig sind.
6. Ein SQL-Beispiel soll die Query zeigen.
7. Die explanation soll erklären, was die Query zurückliefert.
8. Wenn sinnvoll, soll ein erwartetes Ergebnis beschrieben werden.
9. SQL-Code darf keine main-Funktion enthalten.
10. SQL-Code darf keine Java-Klasse enthalten.
11. SQL-Code darf keine C++-Includes enthalten.
12. SQL-Code soll SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY und LIMIT erklären, wenn diese verwendet werden.
13. Für Beta dürfen SQL-Beispiele kurz und stabil sein.
14. SQL-Beispielmuster:
   SELECT name, email
   FROM users
   WHERE active = true;

Regeln für Übungen:
1. Übungen sollen klar zwischen Aufgabe, erwartetem Ergebnis und Erklärung unterscheiden.
2. EXERCISE.task muss die Aufgabe enthalten.
3. EXERCISE.expectedResult muss das erwartete Ergebnis enthalten.
4. EXERCISE.explanation muss erklären, wie man ungefähr zur Lösung kommt.
5. Übungen sollen nicht zu schwer für die Zielgruppe sein.
6. Übungen sollen direkt zur vorherigen Erklärung oder zum vorherigen Code-Beispiel passen.
7. Übungen dürfen keine offizielle Prüfung simulieren.
8. Übungen sollen praktisch und nachvollziehbar sein.
9. Bei Code-Übungen soll EXERCISE.explanation einen kurzen Lösungsansatz enthalten.
10. Eine vollständige Musterlösung ist optional und soll nur erzeugt werden, wenn dadurch das JSON stabil und gültig bleibt.
11. Wenn eine Musterlösung viel Code benötigt, soll stattdessen eine separate CODE_EXAMPLE-Resource erzeugt werden.
12. EXERCISE.expectedResult soll bei Code-Übungen eine konkrete erwartete Ausgabe oder ein konkretes Verhalten beschreiben.
13. Eine Code-Übung darf nicht nur aus einer Aufgabenbeschreibung bestehen.
14. Die Übung soll für den Trainer nach dem Import leicht manuell erweiterbar bleiben.
15. EXERCISE.explanation darf keine komplette JSON-Struktur enthalten.

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
11. Keine Markdown-Code-Fences in Resource-Feldern erzeugen.
12. Keine Einleitungssätze außerhalb des JSON erzeugen.

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
10. Strings müssen korrekt als JSON-Strings ausgegeben werden.
11. Die JSON-Struktur selbst darf niemals escaped werden.
12. Feldnamen dürfen niemals mit Backslashes geschrieben werden.
13. Keine JSON-Objekte als String ausgeben.
14. Keine Kommentare innerhalb des JSON.
15. Keine Markdown-Code-Fences um das gesamte JSON.
16. Keine versteckten Abschlussprüfungs-Container erzeugen.
17. Keine Felder erzeugen, die eine Resource als Abschlussprüfung markieren.
18. Keine beschädigten JSON- oder Markdown-Fragmente in title-Feldern erzeugen.
19. Keine Markdown-Links in title-, url-, content- oder explanation-Feldern erzeugen.
20. CODE_EXAMPLE.content muss Code enthalten, aber kein JSON-Objekt.
21. CODE_EXAMPLE.explanation muss eine normale Erklärung enthalten, kein JSON-Objekt.
22. EXERCISE.task muss die Aufgabe enthalten.
23. EXERCISE.expectedResult muss das erwartete Ergebnis enthalten.
24. EXERCISE.explanation muss die Erklärung enthalten.
25. Vor der finalen Antwort muss die KI prüfen, ob das JSON mit JSON.parse eingelesen werden könnte.
26. Wenn Code doppelte Anführungszeichen enthält, muss die gesamte JSON-Ausgabe gültig bleiben.
27. Das JSON darf kein trailing comma enthalten.
28. Das JSON darf keine undefinierten Werte enthalten.
29. Das JSON darf keine JavaScript-Ausdrücke enthalten.
30. Das JSON darf nur gültige JSON-Werte enthalten: string, number, boolean, object, array oder null.
31. Für verbotene Felder darf auch null nicht verwendet werden.
32. Insbesondere "finalExam": null darf nicht erzeugt werden.
33. Quiz-Fragetexte dürfen kurze Codeausschnitte enthalten, müssen aber einfach und JSON-sicher bleiben.
34. Mehrzeilige Codeausschnitte in Quizfragen sollen vermieden werden, wenn dadurch ungültiges JSON entstehen könnte.
35. Quiz-Antworten dürfen keine langen Codeblöcke enthalten.
36. Antwortoptionen sollen bevorzugt kurze Aussagen, Ausgaben oder Korrekturvorschläge enthalten, keine langen Codeblöcke.
37. Keine Quizfrage darf ungültiges JSON verursachen.
38. Quizfragen dürfen keine Markdown-Code-Fences enthalten.
39. Quizfragen dürfen keine Internet-URLs als notwendige Voraussetzung enthalten.
40. Quizfragen sollen ohne externe Recherche lösbar sein.
41. Wenn eine Regel mit gültigem JSON kollidiert, hat gültiges JSON Vorrang.
42. Wenn die KI unsicher ist, soll sie kürzere und einfachere Inhalte erzeugen.
43. Keine Zeichenfolge wie \\n, \\"title\\" oder \\"resources\\" zwischen normalen JSON-Feldern erzeugen.
44. JSON-Feldnamen wie "title", "orderIndex", "resources", "type", "content", "explanation" müssen normale JSON-Felder bleiben.
45. Nur Inhalte innerhalb von String-Feldern dürfen escaped werden.
46. Keine komplette Lecture, Resource oder Quizfrage als escaped Textblock erzeugen.
47. Jede Lecture muss ein echtes JSON-Objekt sein.
48. Jede Resource muss ein echtes JSON-Objekt sein.
49. Jede Quizfrage muss ein echtes JSON-Objekt sein.
50. Jede Antwort muss ein echtes JSON-Objekt sein.

Empfohlene Kursstruktur:
- ${config.minSections} bis ${config.maxSections} Kapitel
- ${config.minLecturesPerSection} bis ${config.maxLecturesPerSection} Lectures pro Kapitel
- ${config.minResourcesPerLecture} bis ${config.maxResourcesPerLecture} Resources pro Lecture
- pro Kapitel optional ein Kapitelquiz als Selbsttest
- keine automatische Abschlussprüfung
- keine course.finalExam-Struktur
- keine "finalExam": null Struktur

Empfohlene Resource-Verteilung pro Lecture:
- 1 TEXT-Resource mit verständlicher, ausreichend ausführlicher Erklärung
- 1 CODE_EXAMPLE oder EXERCISE, wenn es fachlich passt
- Bei Programmiersprachen möglichst regelmäßig CODE_EXAMPLE-Resources verwenden
- Bei Programmiersprachen zusätzlich regelmäßig EXERCISE-Resources zur praktischen Anwendung
- Pro Kapitel mindestens eine VIDEO-Resource, wenn eine echte passende Video-URL sicher bekannt ist
- Wenn keine echte Video-URL bekannt ist, pro Kapitel mindestens eine LINK-Resource mit passender YouTube-Suchanfrage
- optional weitere TEXT-, CODE_EXAMPLE-, EXERCISE-, LINK-, VIDEO- oder IMAGE-Resources
- QUIZ nur als Selbsttest, bevorzugt am Ende eines Kapitels
- Kapitelquizze sollen nicht nur Theoriefragen enthalten, sondern auch Verständnis-, Anwendungs-, Fehler- und Szenariofragen
- Bei Programmierkursen sind Code-Verständnisfragen erwünscht, aber nicht zwingend, wenn dadurch das JSON instabil wird
- Bei SQL-Kursen sind Query-Verständnisfragen erwünscht, aber nicht zwingend, wenn dadurch das JSON instabil wird
- Bei IT-/Admin-/DevOps-Themen sind praxisnahe Befehls-, Konfigurations- oder Fehlerszenariofragen erwünscht

Wichtig:
Die finale Antwort der KI muss ausschließlich das JSON enthalten.
Das JSON darf keine Abschlussprüfung enthalten.
Das JSON darf kein course.finalExam enthalten.
Das JSON darf kein "finalExam": null enthalten.
Das JSON darf kein courseFinalExam=true enthalten.
Das JSON darf kein certificateEnabled=true enthalten.
Das JSON darf nicht außen mit Markdown-Code-Fences umschlossen werden.
Das erste Zeichen muss { sein.
Das letzte Zeichen muss } sein.
Vor { darf kein Text stehen.
Nach } darf kein Text stehen.
Die JSON-Struktur selbst darf niemals escaped werden.
Normale Feldnamen wie title, orderIndex, resources, type, content und explanation dürfen niemals mit Backslashes geschrieben werden.
Bei C++ gilt: lieber einfache, kurze, JSON-stabile Codebeispiele als komplexe Beispiele mit vielen String-Literalen.
Bei Java gilt: Java-Syntax verwenden, nicht C++.
Bei C++ gilt: C++-Syntax verwenden, nicht Java.
Bei JavaScript gilt: JavaScript-Syntax verwenden, nicht Java oder C++.
Bei Python gilt: Python-Syntax verwenden, nicht Java, JavaScript oder C++.
Bei SQL gilt: SQL-Queries verwenden, keine main-Funktion und keine Klassen.
`;
};

export const COURSE_BLUEPRINT_AI_SPEC_V1 = buildCourseBlueprintAiSpec();