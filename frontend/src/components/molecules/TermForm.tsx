import { useState } from "react";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import type { TermData } from "../../services/termService";

const RULE_TYPES = [
  { value: "TAX_EXCLUDED", label: "Tax Excluded (Informational)" },
  {
    value: "PERCENTAGE_SURCHARGE",
    label: "Service Management Fee (Percentage)",
  },
  { value: "TRAVEL_DISTANCE", label: "Travel Charges" },
  { value: "MULTIPLIER_OOH", label: "Out-Of-Hours Multiplier" },
  { value: "MULTIPLIER_WEEKEND", label: "Weekend/Holiday Multiplier" },
  { value: "GENERAL", label: "General / Other (Informational)" },
];

interface TermFormProps {
  initial?: TermData;
  onSave: (data: TermData) => void;
  onCancel: () => void;
}

interface TermFormState {
  content: string;
  ruleType: string;
  thresholdValue: string;
  chargeValue: string;
}

const AUTO_GENERATED_RULE_TYPES = new Set([
  "TAX_EXCLUDED",
  "PERCENTAGE_SURCHARGE",
  "TRAVEL_DISTANCE",
  "MULTIPLIER_OOH",
  "MULTIPLIER_WEEKEND",
]);

function defaultForm(initial?: TermData): TermFormState {
  if (!initial) {
    return {
      content: "",
      ruleType: "GENERAL",
      thresholdValue: "",
      chargeValue: "",
    };
  }

  let chargeVal = "";
  if (initial.chargeValue !== undefined && initial.chargeValue !== null) {
    if (initial.ruleType === "PERCENTAGE_SURCHARGE") {
      chargeVal = String(initial.chargeValue * 100);
    } else {
      chargeVal = String(initial.chargeValue);
    }
  }

  return {
    ...initial,
    ruleType: initial.ruleType || "GENERAL",
    thresholdValue:
      initial.thresholdValue !== undefined && initial.thresholdValue !== null
        ? String(initial.thresholdValue)
        : "",
    chargeValue: chargeVal,
  };
}

function buildGeneratedContent(
  ruleType: string,
  thresholdValue: string,
  chargeValue: string,
) {
  switch (ruleType) {
    case "TAX_EXCLUDED":
      return "All the prices are exclusive of taxes";
    case "PERCENTAGE_SURCHARGE":
      return chargeValue
        ? `${chargeValue}% Service Management fee will be charged additionally from the overall monthly billing`
        : "";
    case "TRAVEL_DISTANCE":
      if (thresholdValue && chargeValue) {
        const formattedCharge = isNaN(Number(chargeValue))
          ? chargeValue
          : Number(chargeValue).toFixed(2);
        return `Travel charges are included however travel distance more than ${thresholdValue} kms (to and fro customer sites) are charged at $${formattedCharge} per km additional to the above rates`;
      }
      return "";
    case "MULTIPLIER_OOH":
      return chargeValue
        ? `For out of hours support breakfix support, charges will be x${chargeValue} of the above estimate`
        : "";
    case "MULTIPLIER_WEEKEND":
      return chargeValue
        ? `For Weekends and Holidays breakfix support, charges will be x${chargeValue} of the above estimate`
        : "";
    default:
      return "";
  }
}

export default function TermForm({ initial, onSave, onCancel }: TermFormProps) {
  const [form, setForm] = useState<TermFormState>(defaultForm(initial));
  const [isManuallyEdited, setIsManuallyEdited] = useState(
    initial ? true : false,
  );

  const update = <K extends keyof TermFormState>(
    field: K,
    value: TermFormState[K],
  ) => {
    setForm((prev) => {
      const nextForm = { ...prev, [field]: value };

      if (!isManuallyEdited && field !== "content") {
        const generatedContent = buildGeneratedContent(
          nextForm.ruleType,
          nextForm.thresholdValue,
          nextForm.chargeValue,
        );
        if (generatedContent) {
          nextForm.content = generatedContent;
        }
      }

      return nextForm;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;

    let chargeNum =
      form.chargeValue === "" ? null : parseFloat(form.chargeValue);
    if (chargeNum !== null && form.ruleType === "PERCENTAGE_SURCHARGE") {
      chargeNum = chargeNum / 100.0;
    }

    const submittedData: TermData = {
      id: initial?.id,
      content: form.content,
      ruleType: form.ruleType,
      thresholdValue:
        form.thresholdValue === ""
          ? undefined
          : parseFloat(form.thresholdValue),
      chargeValue: chargeNum === null ? undefined : chargeNum,
    };
    onSave(submittedData);
  };

  const showThreshold = form.ruleType === "TRAVEL_DISTANCE";
  const showCharge = [
    "PERCENTAGE_SURCHARGE",
    "TRAVEL_DISTANCE",
    "MULTIPLIER_OOH",
    "MULTIPLIER_WEEKEND",
  ].includes(form.ruleType || "");

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initial ? "Edit Term & Condition" : "Add Term & Condition"}</h3>

      <div className="form-group mb-4">
        <Select
          label="Rule Type"
          options={RULE_TYPES}
          value={form.ruleType || "GENERAL"}
          onChange={(e) => {
            const nextRuleType = e.target.value;
            update("ruleType", nextRuleType);
            if (AUTO_GENERATED_RULE_TYPES.has(nextRuleType)) {
              setIsManuallyEdited(false);
            }
          }}
        />
      </div>

      <div className="form-group mb-4">
        <label
          className="form-label"
          style={{
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "8px",
            display: "block",
          }}
        >
          Term Content / Note
        </label>
        <textarea
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-offset)",
            color: "var(--color-text)",
            fontSize: "14px",
            minHeight: "80px",
            fontFamily: "inherit",
          }}
          value={form.content}
          onChange={(e) => {
            setIsManuallyEdited(true);
            update("content", e.target.value);
          }}
          placeholder="e.g. 5% service management fee applies."
          required
        />
      </div>

      <div className="form-row">
        {showThreshold && (
          <Input
            label="Threshold Value"
            type="number"
            step="any"
            value={form.thresholdValue}
            onChange={(e) => update("thresholdValue", e.target.value)}
            placeholder="e.g. 50"
          />
        )}

        {showCharge && (
          <Input
            label={
              form.ruleType === "PERCENTAGE_SURCHARGE"
                ? "Charge Rate (%)"
                : "Charge / Multiplier Value"
            }
            type="number"
            step="any"
            value={form.chargeValue}
            onChange={(e) => update("chargeValue", e.target.value)}
            placeholder={
              form.ruleType === "PERCENTAGE_SURCHARGE"
                ? "e.g. 5 for 5%"
                : "e.g. 0.40 or 1.5"
            }
          />
        )}
      </div>

      <div className="form-actions" style={{ marginTop: "20px" }}>
        <Button type="submit">{initial ? "Update" : "Save"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
