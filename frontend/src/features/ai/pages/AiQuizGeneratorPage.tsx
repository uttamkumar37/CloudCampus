import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { demoAssistantResponse } from "../aiConfig";
import { AiGeneratedOutput } from "../components/AiGeneratedOutput";
import { AiPageHeader } from "../components/AiPageHeader";
import { generateQuiz } from "../services/aiApi";
import type { AiAssistantResponse, AiQuizGenerationRequest } from "../types/ai.types";

const initialForm: AiQuizGenerationRequest = {
  className: "Class VI",
  section: "A",
  subject: "Mathematics",
  chapter: "Fractions",
  difficulty: "Medium",
  questionCount: 8,
  instructions: "Mix short answer and multiple choice questions. Include an answer key."
};

export function AiQuizGeneratorPage() {
  const { accessToken, role } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMessage, setUseMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setUseMessage(null);
    try {
      const nextResponse =
        accessToken && role !== "GUEST"
          ? await generateQuiz(accessToken, form)
          : demoAssistantResponse(role, `Generate ${form.questionCount || 8} quiz questions for ${form.subject} on ${form.chapter}`);
      setResponse(nextResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate quiz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <AiPageHeader title="Quiz generator" description="Create quick practice quizzes with a teacher-visible answer key." />
      <div className="generator-layout">
        <form
          className="form-panel"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="two-column">
            <label className="field">
              <span>Class</span>
              <input value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} required />
            </label>
            <label className="field">
              <span>Section</span>
              <input value={form.section || ""} onChange={(event) => setForm({ ...form, section: event.target.value })} />
            </label>
          </div>
          <div className="two-column">
            <label className="field">
              <span>Subject</span>
              <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required />
            </label>
            <label className="field">
              <span>Chapter</span>
              <input value={form.chapter} onChange={(event) => setForm({ ...form, chapter: event.target.value })} required />
            </label>
          </div>
          <div className="two-column">
            <label className="field">
              <span>Difficulty</span>
              <input value={form.difficulty || ""} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} />
            </label>
            <label className="field">
              <span>Questions</span>
              <input
                value={form.questionCount || 8}
                onChange={(event) => setForm({ ...form, questionCount: Number(event.target.value) })}
                min={1}
                max={50}
                type="number"
              />
            </label>
          </div>
          <label className="field">
            <span>Instructions</span>
            <textarea value={form.instructions || ""} onChange={(event) => setForm({ ...form, instructions: event.target.value })} rows={5} />
          </label>
          <button className="primary-button" type="submit" disabled={loading || !form.className || !form.subject || !form.chapter}>
            Generate quiz
          </button>
          {useMessage ? <div className="pending-label">{useMessage}</div> : null}
        </form>
        <AiGeneratedOutput
          title="Quiz draft"
          response={response}
          loading={loading}
          error={error}
          onRegenerate={() => void submit()}
          onUse={() => setUseMessage("Draft marked for teacher review. Saving quiz records needs a future backend persistence flow.")}
        />
      </div>
    </div>
  );
}
