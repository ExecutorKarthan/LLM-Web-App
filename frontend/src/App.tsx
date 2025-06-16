
import {useState} from 'react';
import LLMEntryBox from './components/LLMEntryBox';
import LLMResponseBox from './components/LLMResponseBox';
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
        <LLMEntryBox query={userQuery} onChange={updateQuery}/> 
      </Col>
      <Col span = {12}>
        <LLMResponseBox userRequest={userQuery}/>
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
