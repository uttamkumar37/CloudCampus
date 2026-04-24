import { Modal } from '../../../components/ui/Modal'

interface BulkUploadInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkUploadInstructionsModal({
  isOpen,
  onClose,
}: BulkUploadInstructionsModalProps) {
  return (
    <Modal
      title="Bulk Upload Instructions"
      description="Follow this workbook format exactly to onboard students, teachers, classes, and sections in one upload."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-5 text-sm text-slate-700">
        <section>
          <h3 className="font-semibold text-slate-950">Step-by-step</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Download the sample Excel workbook.</li>
            <li>Fill all four sheets without changing the sheet names.</li>
            <li>Upload the `.xlsx` file from this page.</li>
            <li>Review the row-level errors if any rows fail.</li>
            <li>Correct the workbook and re-upload if needed.</li>
          </ol>
        </section>

        <section>
          <h3 className="font-semibold text-slate-950">Required Sheets</h3>
          <ul className="mt-2 space-y-2">
            <li><strong>STUDENTS:</strong> admission_no, first_name, last_name, dob, gender, email, phone</li>
            <li><strong>TEACHERS:</strong> employee_no, first_name, last_name, email, phone, hire_date</li>
            <li><strong>CLASSES:</strong> class_name, class_code</li>
            <li><strong>SECTIONS:</strong> section_name, class_code</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-slate-950">Common Mistakes</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Renaming sheets or headers</li>
            <li>Using `tenantId` instead of correct tenant session</li>
            <li>Entering invalid emails</li>
            <li>Using a `class_code` in SECTIONS that does not exist in CLASSES</li>
            <li>Uploading duplicate admission numbers or employee numbers in the same file</li>
            <li>Using a date format other than `yyyy-MM-dd` for text cells</li>
          </ul>
        </section>
      </div>
    </Modal>
  )
}
