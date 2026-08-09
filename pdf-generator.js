(function () {
  "use strict";

  const PAGE_HEIGHT = 842;

  function clean(value) {
    return String(value ?? "")
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\u2026/g, "...")
      .trim();
  }

  function joined(parts, separator = " ") {
    return parts.map(clean).filter(Boolean).join(separator);
  }

  function amount(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  function totalAssets(data) {
    return Object.entries(data).reduce((sum, [key, value]) => key.startsWith("asset_") && key.endsWith("_value") ? sum + (Number(value) || 0) : sum, 0);
  }

  function dateValue(value) {
    if (!value) return "";
    const parts = clean(value).split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : clean(value);
  }

  function relationship(value) {
    return ({
      parent: "Parent / Elternteil",
      grandparent: "Grandparent / Grosselternteil",
      child: "Child / Kind",
      grandchild: "Grandchild / Enkelkind",
      spouse: "Spouse / Ehegatte",
      former_spouse: "Former spouse / Frueherer Ehegatte",
      other_parent: "Other parent of child / Anderer Elternteil",
      other: "Other / Sonstige Person"
    })[value] || clean(value);
  }

  function month(value) {
    const index = Number(value) - 1;
    const en = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const de = ["Januar", "Februar", "Maerz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    return index >= 0 && index < 12 ? `${en[index]} / ${de[index]}` : "";
  }

  function householdText(rows) {
    return (rows || [])
      .filter((row) => row.name || row.relationship || row.age)
      .map((row) => joined([row.name, row.relationship, row.age ? `age ${row.age}` : ""], " - "))
      .join("; ");
  }

  function supportersText(rows) {
    return (rows || [])
      .filter((row) => row.name || row.address || row.amount)
      .map((row) => joined([row.name, row.address, row.amount], " - "))
      .join("; ");
  }

  function base64Bytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function wrap(font, text, size, maxWidth) {
    const lines = [];
    clean(text).split(/\n+/).forEach((paragraph) => {
      let line = "";
      paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (!line || font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
        else { lines.push(line); line = word; }
      });
      if (line) lines.push(line);
    });
    return lines;
  }

  function drawFitted(page, font, boldFont, text, box, options = {}) {
    const value = clean(text);
    if (!value) return;
    const padding = options.padding ?? 4;
    const maxWidth = box.width - padding * 2;
    const maxHeight = box.height - padding * 2;
    const selectedFont = options.bold === false ? font : boldFont;
    let size = options.size ?? 9;
    const minSize = options.minSize ?? 5.5;
    let lines = [];
    let lineHeight = size * 1.13;
    while (size >= minSize) {
      lines = wrap(selectedFont, value, size, maxWidth);
      lineHeight = size * 1.13;
      if (lines.length * lineHeight <= maxHeight) break;
      size -= 0.4;
    }
    const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      let last = lines[maxLines - 1];
      while (last.length && selectedFont.widthOfTextAtSize(`${last}...`, size) > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last}...`;
    }
    const top = box.top + padding + size;
    lines.forEach((line, index) => page.drawText(line, {
      x: box.x + padding,
      y: PAGE_HEIGHT - top - index * lineHeight,
      size,
      font: selectedFont,
      color: window.PDFLib.rgb(0.08, 0.08, 0.08)
    }));
  }

  function mark(page, font, checked, x, top) {
    if (!checked) return;
    page.drawText("X", { x, y: PAGE_HEIGHT - top, size: 10, font, color: window.PDFLib.rgb(0.05, 0.05, 0.05) });
  }

  function whiteout(page, x, top, width, height) {
    page.drawRectangle({
      x,
      y: PAGE_HEIGHT - top - height,
      width,
      height,
      color: window.PDFLib.rgb(1, 1, 1)
    });
  }

  async function createMaintenancePdf(data) {
    if (!window.PDFLib || !window.MAINTENANCE_PDF_TEMPLATE_BASE64) throw new Error("PDF components unavailable");
    const { PDFDocument, StandardFonts } = window.PDFLib;
    const pdf = await PDFDocument.load(base64Bytes(window.MAINTENANCE_PDF_TEMPLATE_BASE64));
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const [p1, p2, p3] = pdf.getPages();
    const draw = (page, text, x, top, width, height, options) => drawFitted(page, font, bold, text, { x, top, width, height }, options);

    // Page 1 - taxpayer and supported person.
    whiteout(p1, 433, 70, 31, 18);
    whiteout(p1, 385, 87, 27, 15);
    draw(p1, data.tax_year, 434, 72, 28, 14, { size: 9, padding: 2 });
    draw(p1, data.tax_year, 386, 88, 24, 12, { size: 8, padding: 1.5 });
    draw(p1, data.applicant_title, 68, 146, 58, 9, { size: 7, padding: 1 });
    draw(p1, data.applicant_first_name, 132, 146, 155, 9, { size: 7.5, padding: 1 });
    draw(p1, data.applicant_last_name, 293, 146, 233, 9, { size: 7.5, padding: 1 });
    draw(p1, data.applicant_street, 132, 182, 155, 16, { size: 7.5, padding: 2 });
    draw(p1, data.applicant_postal_code, 317, 160, 20, 17, { size: 5.4, padding: 1 });
    draw(p1, data.applicant_city, 343, 182, 183, 16, { size: 7.5, padding: 2 });
    draw(p1, joined([data.recipient_first_name, data.recipient_last_name]), 221, 293, 305, 18, { size: 9 });
    draw(p1, dateValue(data.recipient_birth_date), 221, 315, 305, 18, { size: 9 });
    draw(p1, data.recipient_birth_place, 221, 338, 305, 18, { size: 9 });
    draw(p1, joined([data.recipient_street, data.recipient_postal_code, data.recipient_city, data.recipient_country], ", "), 221, 361, 305, 18, { size: 8.3 });
    draw(p1, relationship(data.recipient_relationship), 221, 384, 305, 27, { size: 8.3 });
    const marital = clean(data.recipient_marital_status);
    mark(p1, bold, marital === "single", 282, 442);
    mark(p1, bold, marital === "married", 362, 442);
    mark(p1, bold, marital === "widowed", 442, 442);
    mark(p1, bold, marital === "divorced", 516, 442);
    draw(p1, data.recipient_occupation, 221, 476, 120, 43, { size: 7.4 });
    const frequency = clean(data.recipient_employment_frequency);
    mark(p1, bold, frequency === "regular", 386, 504);
    mark(p1, bold, frequency === "occasional", 450, 504);
    mark(p1, bold, frequency === "none", 516, 504);
    draw(p1, householdText(data.household_people), 221, 529, 305, 72, { size: 8, bold: false });

    // Page 2 - economic situation.
    whiteout(p2, 351, 123, 24, 15);
    whiteout(p2, 217, 134, 22, 13);
    draw(p2, data.tax_year, 353, 125, 20, 11, { size: 7, padding: 1 });
    draw(p2, data.tax_year, 219, 136, 18, 9, { size: 6.5, padding: 1 });
    [
      ["income_wages", "expense_wages", 171, 190], ["income_pension", "expense_pension", 193, 212],
      ["income_agriculture", "expense_agriculture", 216, 235], ["income_business", "expense_business", 238, 257],
      ["income_rental", "expense_rental", 260, 279], ["income_other", "expense_other", 283, 310],
      ["income_social", "expense_social", 316, 335]
    ].forEach(([incomeKey, expenseKey, top, bottom]) => {
      draw(p2, amount(data[incomeKey]), 223, top, 148, bottom - top, { size: 8 });
      draw(p2, amount(data[expenseKey]), 378, top, 148, bottom - top, { size: 8 });
    });
    whiteout(p2, 279, 457, 24, 15);
    whiteout(p2, 217, 468, 22, 13);
    draw(p2, data.tax_year, 281, 459, 20, 11, { size: 7, padding: 1 });
    draw(p2, data.tax_year, 219, 470, 18, 9, { size: 6.5, padding: 1 });
    draw(p2, amount(totalAssets(data)), 378, 505, 148, 16, { size: 8 });
    [
      ["asset_land_details", "asset_land_value", 549, 568], ["asset_house_details", "asset_house_value", 571, 590],
      ["asset_agriculture_details", "asset_agriculture_value", 593, 612], ["asset_real_property_details", "asset_real_property_value", 615, 643],
      ["asset_other_details", "asset_other_value", 650, 698]
    ].forEach(([detailKey, valueKey, top, bottom]) => {
      draw(p2, data[detailKey], 223, top, 148, bottom - top, { size: 7.3, bold: false });
      draw(p2, amount(data[valueKey]), 378, top, 148, bottom - top, { size: 8 });
    });
    mark(p2, bold, data.assets_sufficient === "yes", 467, 733);
    mark(p2, bold, data.assets_sufficient === "no", 513, 733);

    // Page 3 - support details.
    draw(p3, String(data.support_start_month || "").padStart(2, "0"), 439, 113, 41, 9, { size: 7, padding: 1 });
    draw(p3, data.support_start_year, 486, 113, 40, 9, { size: 7, padding: 1 });
    draw(p3, data.payment_method_explanation, 223, 129, 303, 84, { size: 8, bold: false });
    draw(p3, data.prior_subsistence, 223, 221, 303, 80, { size: 8, bold: false });
    mark(p3, bold, data.lives_with_supported_people === "yes", 467, 337);
    mark(p3, bold, data.lives_with_supported_people === "no", 513, 337);
    draw(p3, data.lives_with_supported_people === "yes" ? data.co_supported_people_details : "No / Nein", 223, 354, 303, 60, { size: 8, bold: false });
    mark(p3, bold, data.other_supporters_exist === "yes", 467, 450);
    mark(p3, bold, data.other_supporters_exist === "no", 513, 450);
    draw(p3, data.other_supporters_exist === "yes" ? supportersText(data.other_supporters) : "No / Nein", 223, 467, 303, 69, { size: 8, bold: false });
    draw(p3, data.employment_limitation_reason, 223, 545, 303, 124, { size: 8, bold: false });

    pdf.setTitle(`Maintenance declaration ${clean(data.tax_year)}`);
    pdf.setSubject("Unterhaltserklaerung under section 33a EStG");
    pdf.setAuthor(joined([data.applicant_first_name, data.applicant_last_name]));
    pdf.setCreator("Guided Maintenance Declaration");
    return pdf.save();
  }

  async function downloadMaintenancePdf(data) {
    const bytes = await createMaintenancePdf(data);
    const person = joined([data.recipient_first_name, data.recipient_last_name], "-")
      .toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "supported-person";
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `maintenance-declaration-${person}-${clean(data.tax_year) || "draft"}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return bytes;
  }

  window.createMaintenancePdf = createMaintenancePdf;
  window.downloadMaintenancePdf = downloadMaintenancePdf;
})();
