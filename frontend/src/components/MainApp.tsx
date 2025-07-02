import { useState } from "react";
import axios from "axios"; // Make sure axios is installed and imported
import LLMEntryBox from "./LLMEntryBox";
import LLMResponseBox from "./LLMResponseBox";
import PythonEditor from "./PythonEditor";
import SkulptDisplay from "./SkulptDisplay";
import { Row, Col } from "antd";

interface MainAppProps {
  userApiKey: string;
}

const MainApp: React.FC<MainAppProps> = ({ userApiKey }) => {
  const [userQuery, updateQuery] = useState<string>("");
  const [writtenCode, updateCode] = useState<string>(
    `#Type your code here! Like this: 
print("You can do this!")
`
  );
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    if (!userQuery.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/ask/",
        {
          prompt: userQuery,
          apiKey: userApiKey,
        }
      );
      setResponse(res.data.response);
    } catch (error) {
      setResponse("Error processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row gutter={[24, 24]} justify="center" wrap style={{ marginBottom: 32 }}>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          xl={12}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            borderRadius: 6,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 350,
          }}
        >
          <LLMEntryBox
            query={userQuery}
            onQueryChange={updateQuery}
            response={response}
            setResponse={setResponse}
            loading={loading}
            setLoading={setLoading}
            onSubmit={onSubmit} // Pass your new onSubmit function here
          />
        </Col>

        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          xl={12}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            borderRadius: 6,
            boxSizing: "border-box",
            minHeight: 350,
            overflowY: "auto",
          }}
        >
          <LLMResponseBox
            response={response}
            loading={loading}
            onSaveCode={(code) => updateCode(code)}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} justify="center" wrap>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          xl={12}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            boxSizing: "border-box",
            minHeight: 350,
          }}
        >
          <PythonEditor code={writtenCode} onChange={updateCode} />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={12}
          xl={12}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            boxSizing: "border-box",
            minHeight: 350,
          }}
        >
          <SkulptDisplay code={writtenCode} />
        </Col>
      </Row>
    </>
  );
};

export default MainApp;
