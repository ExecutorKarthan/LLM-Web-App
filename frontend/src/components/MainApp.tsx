import { useState, useEffect } from "react";
import axios from "axios"; // Make sure axios is installed and imported
import LLMEntryBox from "./LLMEntryBox";
import LLMResponseBox from "./LLMResponseBox";
import PythonEditor from "./PythonEditor";
import SkulptDisplay from "./SkulptDisplay";
import { Row, Col, Button } from "antd";

interface Puzzle {
  id: number;
  title: string;
  image_url: string;
  code: string;
}

interface MainAppProps {
  userApiKey: string;
}

const MainApp: React.FC<MainAppProps> = ({ userApiKey }) => {
  const [userQuery, updateQuery] = useState<string>("");
  const [writtenCode, updateCode] = useState<string>(
    `# Type your code here! Like this:\nprint("You can do this!")\n`
  );
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);

  useEffect(() => {
    // Fetch puzzle list on mount
    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/puzzles/")
      .then((res) => {
        setPuzzles(res.data);
      })
      .catch((err) => {
        console.error("Failed to load puzzles:", err);
      });
  }, []);

  const onSubmit = async () => {
    if (!userQuery.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/ask/", {
        prompt: userQuery,
        apiKey: userApiKey,
      });
      setResponse(res.data.response);
    } catch (error) {
      setResponse("Error processing your request.");
    } finally {
      setLoading(false);
    }
  };

  // When a puzzle button is clicked
  const handlePuzzleClick = (puzzleId: number) => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/puzzles/${puzzleId}/`)
      .then((res) => {
        const puzzle: Puzzle = res.data;
        setSelectedPuzzle(puzzle);
        updateCode(puzzle.code);
      })
      .catch((err) => {
        console.error("Failed to load puzzle:", err);
      });
  };

  return (
    <>
    {/* LLM input/output */}
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
            onSubmit={onSubmit}
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

      {/* Editor, puzzle image, and Skulpt display */}
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
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PythonEditor code={writtenCode} onChange={updateCode} />
          {selectedPuzzle && (
            <img
              src={selectedPuzzle.image_url}
              alt={selectedPuzzle.title}
              style={{ maxWidth: "100%", marginTop: 12, borderRadius: 6 }}
            />
          )}
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
          <SkulptDisplay code={writtenCode} onCodeChange={updateCode} />
        </Col>
      </Row>
    </>
  );
};

export default MainApp;
