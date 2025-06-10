
import React, {useState} from "react";
import MonacoEditor from 'react-monaco-editor';

const PythonEditor = () => {
  const [writtenCode, updateCode] = useState(
    `#Type your code here! Like this:
    print("You can do this!")
    `
  )

  const updateEditor = (event: React.ChangeEvent<HTMLInputElement>)  => {
    updateCode(event.currentTarget.value);
  }

  return (
    <>
      <main>
        <MonacoEditor
          width="800"
          height="600"
          language="python"
          theme="vs-dark"
          value={writtenCode}
          options={{selectOnLineNumbers: true, automaticLayout: true, lineDecorationsWidth: "0"}}
          onChange={() => updateEditor}
        />
      </main>
    </>
  )
}

export default PythonEditor
