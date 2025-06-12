
// import React, {useEffect, useRef, useState} from "react";
import SkulptDisplay from './components/SkulptDisplay';
import PythonEditor from "./components/PythonEditor";
import { Row, Col } from 'antd';

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
    <Row>
      <Col span = {12}>
        <PythonEditor/>  
      </Col>
      <Col span = {12}>
        <SkulptDisplay />
      </Col>
      
    </Row>     
    </>
  )
}

export default App
