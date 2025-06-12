
import {useState} from 'react';
import LLMEntry from './components/LLMEntry';
import LLMResponse from './components/LLMResponse';
import PythonEditor from './components/PythonEditor';
import SkulptDisplay from './components/SkulptDisplay';
import { Row, Col } from 'antd';

function App() {
  const [userQuery, updateQuery] = useState <string>(""
  )
  const [writtenCode, updateCode] = useState <string>(
    `#Type your code here! Like this: 
print("You can do this!")
    `
  )

  return (
    <>
    <Row>
      <Col span = {12}>
        <LLMEntry query = {userQuery} onChange={updateQuery}/> 
      </Col>
      <Col span = {12}>
        <LLMResponse/>
      </Col>
    </Row>  
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
