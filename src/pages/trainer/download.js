import api from "../../api";

export async function downloadResource(resourceId) {
  try {
    const response = await api.get(
      `/lectures/resources/${resourceId}/download`,
      {
        responseType: "blob",
      }
    );

    const disposition = response.headers["content-disposition"];
    let fileName = "download";

    if (disposition) {
      const match = disposition.match(/filename="(.+)"/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download fehlgeschlagen", err);
    alert("Datei konnte nicht heruntergeladen werden");
  }
}
