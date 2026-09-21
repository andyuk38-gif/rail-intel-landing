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
  "storage-80-warning": "account",
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
  "storage-80-warning": "Storage warning (80% usage)",
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

const templates = extractTemplatesObject(readFileSync(vaultServer, "utf8"));
const previewVars = extractPreviewVars(readFileSync(vaultEmailPage, "utf8"));

const entries = Object.entries(templates).map(([key, tpl]) => ({
  key,
  label: LABELS[key] || key.replace(/-/g, " ").replace(/_/g, " "),
  category: CATEGORY_BY_KEY[key] || "instant",
  subject: tpl.subject,
  html: tpl.html,
  previewVars: { ...DEFAULT_PREVIEW, ...(previewVars[key] || {}) },
}));

writeFileSync(
  outFile,
  `/** Generated by scripts/sync-email-templates.mjs — do not edit by hand. */\nexport const emailTemplates = ${JSON.stringify(entries, null, 2)};\n`,
  "utf8"
);

console.log(`Wrote ${entries.length} templates to ${outFile}`);
