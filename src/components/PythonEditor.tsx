
import React, {useState} from "react";
import {Editor} from '@monaco-editor/react';

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
        <Editor
          height="600px"
          language="python"
          theme="vs-dark"
          value={writtenCode}
          options={{autoIndent: 'full',
            contextmenu: true,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 24,
            hideCursorInOverviewRuler: true,
            matchBrackets: 'always',
            minimap: {
              enabled: true,
            },
            scrollbar: {
              horizontalSliderSize: 4,
              verticalSliderSize: 18,
            },
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,}}
          onChange={() => updateEditor}
        />
    </>
  )
}

export default PythonEditor
