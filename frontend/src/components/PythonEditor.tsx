import { Editor } from '@monaco-editor/react';

interface PythonEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

const PythonEditor: React.FC<PythonEditorProps> = ({ code, onChange }) => {
  const options = {
    selectOnLineNumbers: true,
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
  };

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
        height="100%" // now fills parent div
      />
    </div>
  );
};

export default PythonEditor;
