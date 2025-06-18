
import {useState} from 'react';
import LLMEntryBox from './LLMEntryBox';
import LLMResponseBox from './LLMResponseBox';
import PythonEditor from './PythonEditor';
import SkulptDisplay from './SkulptDisplay';
import { Row, Col } from 'antd';

interface MainAppProps {
  userApiKey: string;
}

const MainApp: React.FC<MainAppProps> = ({ userApiKey }) => {
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
        <LLMResponseBox userRequest={userQuery} userApiKey={userApiKey}/>
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

export default MainApp
