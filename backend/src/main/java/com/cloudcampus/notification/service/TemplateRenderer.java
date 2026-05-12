package com.cloudcampus.notification.service;

import com.cloudcampus.notification.entity.NotificationTemplateCode;

import java.util.Map;

/**
 * Builds email subject + HTML/plain-text body from a {@link NotificationTemplateCode}
 * and caller-supplied variables.
 *
 * Design decisions:
 *  - Code-based templates (no DB template table) keep E12 simple and testable.
 *  - All templates produce both an HTML body (rich clients) and a plain-text
 *    fallback (basic email clients and SMS).
 *  - Variables are looked up via {@code vars.getOrDefault(key, fallback)} —
 *    missing keys silently degrade rather than throwing.
 *
 * Variable keys per template:
 *  FEE_RECEIPT      → studentName, receiptNumber, amount, paymentDate, schoolName
 *  FEE_REMINDER     → studentName, amount, dueDate, schoolName
 *  WELCOME_STUDENT  → studentName, schoolName
 *  ATTENDANCE_ALERT → studentName, date, schoolName
 *  GENERIC          → subject, body
 */
final class TemplateRenderer {

    private TemplateRenderer() {}

    // ── Result carrier ───────────────────────────────────────────────────────

    record RenderedEmail(String subject, String htmlBody, String plainText) {}

    // ── Dispatcher ───────────────────────────────────────────────────────────

    static RenderedEmail render(NotificationTemplateCode code, Map<String, String> vars) {
        return switch (code) {
            case FEE_RECEIPT      -> renderFeeReceipt(vars);
            case FEE_REMINDER     -> renderFeeReminder(vars);
            case WELCOME_STUDENT  -> renderWelcomeStudent(vars);
            case ATTENDANCE_ALERT -> renderAttendanceAlert(vars);
            case GENERIC          -> renderGeneric(vars);
        };
    }

    // ── Template implementations ─────────────────────────────────────────────

    private static RenderedEmail renderFeeReceipt(Map<String, String> vars) {
        String studentName   = vars.getOrDefault("studentName",   "Student");
        String receiptNumber = vars.getOrDefault("receiptNumber", "—");
        String amount        = vars.getOrDefault("amount",        "0");
        String paymentDate   = vars.getOrDefault("paymentDate",   "");
        String schoolName    = vars.getOrDefault("schoolName",    "School");

        String subject = "Fee Receipt " + receiptNumber + " — " + schoolName;

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
                  <h2 style="color:#0f766e">Fee Payment Receipt</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Your fee payment has been recorded successfully. Please keep this receipt for your records.</p>
                  <table border="0" cellpadding="8" cellspacing="0"
                         style="border-collapse:collapse;width:100%%;border:1px solid #e2e8f0;margin:16px 0">
                    <tr style="background:#f0fdf4">
                      <th style="text-align:left;border:1px solid #e2e8f0">Receipt No.</th>
                      <td style="border:1px solid #e2e8f0">%s</td>
                    </tr>
                    <tr>
                      <th style="text-align:left;border:1px solid #e2e8f0">Amount Paid</th>
                      <td style="border:1px solid #e2e8f0">₹%s</td>
                    </tr>
                    <tr style="background:#f0fdf4">
                      <th style="text-align:left;border:1px solid #e2e8f0">Date</th>
                      <td style="border:1px solid #e2e8f0">%s</td>
                    </tr>
                    <tr>
                      <th style="text-align:left;border:1px solid #e2e8f0">School</th>
                      <td style="border:1px solid #e2e8f0">%s</td>
                    </tr>
                  </table>
                  <p style="color:#6b7280;font-size:13px">Thank you for your prompt payment.</p>
                </body>
                </html>
                """.formatted(studentName, receiptNumber, amount, paymentDate, schoolName);

        String plain = "Dear " + studentName + "," + System.lineSeparator()
                + "Fee receipt " + receiptNumber + " for ₹" + amount
                + " on " + paymentDate + " has been issued by " + schoolName + "."
                + System.lineSeparator() + "Thank you.";

        return new RenderedEmail(subject, html, plain);
    }

    private static RenderedEmail renderFeeReminder(Map<String, String> vars) {
        String studentName = vars.getOrDefault("studentName", "Student");
        String amount      = vars.getOrDefault("amount",      "0");
        String dueDate     = vars.getOrDefault("dueDate",     "");
        String schoolName  = vars.getOrDefault("schoolName",  "School");

        String subject = "Fee Due Reminder — " + schoolName;

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
                  <h2 style="color:#b45309">Fee Due Reminder</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>This is a reminder that a fee of <strong>₹%s</strong> is due on <strong>%s</strong>.</p>
                  <p>Please make your payment at the earliest to avoid late charges.</p>
                  <p style="color:#6b7280;font-size:13px">— %s</p>
                </body>
                </html>
                """.formatted(studentName, amount, dueDate, schoolName);

        String plain = "Dear " + studentName + ", fee of ₹" + amount
                + " is due on " + dueDate + ". Please pay at the earliest. — " + schoolName;

        return new RenderedEmail(subject, html, plain);
    }

    private static RenderedEmail renderWelcomeStudent(Map<String, String> vars) {
        String studentName = vars.getOrDefault("studentName", "Student");
        String schoolName  = vars.getOrDefault("schoolName",  "School");

        String subject = "Welcome to " + schoolName + "!";

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
                  <h2 style="color:#0f766e">Welcome to %s!</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>We are delighted to confirm your admission. Welcome to our school family!</p>
                  <p>Please visit the school office to collect your ID card and schedule book.</p>
                  <p style="color:#6b7280;font-size:13px">We look forward to a great journey ahead.</p>
                </body>
                </html>
                """.formatted(schoolName, studentName);

        String plain = "Dear " + studentName + ", welcome to " + schoolName + "!"
                + " Your admission is confirmed. We look forward to a great journey ahead.";

        return new RenderedEmail(subject, html, plain);
    }

    private static RenderedEmail renderAttendanceAlert(Map<String, String> vars) {
        String studentName = vars.getOrDefault("studentName", "Student");
        String date        = vars.getOrDefault("date",        "");
        String schoolName  = vars.getOrDefault("schoolName",  "School");

        String subject = "Attendance Alert — " + studentName + " marked Absent";

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
                  <h2 style="color:#dc2626">Attendance Alert</h2>
                  <p>Dear Parent / Guardian,</p>
                  <p><strong>%s</strong> was marked <strong style="color:#dc2626">Absent</strong> on <strong>%s</strong> at %s.</p>
                  <p>If this is incorrect, please contact the class teacher.</p>
                </body>
                </html>
                """.formatted(studentName, date, schoolName);

        String plain = studentName + " was marked Absent on " + date + " at " + schoolName
                + ". Please contact the class teacher if this is incorrect.";

        return new RenderedEmail(subject, html, plain);
    }

    private static RenderedEmail renderGeneric(Map<String, String> vars) {
        String subject  = vars.getOrDefault("subject", "Notification from School");
        String bodyText = vars.getOrDefault("body",    "");

        String html = "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif\">"
                + "<p>" + bodyText.replace("\n", "<br>") + "</p></body></html>";

        return new RenderedEmail(subject, html, bodyText);
    }
}
