export const normalize = (value) => {
  return value === null || value === undefined ? "" : String(value).trim();
};

export const formatSalutation = (salutation) => {
  const value = normalize(salutation).toUpperCase();

  switch (value) {
    case "HERR":
      return "Herr";
    case "FRAU":
      return "Frau";
    case "DIVERS":
      return "";
    default:
      return normalize(salutation);
  }
};

export const capitalizeWords = (value) => {
  const normalized = normalize(value);

  if (!normalized) return "";

  return normalized
    .split(/\s+/)
    .map((word) =>
      word
        .split("-")
        .map((part) => {
          if (!part) return "";
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-")
    )
    .join(" ");
};

export const buildPersonName = ({
  salutation,
  title,
  firstName,
  lastName,
  fallback = "Unbekannt",
}) => {
  const fullName = [
    formatSalutation(salutation),
    normalize(title),
    capitalizeWords(firstName),
    capitalizeWords(lastName),
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || normalize(fallback) || "Unbekannt";
};

export const formatAuthorName = (author) => {
  if (!author) return "Unbekannt";

  if (typeof author === "string") {
    return capitalizeWords(author);
  }

  return buildPersonName({
    salutation: author.salutation || author.authorSalutation,
    title: author.title || author.authorTitle,
    firstName: author.firstName || author.authorFirstName,
    lastName: author.lastName || author.authorLastName,
    fallback:
      author.displayName ||
      author.name ||
      author.fullName ||
      "Unbekannt",
  });
};