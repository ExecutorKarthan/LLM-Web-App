import React, { useEffect, useRef, useState } from "react";
import processResponse from "../utils/responseProcessor";
import puzzle1Img from "../assets/puzzle-images/puzzle1.png";
import puzzle1Code from "../assets/puzzle-code/puzzle1.txt";


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

  useEffect(() => {
    if (!window.Sk) {
      const skulptScript = document.createElement("script");
      skulptScript.src = "https://cdn.jsdelivr.net/npm/skulpt/dist/skulpt.min.js";
      skulptScript.onload = () => {
        const stdlibScript = document.createElement("script");
        stdlibScript.src = "https://cdn.jsdelivr.net/npm/skulpt/dist/skulpt-stdlib.js";
        document.body.appendChild(stdlibScript);
      };
      document.body.appendChild(skulptScript);
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
    if (!window.Sk) {
      alert("Skulpt is not loaded yet. Try again in a moment.");
      return;
    }

    // Hide puzzle when running code
    setShowPuzzle(false);
    setOutputText("");

    if (canvasRef.current) {
      canvasRef.current.innerHTML = "";
    }

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
          if (err instanceof Error) {
            errorMessage = err.message;
            console.error(err.message);
          } else if (typeof err === "string") {
            errorMessage = err;
            console.error(err);
          }

          setOutputText(
            (prev) =>
              prev +
              "<br><strong style='color:red'>Error: </strong>" +
              errorMessage
          );
        }
      );
  };

 const handleShowPuzzle = async () => {
  try {
    const res = await fetch("/assets/puzzle-code/puzzle.txt");
    if (!res.ok) throw new Error("Failed to load puzzle code");

    const text = await res.text();
    onCodeChange?.(text);
    setShowPuzzle(true);
  } catch (err) {
    console.error("Error loading puzzle code:", err);
  }
};


  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={runCode}>Run Code</button>
        <button onClick={handleShowPuzzle}>Show Puzzle</button>
      </div>

      {showPuzzle ? (
        <img
          src={puzzle1Img}
          alt="Puzzle"
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
  );
};

export default SkulptDisplay;
