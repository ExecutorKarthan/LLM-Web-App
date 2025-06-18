import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import LLMEntryBox from './components/LLMEntryBox';
import LLMResponseBox from './components/LLMResponseBox';
import PythonEditor from './components/PythonEditor';
import SkulptDisplay from './components/SkulptDisplay';
import { Row, Col } from 'antd';
function App() {
    const [userQuery, updateQuery] = useState("");
    const [writtenCode, updateCode] = useState(`#Type your code here! Like this: 
print("You can do this!")
    `);
    return (_jsxs(_Fragment, { children: [_jsxs(Row, { children: [_jsx(Col, { span: 12, children: _jsx(LLMEntryBox, { query: userQuery, onChange: updateQuery }) }), _jsx(Col, { span: 12, children: _jsx(LLMResponseBox, { userRequest: userQuery }) })] }), _jsxs(Row, { children: [_jsx(Col, { span: 12, children: _jsx(PythonEditor, { code: writtenCode, onChange: updateCode }) }), _jsx(Col, { span: 12, children: _jsx(SkulptDisplay, { code: writtenCode }) })] })] }));
}
export default App;
