
import {useState} from "react";
import SkulptDisplay from './components/SkulptDisplay';
import PythonEditor from "./components/PythonEditor";
import { Row, Col } from 'antd';

function App() {
  const [writtenCode, updateCode] = useState <string>(
    `#Type your code here! Like this: 
print("You can do this!")
    `
  )

  return (
    <>
    <Row>
      <Col span = {12}>
        <PythonEditor code={writtenCode} onChange={updateCode}/>  
      </Col>
      <Col span = {12}>
        <SkulptDisplay code={writtenCode}/>
      </Col>
      
    </Row>     
    </>
  )
}

export default App
