(function () {
  "use strict";

  const STORAGE_KEY = "maintenance-declaration-v1";
  const form = document.getElementById("maintenance-form");
  const steps = Array.from(document.querySelectorAll(".form-step"));
  const stepLinks = Array.from(document.querySelectorAll(".step-link"));
  const progressRing = document.querySelector(".progress-ring");
  const progressPercent = document.getElementById("progress-percent");
  const saveStatus = document.getElementById("save-status");
  const reviewContent = document.getElementById("review-content");
  const validationSummary = document.getElementById("validation-summary");
  const printDocument = document.getElementById("print-document");
  const toast = document.getElementById("toast");
  let currentStep = 1;
  let language = "en";
  let saveTimer;
  let toastTimer;

  const i18n = {
    en: {
      saved: "Saved locally",
      saving: "Saving…",
      clearConfirm: "Clear every answer saved in this browser? This cannot be undone.",
      cleared: "All answers cleared",
      validationTitle: "A few required answers are still missing",
      validationIntro: "Complete the highlighted fields before printing:",
      readyTitle: "The required fields are complete",
      readyText: "Review the details carefully and prepare the evidence listed in step 5.",
      requiredField: "Required field",
      declarationMissing: "Confirm the declaration",
      downloadComplete: "Answers downloaded",
      printBlocked: "Please complete the required fields and declaration first.",
      noAnswer: "Not provided",
      yes: "Yes",
      no: "No",
      edit: "Edit",
      section1: "Taxpayer and period",
      section2: "Supported person",
      section3: "Financial situation",
      section4: "Support details",
      section5: "Evidence checklist",
      taxpayer: "Taxpayer",
      address: "Address",
      calendarYear: "Calendar year",
      supportedPerson: "Supported person",
      birth: "Date / place of birth",
      recipientAddress: "Address and country",
      relationship: "Relationship",
      maritalStatus: "Marital status",
      work: "Occupation / employment",
      household: "Other household members",
      currency: "Home currency",
      totalIncome: "Total declared income",
      totalExpenses: "Total declared expenses",
      totalAssets: "Total declared assets",
      assetsSufficient: "Assets sufficient for subsistence",
      supportStart: "Support first received",
      paymentRoute: "How payments were made",
      priorSupport: "Prior means of subsistence",
      sharedRecipients: "Other supported household members",
      otherSupporters: "Other supporters",
      workReason: "Reason for limited employment",
      evidenceReady: "Items marked ready",
      financialSource: "Source",
      income: "Income",
      expenses: "Expenses",
      asset: "Asset",
      details: "Details",
      value: "Value",
      declarationTitle: "Maintenance declaration",
      declarationSubtitle: "Unterhaltserklärung for calendar year",
      authorityTitle: "Confirmation by relevant local / registration authority abroad",
      authorityStatement: "The personal details concerning the supported person are correct according to our records.",
      authorityStamp: "Official stamp and signature",
      recipientSignature: "Signature of the supported person",
      locationDate: "Location, date",
      warning: "The supported person declares that all information is true and complete. Incorrect information may lead to penalties and administrative fines.",
      generated: "Generated from the guided maintenance declaration. Attach supporting evidence and Anlage Unterhalt as required.",
      none: "None",
      status: { single: "Single", married: "Married", widowed: "Widowed", divorced: "Divorced" },
      frequency: { regular: "Regularly employed", occasional: "Occasionally employed", none: "Not employed" },
      relationshipValues: { parent: "Parent", grandparent: "Grandparent", child: "Child", grandchild: "Grandchild", spouse: "Spouse / registered partner", former_spouse: "Former spouse / partner", other_parent: "Other parent of a non-marital child", other: "Other" },
      months: ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    de: {
      saved: "Lokal gespeichert",
      saving: "Wird gespeichert…",
      clearConfirm: "Alle in diesem Browser gespeicherten Antworten löschen? Dies kann nicht rückgängig gemacht werden.",
      cleared: "Alle Antworten gelöscht",
      validationTitle: "Einige Pflichtangaben fehlen noch",
      validationIntro: "Vervollständigen Sie vor dem Drucken die markierten Felder:",
      readyTitle: "Alle Pflichtfelder sind ausgefüllt",
      readyText: "Prüfen Sie die Angaben sorgfältig und bereiten Sie die in Schritt 5 aufgeführten Nachweise vor.",
      requiredField: "Pflichtfeld",
      declarationMissing: "Versicherung bestätigen",
      downloadComplete: "Antworten heruntergeladen",
      printBlocked: "Bitte füllen Sie zuerst alle Pflichtfelder aus und bestätigen Sie die Versicherung.",
      noAnswer: "Keine Angabe",
      yes: "Ja",
      no: "Nein",
      edit: "Bearbeiten",
      section1: "Steuerpflichtige Person und Zeitraum",
      section2: "Unterstützte Person",
      section3: "Wirtschaftliche Verhältnisse",
      section4: "Angaben zur Unterstützung",
      section5: "Nachweise",
      taxpayer: "Steuerpflichtige Person",
      address: "Anschrift",
      calendarYear: "Kalenderjahr",
      supportedPerson: "Unterstützte Person",
      birth: "Geburtsdatum / -ort",
      recipientAddress: "Anschrift und Staat",
      relationship: "Verwandtschaftsverhältnis",
      maritalStatus: "Familienstand",
      work: "Beruf / Erwerbstätigkeit",
      household: "Weitere Haushaltsmitglieder",
      currency: "Landeswährung",
      totalIncome: "Angegebene Einnahmen gesamt",
      totalExpenses: "Angegebene Ausgaben gesamt",
      totalAssets: "Angegebenes Vermögen gesamt",
      assetsSufficient: "Vermögen reicht für Lebensunterhalt",
      supportStart: "Erstmalige Unterstützung",
      paymentRoute: "Zahlungsweg",
      priorSupport: "Frühere Bestreitung des Lebensunterhalts",
      sharedRecipients: "Andere unterstützte Haushaltsmitglieder",
      otherSupporters: "Weitere unterstützende Personen",
      workReason: "Grund für eingeschränkte Erwerbstätigkeit",
      evidenceReady: "Als vorhanden markiert",
      financialSource: "Quelle",
      income: "Einnahmen",
      expenses: "Ausgaben",
      asset: "Vermögensart",
      details: "Erläuterungen",
      value: "Wert",
      declarationTitle: "Unterhaltserklärung",
      declarationSubtitle: "Maintenance declaration für das Kalenderjahr",
      authorityTitle: "Bestätigung der ausländischen Gemeinde- / Meldebehörde",
      authorityStatement: "Die persönlichen Angaben zur unterstützten Person entsprechen nach unseren Unterlagen der Wahrheit.",
      authorityStamp: "Dienstsiegel und Unterschrift",
      recipientSignature: "Unterschrift der unterstützten Person",
      locationDate: "Ort, Datum",
      warning: "Die unterstützte Person versichert, dass alle Angaben wahrheitsgemäß und vollständig sind. Unrichtige Angaben können straf- und bußgeldrechtliche Folgen haben.",
      generated: "Erstellt mit der geführten Unterhaltserklärung. Erforderliche Nachweise und die Anlage Unterhalt sind beizufügen.",
      none: "Keine",
      status: { single: "Ledig", married: "Verheiratet", widowed: "Verwitwet", divorced: "Geschieden" },
      frequency: { regular: "Regelmäßig berufstätig", occasional: "Gelegentlich berufstätig", none: "Nicht berufstätig" },
      relationshipValues: { parent: "Elternteil", grandparent: "Großelternteil", child: "Kind", grandchild: "Enkelkind", spouse: "Ehegatte / eingetragener Lebenspartner", former_spouse: "Früherer Ehegatte / Lebenspartner", other_parent: "Anderer Elternteil eines nichtehelichen Kindes", other: "Sonstige Person" },
      months: ["", "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    }
  };

  const reviewSections = [
    { step: 1, title: "section1", items: [
      ["taxpayer", () => joinValues([value("applicant_title"), value("applicant_first_name"), value("applicant_last_name")])],
      ["address", () => formatAddress("applicant")],
      ["calendarYear", () => value("tax_year")]
    ]},
    { step: 2, title: "section2", items: [
      ["supportedPerson", () => joinValues([value("recipient_first_name"), value("recipient_last_name")])],
      ["birth", () => joinValues([formatDate(value("recipient_birth_date")), value("recipient_birth_place")], " · ")],
      ["recipientAddress", () => joinValues([formatAddress("recipient"), value("recipient_country")], " · ")],
      ["relationship", () => t().relationshipValues[value("recipient_relationship")] || value("recipient_relationship")],
      ["maritalStatus", () => t().status[value("recipient_marital_status")] || ""],
      ["work", () => joinValues([value("recipient_occupation"), t().frequency[value("recipient_employment_frequency")] || ""], " · ")],
      ["household", () => formatRows("household-people", ["name", "relationship", "age"])]
    ]},
    { step: 3, title: "section3", items: [
      ["currency", () => value("home_currency")],
      ["totalIncome", () => money(totalByPrefix("income_"))],
      ["totalExpenses", () => money(totalByPrefix("expense_"))],
      ["totalAssets", () => money(totalAssetValues())],
      ["assetsSufficient", () => yesNo(value("assets_sufficient"))]
    ]},
    { step: 4, title: "section4", items: [
      ["supportStart", () => formatSupportStart()],
      ["paymentRoute", () => value("payment_method_explanation")],
      ["priorSupport", () => value("prior_subsistence")],
      ["sharedRecipients", () => value("lives_with_supported_people") === "yes" ? value("co_supported_people_details") : t().no],
      ["otherSupporters", () => value("other_supporters_exist") === "yes" ? formatRows("other-supporters", ["name", "address", "amount"]) : t().no],
      ["workReason", () => value("employment_limitation_reason")]
    ]},
    { step: 5, title: "section5", items: [
      ["evidenceReady", () => `${document.querySelectorAll('.evidence-item input:checked').length} / ${document.querySelectorAll('.evidence-item input').length}`]
    ]}
  ];

  function t() { return i18n[language]; }

  function value(name) {
    const controls = form.elements[name];
    if (!controls) return "";
    if (typeof controls.length === "number" && !controls.tagName) {
      const checked = Array.from(controls).find((control) => control.checked);
      return checked ? checked.value : "";
    }
    if (controls.type === "checkbox") return controls.checked;
    return String(controls.value || "").trim();
  }

  function joinValues(values, separator = " ") { return values.filter(Boolean).join(separator); }

  function formatAddress(prefix) {
    return joinValues([
      value(`${prefix}_street`),
      joinValues([value(`${prefix}_postal_code`), value(`${prefix}_city`)])
    ], ", ");
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-GB").format(date);
  }

  function formatSupportStart() {
    const month = Number(value("support_start_month"));
    return joinValues([t().months[month] || "", value("support_start_year")]);
  }

  function yesNo(input) {
    if (!input) return "";
    return input === "yes" ? t().yes : t().no;
  }

  function money(number) {
    const currency = value("home_currency") || "";
    return `${new Intl.NumberFormat(language === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)}${currency ? ` ${currency}` : ""}`;
  }

  function totalByPrefix(prefix) {
    return Array.from(form.querySelectorAll(`[name^="${prefix}"]`)).reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  }

  function totalAssetValues() {
    return Array.from(form.querySelectorAll('[name^="asset_"][name$="_value"]')).reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  }

  function serializeRows(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} .repeatable-row`)).map((row) => {
      const result = {};
      row.querySelectorAll("[data-field]").forEach((input) => { result[input.dataset.field] = input.value; });
      return result;
    });
  }

  function formatRows(containerId, fields) {
    const rows = serializeRows(containerId).filter((row) => fields.some((field) => row[field]));
    return rows.map((row) => fields.map((field) => row[field]).filter(Boolean).join(" · ")).join("\n");
  }

  function serializeForm() {
    const data = {};
    new FormData(form).forEach((entry, key) => { data[key] = entry; });
    form.querySelectorAll('input[type="checkbox"]').forEach((input) => { data[input.name] = input.checked; });
    data.household_people = serializeRows("household-people");
    data.other_supporters = serializeRows("other-supporters");
    data.language = language;
    data.saved_at = new Date().toISOString();
    return data;
  }

  function restoreForm(data) {
    if (!data || typeof data !== "object") return;
    if (Array.isArray(data.household_people)) data.household_people.forEach((row) => addRepeatableRow("household-person-template", "household-people", row));
    if (Array.isArray(data.other_supporters)) data.other_supporters.forEach((row) => addRepeatableRow("supporter-template", "other-supporters", row));

    Object.entries(data).forEach(([name, storedValue]) => {
      if (["household_people", "other_supporters", "language", "saved_at"].includes(name)) return;
      const controls = form.elements[name];
      if (!controls) return;
      const controlList = controls instanceof RadioNodeList ? Array.from(controls) : [controls];
      controlList.forEach((control) => {
        if (control.type === "radio") control.checked = control.value === storedValue;
        else if (control.type === "checkbox") control.checked = Boolean(storedValue);
        else control.value = storedValue;
      });
    });
    if (data.language === "de") setLanguage("de");
  }

  function saveForm() {
    clearTimeout(saveTimer);
    saveStatus.textContent = t().saving;
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeForm()));
      saveStatus.textContent = t().saved;
    }, 350);
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = language;
    document.querySelectorAll("[data-en][data-de]").forEach((element) => {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll("[data-placeholder-en][data-placeholder-de]").forEach((element) => {
      element.placeholder = element.dataset[`placeholder${language === "en" ? "En" : "De"}`];
    });
    document.querySelectorAll(".language-button").forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateCurrencyOutputs();
    if (currentStep === 6) renderReview();
    saveStatus.textContent = t().saved;
    saveForm();
  }

  function showStep(stepNumber, shouldValidate = false) {
    if (shouldValidate && !validateStep(currentStep)) return;
    currentStep = Number(stepNumber);
    steps.forEach((step) => step.classList.toggle("is-active", Number(step.dataset.step) === currentStep));
    stepLinks.forEach((link) => link.classList.toggle("is-active", Number(link.dataset.stepTarget) === currentStep));
    if (currentStep === 6) renderReview();
    window.scrollTo({ top: document.querySelector(".form-shell").offsetTop - 92, behavior: "smooth" });
  }

  function validateStep(stepNumber) {
    const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    const required = Array.from(step.querySelectorAll("[required]"));
    let firstInvalid = null;
    required.forEach((control) => {
      const valid = control.checkValidity();
      if (control.type !== "radio" || control.checked || !step.querySelector(`[name="${control.name}"]:checked`)) {
        control.setAttribute("aria-invalid", String(!valid));
      }
      if (!valid && !firstInvalid) firstInvalid = control;
    });
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function requiredIssues(includeDeclaration = true) {
    const issues = [];
    const seen = new Set();
    form.querySelectorAll("[required]").forEach((control) => {
      if (!includeDeclaration && control.name === "declaration_confirmed") return;
      if (!control.checkValidity() && !seen.has(control.name)) {
        seen.add(control.name);
        const step = control.closest(".form-step");
        const field = control.closest(".field, .choice-field, .declaration-check");
        const label = field?.querySelector("b")?.textContent || (control.name === "declaration_confirmed" ? t().declarationMissing : t().requiredField);
        issues.push({ name: control.name, label, step: Number(step.dataset.step) });
      }
    });
    return issues;
  }

  function updateProgress() {
    const required = Array.from(form.querySelectorAll("[required]")).filter((input) => input.name !== "declaration_confirmed");
    const uniqueNames = [...new Set(required.map((input) => input.name))];
    const complete = uniqueNames.filter((name) => {
      const controls = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
      return Array.from(controls).some((control) => control.checkValidity() && (control.type !== "radio" || control.checked));
    }).length;
    const percent = uniqueNames.length ? Math.round((complete / uniqueNames.length) * 100) : 0;
    progressRing.style.setProperty("--progress", percent);
    progressPercent.textContent = `${percent}%`;
    stepLinks.forEach((link) => {
      const stepNumber = Number(link.dataset.stepTarget);
      const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
      const stepRequired = Array.from(step.querySelectorAll("[required]")).filter((input) => input.name !== "declaration_confirmed");
      const stepComplete = stepRequired.length > 0 && stepRequired.every((control) => control.checkValidity() || (control.type === "radio" && Boolean(step.querySelector(`[name="${control.name}"]:checked`))));
      link.classList.toggle("is-complete", stepComplete);
    });
  }

  function updateConditionalPanels() {
    const coSupported = value("lives_with_supported_people") === "yes";
    const otherSupporters = value("other_supporters_exist") === "yes";
    document.getElementById("co-supported-details").classList.toggle("is-visible", coSupported);
    document.getElementById("other-supporters-panel").classList.toggle("is-visible", otherSupporters);
    form.elements.co_supported_people_details.required = coSupported;
    if (otherSupporters && !document.querySelector("#other-supporters .repeatable-row")) addRepeatableRow("supporter-template", "other-supporters");
    document.querySelectorAll("#other-supporters [data-field]").forEach((input) => { input.required = otherSupporters; });
  }

  function updateCurrencyOutputs() {
    document.querySelectorAll(".currency-output").forEach((element) => { element.textContent = value("home_currency") || "—"; });
    document.getElementById("asset-total").textContent = new Intl.NumberFormat(language === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAssetValues());
  }

  function addRepeatableRow(templateId, containerId, values = {}) {
    const template = document.getElementById(templateId);
    const container = document.getElementById(containerId);
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector(".repeatable-row");
    container.appendChild(fragment);
    const addedRow = container.lastElementChild;
    addedRow.querySelectorAll("[data-field]").forEach((input) => {
      const index = Array.from(container.children).indexOf(addedRow);
      input.name = `${containerId.replaceAll("-", "_")}[${index}][${input.dataset.field}]`;
      input.value = values[input.dataset.field] || "";
    });
    renumberRows(container);
    return row;
  }

  function renumberRows(container) {
    Array.from(container.children).forEach((row, index) => {
      row.querySelector(".row-index").textContent = String(index + 1).padStart(2, "0");
      row.querySelectorAll("[data-field]").forEach((input) => { input.name = `${container.id.replaceAll("-", "_")}[${index}][${input.dataset.field}]`; });
    });
  }

  function renderReview() {
    const issues = requiredIssues(false);
    if (issues.length) {
      validationSummary.className = "validation-summary is-visible";
      validationSummary.innerHTML = `<strong>${escapeHtml(t().validationTitle)}</strong><span>${escapeHtml(t().validationIntro)}</span><ul>${issues.map((issue) => `<li><button type="button" class="review-edit" data-review-step="${issue.step}">${escapeHtml(issue.label)}</button></li>`).join("")}</ul>`;
    } else {
      validationSummary.className = "validation-summary is-visible is-ready";
      validationSummary.innerHTML = `<strong>${escapeHtml(t().readyTitle)}</strong><span>${escapeHtml(t().readyText)}</span>`;
    }

    reviewContent.innerHTML = reviewSections.map((section) => `
      <section class="review-section">
        <header class="review-header"><h3>${escapeHtml(t()[section.title])}</h3><button type="button" class="review-edit" data-review-step="${section.step}">${escapeHtml(t().edit)}</button></header>
        <dl class="review-grid">${section.items.map(([labelKey, getValue]) => {
          const displayValue = getValue();
          return `<div class="review-item"><dt>${escapeHtml(t()[labelKey])}</dt><dd class="${displayValue ? "" : "review-empty"}">${escapeHtml(displayValue || t().noAnswer)}</dd></div>`;
        }).join("")}</dl>
      </section>`).join("");
  }

  function buildPrintDocument() {
    const currency = value("home_currency") || "";
    const incomeRows = [
      ["Wage / salary · Arbeitslohn", "income_wages", "expense_wages"], ["Pension · Rente / Pension", "income_pension", "expense_pension"],
      ["Agriculture · Landwirtschaft", "income_agriculture", "expense_agriculture"], ["Trade / independent activity · Gewerbe / selbständige Tätigkeit", "income_business", "expense_business"],
      ["Rental and lease · Vermietung und Verpachtung", "income_rental", "expense_rental"], ["Other income · Andere Einnahmen", "income_other", "expense_other"],
      ["Social benefits · Sozialleistungen", "income_social", "expense_social"]
    ];
    const assetRows = [
      ["Land owned · Grundbesitz", "asset_land_details", "asset_land_value"], ["Own house · Eigenes Haus", "asset_house_details", "asset_house_value"],
      ["Agricultural property · Landwirtschaft", "asset_agriculture_details", "asset_agriculture_value"], ["Further real property · Weiterer Grundbesitz", "asset_real_property_details", "asset_real_property_value"],
      ["Other assets · Sonstiges Vermögen", "asset_other_details", "asset_other_value"]
    ];
    const householdRows = serializeRows("household-people").filter((row) => row.name || row.relationship || row.age);
    const supporterRows = serializeRows("other-supporters").filter((row) => row.name || row.address || row.amount);

    printDocument.innerHTML = `
      <article class="print-page">
        <h1 class="print-title">${escapeHtml(t().declarationTitle)} ${escapeHtml(value("tax_year"))}</h1>
        <p class="print-subtitle">${escapeHtml(t().declarationSubtitle)} ${escapeHtml(value("tax_year"))}</p>
        ${printSection("Applicant / Antragsteller", [
          ["Name / Name", joinValues([value("applicant_title"), value("applicant_first_name"), value("applicant_last_name")])],
          ["Address in Germany / Anschrift in Deutschland", formatAddress("applicant")]
        ])}
        ${printSection("A. Personal details / Persönliche Angaben", [
          ["Supported person / Unterstützte Person", joinValues([value("recipient_first_name"), value("recipient_last_name")])],
          ["Date and place of birth / Geburtsdatum und -ort", joinValues([formatDate(value("recipient_birth_date")), value("recipient_birth_place")], " · ")],
          ["Address / Wohnort", joinValues([formatAddress("recipient"), value("recipient_country")], " · ")],
          ["Relationship / Verwandtschaftsverhältnis", t().relationshipValues[value("recipient_relationship")] || value("recipient_relationship")],
          ["Marital status / Familienstand", t().status[value("recipient_marital_status")] || ""],
          ["Occupation / Berufliche Tätigkeit", joinValues([value("recipient_occupation"), t().frequency[value("recipient_employment_frequency")] || ""], " · ")]
        ])}
        <section class="print-section"><h2>Household members / Weitere Haushaltsmitglieder</h2>${simpleTable(["Name", "Relationship / Verhältnis", "Age / Alter"], householdRows.map((row) => [row.name, row.relationship, row.age]))}</section>
        <div class="authority-box"><h3>${escapeHtml(t().authorityTitle)}</h3><p>${escapeHtml(t().authorityStatement)}</p><div class="print-signatures"><span class="signature-line">${escapeHtml(t().locationDate)}</span><span class="signature-line">${escapeHtml(t().authorityStamp)}</span></div></div>
        <p class="print-footer">1 / 4</p>
      </article>
      <article class="print-page">
        <h1 class="print-title">B. Economic situation / Wirtschaftliche Verhältnisse</h1>
        <section class="print-section"><h2>I. Income and expenditure / Einnahmen und Ausgaben (${escapeHtml(currency)})</h2>${simpleTable([t().financialSource, t().income, t().expenses], incomeRows.map(([label, incomeName, expenseName]) => [label, value(incomeName) || "0", value(expenseName) || "0"]))}<div class="print-field full"><span class="print-label">Notes / Erläuterungen</span><span class="print-value">${escapeHtml(value("financial_notes") || "—")}</span></div></section>
        <section class="print-section"><h2>II. Assets / Vermögen (${escapeHtml(currency)})</h2>${simpleTable([t().asset, t().details, t().value], assetRows.map(([label, detailsName, valueName]) => [label, value(detailsName), value(valueName) || "0"]))}<div class="print-grid"><div class="print-field"><span class="print-label">Total / Gesamtwert</span><span class="print-value">${escapeHtml(money(totalAssetValues()))}</span></div><div class="print-field"><span class="print-label">Sufficient for subsistence? / Reicht zur Bestreitung des Unterhalts aus?</span><span class="print-value">${escapeHtml(yesNo(value("assets_sufficient")))}</span></div></div></section>
        <p class="print-note"><strong>Evidence / Nachweise:</strong> Tax, pension, employment, social-benefit and asset records should be retained and provided to the tax office when requested.</p>
        <p class="print-footer">2 / 4</p>
      </article>
      <article class="print-page">
        <h1 class="print-title">C. Other details / Sonstige Angaben</h1>
        ${printSection("Support history / Verlauf der Unterstützung", [
          ["1. First support / Erstmalige Unterstützung", formatSupportStart()],
          ["2. How and by whom payments were made / Wie und durch wen die Zahlungen erfolgten", value("payment_method_explanation")],
          ["3. Subsistence before support / Lebensunterhalt vor Beginn der Unterstützung", value("prior_subsistence")]
        ], true)}
        ${printSection("Household and other supporters / Haushalt und weitere Unterstützer", [
          ["4. Other supported people in household / Andere unterstützte Personen im Haushalt", value("lives_with_supported_people") === "yes" ? value("co_supported_people_details") : t().no],
          ["5. Other supporters / Weitere unterstützende Personen", value("other_supporters_exist") === "yes" ? supporterRows.map((row) => joinValues([row.name, row.address, row.amount], " · ")).join("\n") : t().no],
          ["6. Reason for no / occasional work / Grund für keine / gelegentliche Berufstätigkeit", value("employment_limitation_reason")]
        ], true)}
        <section class="print-section"><h2>Prepared evidence / Vorbereitete Nachweise</h2><div class="print-field full"><span class="print-value">${escapeHtml(evidenceList())}</span></div></section>
        <p class="print-footer">3 / 4</p>
      </article>
      <article class="print-page">
        <h1 class="print-title">D. Declaration / Versicherung</h1>
        <p class="print-note">${escapeHtml(t().warning)}</p>
        <div class="print-signatures"><span class="signature-line">${escapeHtml(t().locationDate)}</span><span class="signature-line">${escapeHtml(t().recipientSignature)}</span></div>
        <section class="print-section" style="margin-top: 18mm"><h2>E. Notes / Erläuterungen</h2><div class="print-field full"><span class="print-value">1. A separate declaration is required for each supported person. / Für jede unterstützte Person ist eine eigene Erklärung erforderlich.<br><br>2. This declaration does not itself establish a legal claim to a tax deduction. The tax office may request additional evidence. / Diese Erklärung begründet keinen Rechtsanspruch auf eine Steuerermäßigung. Das Finanzamt kann weitere Nachweise verlangen.<br><br>3. Monetary support from 2025 onward generally requires bank transfer to an account belonging to the supported person. / Geldzuwendungen ab 2025 erfordern grundsätzlich eine Überweisung auf ein Konto der unterstützten Person.</span></div></section>
        <p class="print-footer">${escapeHtml(t().generated)} · 4 / 4</p>
      </article>`;
  }

  function printSection(title, fields, fullWidth = false) {
    return `<section class="print-section"><h2>${escapeHtml(title)}</h2><div class="print-grid">${fields.map(([label, fieldValue]) => `<div class="print-field${fullWidth ? " full" : ""}"><span class="print-label">${escapeHtml(label)}</span><span class="print-value">${escapeHtml(fieldValue || "—")}</span></div>`).join("")}</div></section>`;
  }

  function simpleTable(headers, rows) {
    const safeRows = rows.length ? rows : [[t().none, "", ""]];
    return `<table class="print-table"><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${safeRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell || "—")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function evidenceList() {
    const labels = Array.from(document.querySelectorAll(".evidence-item input:checked")).map((input) => input.closest(".evidence-item").querySelector("b").textContent);
    return labels.length ? labels.join("\n• ").replace(/^/, "• ") : t().none;
  }

  function downloadAnswers() {
    const data = serializeForm();
    const name = joinValues([value("recipient_first_name"), value("recipient_last_name")], "-").toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "supported-person";
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `maintenance-declaration-${name}-${value("tax_year") || "draft"}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(t().downloadComplete);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function escapeHtml(input) {
    return String(input ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  document.querySelectorAll(".language-button").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.language)));
  document.querySelectorAll(".next-step").forEach((button) => button.addEventListener("click", () => showStep(button.dataset.next, true)));
  document.querySelectorAll(".previous-step").forEach((button) => button.addEventListener("click", () => showStep(button.dataset.previous)));
  stepLinks.forEach((button) => button.addEventListener("click", () => showStep(button.dataset.stepTarget)));

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest(".add-row");
    if (addButton) {
      addRepeatableRow(addButton.dataset.template, addButton.dataset.container);
      saveForm();
    }
    const removeButton = event.target.closest(".remove-row");
    if (removeButton) {
      const container = removeButton.closest(".repeatable-list");
      removeButton.closest(".repeatable-row").remove();
      renumberRows(container);
      saveForm();
    }
    const reviewEdit = event.target.closest("[data-review-step]");
    if (reviewEdit) showStep(reviewEdit.dataset.reviewStep);
  });

  form.addEventListener("input", (event) => {
    event.target.removeAttribute("aria-invalid");
    updateConditionalPanels();
    updateCurrencyOutputs();
    updateProgress();
    saveForm();
  });
  form.addEventListener("change", () => { updateConditionalPanels(); updateProgress(); saveForm(); });

  document.getElementById("clear-form-button").addEventListener("click", () => {
    if (!window.confirm(t().clearConfirm)) return;
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    document.getElementById("household-people").replaceChildren();
    document.getElementById("other-supporters").replaceChildren();
    form.querySelectorAll('[type="number"][value="0"]').forEach((input) => { input.value = "0"; });
    form.elements.tax_year.value = new Date().getFullYear();
    updateConditionalPanels();
    updateCurrencyOutputs();
    updateProgress();
    showStep(1);
    showToast(t().cleared);
  });

  document.getElementById("download-json-button").addEventListener("click", downloadAnswers);
  document.getElementById("print-button").addEventListener("click", () => {
    const issues = requiredIssues(true);
    if (issues.length) {
      renderReview();
      showToast(t().printBlocked);
      const first = issues[0];
      if (first.name !== "declaration_confirmed") showStep(first.step);
      return;
    }
    buildPrintDocument();
    window.print();
  });

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    restoreForm(saved);
  } catch (error) {
    console.warn("Could not restore saved form", error);
  }

  if (!value("tax_year")) form.elements.tax_year.value = new Date().getFullYear();
  updateConditionalPanels();
  updateCurrencyOutputs();
  updateProgress();
})();
