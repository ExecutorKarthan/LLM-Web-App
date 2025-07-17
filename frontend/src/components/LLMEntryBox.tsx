// Import needed modules
import { Input } from "antd";

// Create an interface for type safety
interface LLMEntryProps {
  query: string;
  onQueryChange: (newQuery: string) => void;
  response: string;
  setResponse: (setResponse: string) => void;
  loading: boolean;
  setLoading: (setLoading: boolean) => void;
  onSubmit: () => void;
}

// Create a constant to hold the text entered into the entry box
const { TextArea } = Input;

{/* Create a constant that will render the LLM Entry box */}
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
      {/* Create a space to type in LLM queries */}
      <TextArea
        showCount
        placeholder="Enter your query to the LLM here."
        style={{ height: 300, resize: "none", marginBottom: 16, width: "100%", maxWidth: 800 }}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {/* Create a button to send entered queries to the backend and thus the LLM */}
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


// Export the module for use
export default LLMEntryBox;
