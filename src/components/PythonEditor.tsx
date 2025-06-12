
import {Editor} from '@monaco-editor/react';

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
     <Editor
        height="600px"
        language="python"
        theme="vs-dark"
        value={code}
        options={options}
        onChange={(newValue)  => {
          if (typeof newValue === "string") {
            onChange(newValue);
          }
        }}
    />
  )
}

export default PythonEditor
