import { Input } from "antd";

interface LLMEntryProps {
  query: string;
  onQueryChange: (newQuery: string) => void;
  response: string;
  setResponse: (setResponse: string) => void;
  loading: boolean;
  setLoading: (setLoading: boolean) => void;
  onSubmit: () => void;
}

const { TextArea } = Input;

const LLMEntryBox: React.FC<LLMEntryProps> = ({
  query,
  onQueryChange,
  onSubmit,
  loading,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextArea
        showCount
        placeholder="Enter your query to the LLM here."
        style={{ height: 120, resize: "none", marginBottom: 16, width: "100%", maxWidth: 400 }}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <button
        onClick={onSubmit}
        disabled={loading || !query.trim()}
        style={{ padding: "8px 16px", minWidth: 120 }}
      >
        {loading ? "Loading..." : "Submit request"}
      </button>
    </div>
  );
};

export default LLMEntryBox;
