// Import needed modules
import { Editor } from '@monaco-editor/react';

// Establish interface for type safety
interface PythonEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

// Create the editor and store it as a variable 
const PythonEditor: React.FC<PythonEditorProps> = ({ code, onChange }) => {
  const options = {
    selectOnLineNumbers: true,
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
  };

  // Return the HTML for rendering
  return (
    <div style={{ height: "100%", width: "100%", boxSizing: "border-box" }}>
      <Editor
        language="python"
        theme="vs-dark"
        value={code}
        options={options}
        onChange={(newValue) => {
          if (typeof newValue === "string") {
            onChange(newValue);
          }
        }}
        height="100%"
      />
    </div>
  );
};

// Export the editor for use
export default PythonEditor;
