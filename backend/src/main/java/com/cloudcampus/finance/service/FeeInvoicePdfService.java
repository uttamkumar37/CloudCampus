package com.cloudcampus.finance.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.finance.dto.FeeReceiptResponse;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Generates a PDF fee invoice for a given student fee record (CC-0904).
 * Uses OpenPDF (librepdf) — no AGPL constraints.
 */
@Service
public class FeeInvoicePdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final Color HEADER_BG  = new Color(30, 64, 175);   // blue-800
    private static final Color ROW_ALT    = new Color(243, 244, 246); // gray-100
    private static final Color LABEL_CLR  = new Color(107, 114, 128); // gray-500

    private final StudentFeeRecordRepository recordRepo;
    private final FeeService                  feeService;
    private final StudentRepository           studentRepo;
    private final SchoolRepository            schoolRepo;

    public FeeInvoicePdfService(StudentFeeRecordRepository recordRepo,
                                 FeeService feeService,
                                 StudentRepository studentRepo,
                                 SchoolRepository schoolRepo) {
        this.recordRepo  = recordRepo;
        this.feeService  = feeService;
        this.studentRepo = studentRepo;
        this.schoolRepo  = schoolRepo;
    }

    public byte[] generate(UUID recordId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        var record = recordRepo.findByIdAndTenantId(recordId, tenantId)
                .orElseThrow(() -> new NotFoundException("Fee record not found"));

        FeeReceiptResponse receipt = feeService.getReceipt(recordId);

        String studentName = studentRepo.findByIdAndTenantId(record.getStudentId(), tenantId)
                .map(s -> s.getFirstName() + " " + s.getLastName() + " (" + s.getStudentNumber() + ")")
                .orElse("Unknown Student");

        String schoolName = schoolRepo.findByIdFiltered(record.getSchoolId())
                .map(s -> s.getName())
                .orElse("CloudCampus School");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Header ────────────────────────────────────────────────────────
            Font schoolFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.WHITE);
            Font subFont     = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.WHITE);
            Font titleFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.WHITE);

            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{3f, 1.2f});

            PdfPCell schoolCell = new PdfPCell();
            schoolCell.setBackgroundColor(HEADER_BG);
            schoolCell.setBorder(0);
            schoolCell.setPadding(14);
            Paragraph schoolPara = new Paragraph(schoolName, schoolFont);
            schoolPara.add(new Phrase("\nFee Invoice", subFont));
            schoolCell.addElement(schoolPara);
            header.addCell(schoolCell);

            PdfPCell invCell = new PdfPCell();
            invCell.setBackgroundColor(HEADER_BG);
            invCell.setBorder(0);
            invCell.setPadding(14);
            invCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invNum = new Paragraph("INVOICE", titleFont);
            invNum.setAlignment(Element.ALIGN_RIGHT);
            invCell.addElement(invNum);
            Paragraph invId = new Paragraph("#" + recordId.toString().substring(0, 8).toUpperCase(), subFont);
            invId.setAlignment(Element.ALIGN_RIGHT);
            invCell.addElement(invId);
            header.addCell(invCell);

            doc.add(header);
            doc.add(spacer(10));

            // ── Student + Date info ───────────────────────────────────────────
            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            meta.setWidths(new float[]{1f, 1f});
            meta.setSpacingBefore(4);

            addMetaCell(meta, "Student", studentName, Element.ALIGN_LEFT);
            addMetaCell(meta, "Invoice Date", DATE_FMT.format(LocalDate.now()), Element.ALIGN_RIGHT);
            addMetaCell(meta, "Fee Category", receipt.categoryName(), Element.ALIGN_LEFT);
            String dueDateStr = receipt.dueDate() != null ? DATE_FMT.format(receipt.dueDate()) : "—";
            addMetaCell(meta, "Due Date", dueDateStr, Element.ALIGN_RIGHT);
            addMetaCell(meta, "Status", receipt.status().name(), Element.ALIGN_LEFT);
            addMetaCell(meta, "", "", Element.ALIGN_RIGHT);

            doc.add(meta);
            doc.add(spacer(14));

            // ── Summary table ─────────────────────────────────────────────────
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, LABEL_CLR);
            Paragraph summaryTitle = new Paragraph("SUMMARY", sectionFont);
            summaryTitle.setSpacingAfter(4);
            doc.add(summaryTitle);

            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(60);
            summary.setHorizontalAlignment(Element.ALIGN_LEFT);
            summary.setWidths(new float[]{2f, 1.2f});
            addSummaryRow(summary, "Amount Due",  fmt(receipt.amountDue()),  false);
            addSummaryRow(summary, "Discount",    "- " + fmt(receipt.discount()), false);
            addSummaryRow(summary, "Amount Paid", fmt(receipt.amountPaid()), false);
            addSummaryRow(summary, "Balance",     fmt(receipt.balance()),    true);
            doc.add(summary);
            doc.add(spacer(18));

            // ── Payments table ────────────────────────────────────────────────
            if (!receipt.payments().isEmpty()) {
                Paragraph paymentsTitle = new Paragraph("PAYMENT HISTORY", sectionFont);
                paymentsTitle.setSpacingAfter(4);
                doc.add(paymentsTitle);

                PdfPTable payments = new PdfPTable(5);
                payments.setWidthPercentage(100);
                payments.setWidths(new float[]{1.4f, 1f, 1.2f, 1.4f, 1.4f});

                addTableHeader(payments, "Date", "Amount", "Mode", "Receipt No.", "Reference");

                boolean alt = false;
                for (FeeReceiptResponse.PaymentLine p : receipt.payments()) {
                    Color bg = alt ? ROW_ALT : Color.WHITE;
                    addPaymentRow(payments, bg,
                            p.paymentDate() != null ? DATE_FMT.format(p.paymentDate()) : "—",
                            fmt(p.amount()),
                            p.paymentMode() != null ? p.paymentMode().name() : "—",
                            p.receiptNumber() != null ? p.receiptNumber() : "—",
                            p.referenceNumber() != null ? p.referenceNumber() : "—");
                    alt = !alt;
                }
                doc.add(payments);
            }

            // ── Footer ────────────────────────────────────────────────────────
            doc.add(spacer(30));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, LABEL_CLR);
            Paragraph footer = new Paragraph(
                    "This is a computer-generated invoice and does not require a signature.\n"
                    + "Generated by CloudCampus · " + schoolName,
                    footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static String fmt(BigDecimal v) {
        return v == null ? "₹0.00" : "₹" + String.format("%,.2f", v);
    }

    private static Paragraph spacer(float height) {
        Paragraph p = new Paragraph(" ");
        p.setSpacingBefore(height / 2f);
        p.setSpacingAfter(height / 2f);
        return p;
    }

    private static void addMetaCell(PdfPTable table, String label, String value, int align) {
        Font lFont = FontFactory.getFont(FontFactory.HELVETICA, 8, LABEL_CLR);
        Font vFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(0);
        cell.setPadding(3);
        cell.setHorizontalAlignment(align);
        if (!label.isEmpty()) {
            Paragraph lp = new Paragraph(label, lFont);
            lp.setAlignment(align);
            cell.addElement(lp);
        }
        Paragraph vp = new Paragraph(value, vFont);
        vp.setAlignment(align);
        cell.addElement(vp);
        table.addCell(cell);
    }

    private static void addSummaryRow(PdfPTable table, String label, String value, boolean bold) {
        Font lf = bold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK)
                : FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        Font vf = bold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, HEADER_BG)
                : FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);

        PdfPCell lc = new PdfPCell(new Phrase(label, lf));
        lc.setBorder(bold ? PdfPCell.BOTTOM : 0);
        lc.setPadding(4);

        PdfPCell vc = new PdfPCell(new Phrase(value, vf));
        vc.setBorder(bold ? PdfPCell.BOTTOM : 0);
        vc.setPadding(4);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(lc);
        table.addCell(vc);
    }

    private static void addTableHeader(PdfPTable table, String... labels) {
        Font hf = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        for (String l : labels) {
            PdfPCell cell = new PdfPCell(new Phrase(l, hf));
            cell.setBackgroundColor(HEADER_BG);
            cell.setPadding(6);
            cell.setBorder(0);
            table.addCell(cell);
        }
    }

    private static void addPaymentRow(PdfPTable table, Color bg, String... values) {
        Font rf = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v, rf));
            cell.setBackgroundColor(bg);
            cell.setPadding(5);
            cell.setBorder(0);
            table.addCell(cell);
        }
    }
}
