/**
 * Extract DEFAULT_EMAIL_TEMPLATES from Rail-Vault/server.ts and write
 * content/email-templates.generated.mjs for the Communications Hub showcase.
 *
 * Run: node scripts/sync-email-templates.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vaultServer = join(root, "../Rail-Vault/server.ts");
const vaultEmailPage = join(root, "../Rail-Vault/src/EmailTemplatePage.tsx");
const outFile = join(root, "content/email-templates.generated.mjs");

function extractTemplatesObject(source) {
  const marker = "const DEFAULT_EMAIL_TEMPLATES";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("DEFAULT_EMAIL_TEMPLATES not found in Rail-Vault/server.ts");

  const valueStart = source.indexOf("> = {", start);
  const braceStart = valueStart >= 0 ? valueStart + 4 : source.indexOf("= {", start) + 2;
  let depth = 0;
  let end = -1;

  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end < 0) throw new Error("Could not find end of DEFAULT_EMAIL_TEMPLATES");

  const objectLiteral = source.slice(braceStart, end);
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${objectLiteral});`)();
}

function extractPreviewVars(source) {
  const marker = "const PREVIEW_VARS";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("PREVIEW_VARS not found in EmailTemplatePage.tsx");

  const braceStart = source.indexOf("{", start);
  let depth = 0;
  let end = -1;

  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end < 0) throw new Error("Could not find end of PREVIEW_VARS");

  let objectLiteral = source.slice(braceStart, end);
  objectLiteral = objectLiteral
    .replace(/\[COMPANY_ADMIN_INVITE_TEMPLATE_KEY\]/g, '"company_admin_invite"')
    .replace(/translateUi\(([^)]+)\)/g, "$1");

  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${objectLiteral});`)();
}

const CATEGORY_BY_KEY = {
  welcome: "account",
  company_admin_invite: "account",
  team_user_invite: "account",
  "password-reset": "account",
  "support-ticket-update": "account",
  "task_trial_ending_48h": "account",
  "employee-note-message": "instant",
  task_assigned: "instant",
  task_reopened: "instant",
  task_note_added: "instant",
  leave_request_submitted: "instant",
  leave_request_decision: "instant",
  leave_request_cancelled: "instant",
  leave_request_awarded_back: "instant",
  digital_cab_pass_issued: "instant",
  performance_support_plan_signature_required: "instant",
  trainee_driver_welcome: "instant",
  trainee_driver_trainer_feedback: "instant",
  trainee_driver_instructor_assigned: "instant",
  trainee_driver_instructor_unassigned: "instant",
  trainee_driver_instructor_gap: "instant",
  "assessment-window-open": "scheduled",
  "assessment-window-closing": "scheduled",
  "continuous-cycle-renewal-approaching": "scheduled",
  "continuous-cycle-renewal-blocked": "scheduled",
  "fatality-anniversary-7d-reminder": "scheduled",
  "licence-expiry-3m-reminder": "scheduled",
  "licence-expiry-6w-reminder": "scheduled",
  "licence-expiry-expired": "scheduled",
  trainee_driver_feedback_reminder: "scheduled",
};

const LABELS = {
  welcome: "Welcome email (new company)",
  "password-reset": "Password reset",
  "fatality-anniversary-7d-reminder": "Fatality incident — 7 days before anniversary",
  "licence-expiry-3m-reminder": "Licence expiry — 3 months",
  "licence-expiry-6w-reminder": "Licence expiry — 6 weeks (urgent)",
  "licence-expiry-expired": "Licence expired — take off track",
  company_admin_invite: "Company administrator welcome",
  team_user_invite: "Team user invitation",
  trainee_driver_welcome: "Trainee driver welcome",
  trainee_driver_instructor_assigned: "Trainee — instructor assigned",
  trainee_driver_instructor_unassigned: "Trainee — instructor unassigned",
  trainee_driver_instructor_gap: "Trainee — instructor gap alert",
  trainee_driver_trainer_feedback: "Trainee — trainer feedback ready",
  trainee_driver_feedback_reminder: "Trainee — feedback reminder (7 days)",
  performance_support_plan_signature_required: "Support plan — signature required",
  leave_request_submitted: "Leave request submitted",
  leave_request_decision: "Leave request decision",
  leave_request_cancelled: "Leave request cancelled",
  leave_request_awarded_back: "Holiday leave awarded back",
  "support-ticket-update": "Support ticket update",
  "employee-note-message": "Employee messaging — new message",
  digital_cab_pass_issued: "Digital cab pass issued",
  task_assigned: "Task assigned",
  task_reopened: "Task reopened",
  task_note_added: "Task update note",
  "assessment-window-open": "Assessment window open",
  "assessment-window-closing": "Assessment window closing soon",
  "continuous-cycle-renewal-approaching": "Continuous cycle renewal approaching",
  "continuous-cycle-renewal-blocked": "Continuous cycle renewal blocked",
  "task_trial_ending_48h": "Task module trial ending",
};

/** Templates synced from CMS but omitted from the landing-page showcase. */
const EXCLUDED_TEMPLATE_KEYS = new Set(["storage-80-warning"]);

