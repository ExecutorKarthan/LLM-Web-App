import React, { useEffect, useRef, useState } from "react";

interface Puzzle {
  id: string;
  code: string;
  image_url: string;
}

interface SkulptDisplayProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
}

declare global {
  interface Window {
    Sk: Skulpt;
  }
}

interface Skulpt {
  configure: (options: SkulptConfigureOptions) => void;
  importMainWithBody: (
    name: string,
    dumpGlobals: boolean,
    body: string,
    canSuspend: boolean
  ) => Promise<void>;
  misceval: {
    asyncToPromise: <T>(fn: () => T | Promise<T>) => Promise<T>;
  };
  builtinFiles: {
    files: Record<string, string>;
  };
  TurtleGraphics?: {
    target: HTMLElement | null;
    width?: number;
    height?: number;
  };
}

interface SkulptConfigureOptions {
  output?: (text: string) => void;
  read?: (filename: string) => string;
}

const SkulptDisplay: React.FC<SkulptDisplayProps> = ({ code, onCodeChange }) => {
  const outputRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [outputText, setOutputText] = useState<string>("");
  const [showPuzzle, setShowPuzzle] = useState<boolean>(false);
  const [puzzleData, setPuzzleData] = useState<Puzzle[]>([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [skulptLoaded, setSkulptLoaded] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/puzzles/")
      .then((res) => res.json())
      .then((data) => setPuzzleData(data))
      .catch((err) => console.error("Failed to load puzzles", err));

    if (!window.Sk) {
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
          document.body.appendChild(script);
        });

      (async () => {
        try {
          await loadScript("https://cdn.jsdelivr.net/npm/skulpt/dist/skulpt.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/skulpt/dist/skulpt-stdlib.js");
          setSkulptLoaded(true);
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      setSkulptLoaded(true);
    }
  }, []);

  const builtinRead = (x: string) => {
    if (!window.Sk.builtinFiles || !window.Sk.builtinFiles["files"][x]) {
      throw new Error(`File not found: '${x}'`);
    }
    return window.Sk.builtinFiles["files"][x];
  };

  const outf = (text: string) => {
    setOutputText((prev) => prev + text);
  };

  const runCode = () => {
    if (!skulptLoaded || !window.Sk || !window.Sk.builtinFiles) {
      alert("Skulpt is not fully loaded yet. Try again in a moment.");
      return;
    }

    setShowPuzzle(false);
    setOutputText("");

    if (canvasRef.current) {
      canvasRef.current.innerHTML = "";
    }

    setTimeout(() => {
      const width = canvasRef.current?.clientWidth ?? 600;
      const height = canvasRef.current?.clientHeight ?? 600;

      window.Sk.configure({
        output: outf,
        read: builtinRead,
      });

      window.Sk.TurtleGraphics = {
        target: canvasRef.current,
        width,
        height,
      };

      const injectedPreamble = `
import turtle
screen = turtle.Screen()
screen.setup(width=${width}, height=${height})
screen.setworldcoordinates(-${Math.floor(width / 2)}, -${Math.floor(height / 2)}, ${Math.floor(width / 2)}, ${Math.floor(height / 2)})
`;

      const combinedCode = injectedPreamble + "\n" + code;

      window.Sk.misceval
        .asyncToPromise(() =>
          window.Sk.importMainWithBody("<stdin>", false, combinedCode, true)
        )
        .then(
          () => console.log("Execution success"),
          (err: unknown) => {
            let errorMessage = "Unknown error";
            console.error("Raw error object:", err);
            if (err instanceof Error) {
              errorMessage = err.message;
            } else if (typeof err === "string") {
              errorMessage = err;
            }

            setOutputText(
              (prev) =>
                prev +
                "<br><strong style='color:red'>Error: </strong>" +
                errorMessage
            );
          }
        );
    }, 100);
  };

  const handleShowPuzzle = (label: string, id: string) => {
    let puzzle;
    let processedId: string = id; 
    let count: number = 0;
    while(processedId.indexOf(" ") > 0 && count < 5){
      processedId = processedId.substring(0, processedId.indexOf(" ")) + processedId.substring(processedId.indexOf(" ") +1)
      count+= 1
    }
    for( let i = 0; i < puzzleData.length; i++){ 
      if(puzzleData[i].id.toLowerCase().indexOf(label.toLowerCase()+processedId.toLocaleLowerCase()) > -1 
          && puzzleData[i].id.length == (label + processedId).length){
        puzzle = puzzleData[i];
        break
      }
    }
    if (puzzle) {
      setSelectedPuzzle(puzzle);
      setShowPuzzle(true);
      if (onCodeChange) {
        onCodeChange(puzzle.code);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Run Code Button */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={runCode} disabled={!skulptLoaded} style={{ fontSize: "1.2rem", padding: "10px 20px" }}>
          Run Code
        </button>
      </div>

      {/* Puzzle Categories */}
      <div style={{ display: "flex", justifyContent: "space-around", width: "100%", maxWidth: 800 }}>
        {[
          { label: "Small", ids: ["Linear", "One Branch", "One Branch Gate"] },
          { label: "Medium", ids: ["Linear", "One Branch", "One Branch Gate"] },
          { label: "Large", ids: ["Linear", "One Branch", "One Branch Gate"] },
          { label: "Solved", ids: ["Linear", "One Branch", "One Branch Gate"] },
        ].map(({ label, ids }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <h3>{label}</h3>
            {ids.map((id) => (
              <button key={id} style={{ display: "block", margin: "6px auto" }} onClick={() => handleShowPuzzle(label, id)}>
                {id} Puzzle
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Skulpt Canvas or Puzzle Image */}
      <div style={{ marginTop: 20, width: "100%" }}>
        {showPuzzle && selectedPuzzle ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}${selectedPuzzle.image_url}`}
            alt={`Puzzle ${selectedPuzzle.id}`}
            style={{
              marginTop: 20,
              maxWidth: "100%",
              height: "auto",
              border: "1px solid #ccc",
            }}
          />
        ) : (
          <>
            <div
              ref={canvasRef}
              style={{
                marginTop: 20,
                minHeight: 200,
                maxHeight: 600,
                flexGrow: 1,
                border: "1px solid black",
                backgroundColor: "white",
                width: "100%",
              }}
            />
            <pre
              ref={outputRef}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "10px",
                minHeight: 100,
                maxHeight: 200,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                marginTop: 20,
                width: "100%",
                boxSizing: "border-box",
              }}
              dangerouslySetInnerHTML={{ __html: outputText }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SkulptDisplay;
