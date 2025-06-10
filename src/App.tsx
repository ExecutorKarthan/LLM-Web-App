
// import React, {useEffect, useRef, useState} from "react";
import SkulptDisplay from './components/SkulptDisplay';
import PythonEditor from "./components/PythonEditor";
import './App.css'


function App() {
  // const [writtenCode, updateCode] = useState(
  //   `#Type your code here! Like this:
  //   print("You can do this!")
  //   `
  // )

  // const updateEditor = (event: React.ChangeEvent<HTMLInputElement>)  => {
  //   updateCode(event.currentTarget.value);
  // }

  return (
    <>
      <main>
        <PythonEditor />
        <SkulptDisplay />
      </main>
    </>
  )
}

export default App