const DEFAULT_PREVIEW = {
  loginUrl: "https://cms.railintel.co.uk",
  contactName: "Alex Manager",
  managerName: "Alex Manager",
  employeeName: "Sarah Mitchell",
  companyName: "Northern Rail Example",
  companyCode: "NR001",
  eventName: "Route knowledge assessment",
  cycleName: "Annual competence cycle",
  windowOpen: "1 Sep 2026",
  windowClose: "30 Sep 2026",
  expiryDate: "15 Oct 2026",
  pendingChecklist: "<li>Complete in-cab assessment</li><li>Confirm medical certificate on file</li>",
  blockReasons: "<li>Missed assessment event</li><li>Medical certificate expired</li>",
  openCdpNote: "An open competence development plan will carry forward on renewal.",
  roleTitle: "Assessing Manager",
  accessLevel: "Manager",
  userEmail: "alex.manager@northernrail.example",
  tempPassword: "TempPass123",
  addonsUrl: "https://cms.railintel.co.uk",
  trialEndsAt: "30 Sep 2026",
  licenceNumber: "TDL-48291",
  daysUntilExpiry: "42",
  assigneeName: "Sarah Mitchell",
  taskTitle: "Complete route knowledge refresh",
  taskSummaryLine: "Alex Manager assigned you a new task in Northern Rail Example.",
  dueDate: "15 Oct 2026",
  assignedByName: "Alex Manager",
  reopenedByName: "Alex Manager",
  reopenSummaryLine: "Alex Manager reopened this task. It is open again.",
  recipientName: "Alex Manager",
  authorName: "Sarah Mitchell",
  noteAt: "20 Sep 2026, 14:32",
  noteBody: "Completed section A of the workbook. Remaining sections scheduled for tomorrow.",
  resetLink: "https://cms.railintel.co.uk/reset?token=sample",
  usedPercent: "82%",
  usedStorage: "824 GB",
  availableStorage: "1 TB",
  adminName: "Alex Admin",
  adminJobTitle: "Head of Competence",
  adminEmail: "alex.admin@northernrail.example",
  nominatedByName: "Jamie Onboarding",
  nominatedByEmail: "jamie.onboarding@northernrail.example",
};

/** Faithful cab pass embed for the showcase — front matches the Digital Cab Passes page hero. */
function buildShowcaseCabPassCardHtml() {
  const frontPassSrc = "../images/screens/cab-passes/green-pass-issued-dark.png";
  const coReturn = "Example Rail Co, Manchester";
  const idno = "DRV001";

  return `<div style="margin:8px 0 20px 0;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Front of pass</p>
  <img src="${frontPassSrc}" alt="Green driving cab pass with photo and QR code" width="559" style="display:block;max-width:100%;height:auto;border:1px solid rgba(0,0,0,.15);border-radius:6px;" />
  <p style="margin:14px 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Reverse of pass</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="420" style="width:420px;max-width:100%;min-height:265px;border-collapse:collapse;background:#ffffff;border:1px solid rgba(0,0,0,.25);border-radius:6px;overflow:hidden;">
    <tr>
      <td style="padding:12px 14px;vertical-align:top;">
        <div style="text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;margin-bottom:8px;">Conditions of use</div>
        <ul style="margin:0;padding-left:16px;font-size:11px;line-height:1.4;color:#0f172a;">
          <li style="margin-bottom:5px;">The number of staff in the leading cab must not exceed limits set by company policy, unless specially authorised by a GREEN CAB PASS holder.</li>
          <li style="margin-bottom:5px;">This pass must be shown to the driver before entering the cab and at any other time as required.</li>
          <li style="margin-bottom:5px;">This pass must only be used by the person to whom it was issued. The holder must not interfere with any part of the cab, nor obstruct or distract the driver or guard.</li>
          <li>The holder may use it only when necessary for the proper performance of their duties. It remains the property of the issuing organisation and may be withdrawn without notice.</li>
        </ul>
        <p style="margin:10px 0 0;font-size:10px;color:#64748b;">If found please return to: ${coReturn}.</p>
        <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:11px;font-weight:600;color:#475569;">
          ID NO: <span style="font-weight:700;color:#000000;">${idno}</span>
        </div>
      </td>
    </tr>
  </table>
</div>`;
}

const templates = extractTemplatesObject(readFileSync(vaultServer, "utf8"));
const previewVars = extractPreviewVars(readFileSync(vaultEmailPage, "utf8"));

const entries = Object.entries(templates)
  .filter(([key]) => !EXCLUDED_TEMPLATE_KEYS.has(key))
  .map(([key, tpl]) => ({
  key,
  label: LABELS[key] || key.replace(/-/g, " ").replace(/_/g, " "),
  category: CATEGORY_BY_KEY[key] || "instant",
  subject: tpl.subject,
  html: tpl.html,
  previewVars: { ...DEFAULT_PREVIEW, ...(previewVars[key] || {}) },
}));

for (const entry of entries) {
  if (entry.key === "digital_cab_pass_issued") {
    entry.previewVars.passCardHtml = buildShowcaseCabPassCardHtml();
    entry.previewVars.validFrom = "1st August 2026";
    entry.previewVars.validTo = "1st August 2027";
  }
}

writeFileSync(
  outFile,
  `/** Generated by scripts/sync-email-templates.mjs — do not edit by hand. */\nexport const emailTemplates = ${JSON.stringify(entries, null, 2)};\n`,
  "utf8"
);

console.log(`Wrote ${entries.length} templates to ${outFile}`);
