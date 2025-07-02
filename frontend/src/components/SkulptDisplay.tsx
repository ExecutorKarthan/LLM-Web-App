import React, { useEffect, useRef, useState } from "react";

interface SkulptDisplayProps {
  code: string;
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
  ) => SkulptExecutionResult;
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

type SkulptExecutionResult = Promise<void>;

const SkulptDisplay: React.FC<SkulptDisplayProps> = ({ code }) => {
  const outputRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [outputText, setOutputText] = useState<string>("");

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

  const outf = (text: string) => {
    setOutputText((prev) => prev + text);
  };

  const builtinRead = (x: string) => {
    if (!window.Sk.builtinFiles || !window.Sk.builtinFiles["files"][x]) {
      throw new Error(`File not found: '${x}'`);
    }
    return window.Sk.builtinFiles["files"][x];
  };

  const runCode = () => {
    if (!window.Sk) {
      alert("Skulpt is not loaded yet. Try again in a moment.");
      return;
    }

    setOutputText("");
    if (canvasRef.current) canvasRef.current.innerHTML = "";

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

    // Inject preamble to setup turtle screen with canvas size and centered coords
    const injectedPreamble = `
import turtle
screen = turtle.Screen()
screen.setup(width=${width}, height=${height})
screen.setworldcoordinates(-${Math.floor(width / 2)}, -${Math.floor(height / 2)}, ${Math.floor(width / 2)}, ${Math.floor(height / 2)})

# Warning: User code has been modified to fit drawing inside the display.
# This was done to center graphics and prevent drawings larger than the canvas.
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

  // Check if canvas has children to show graphic output
  const hasGraphicOutput = canvasRef.current?.children.length !== 0;
  const hasTextOutput = outputText.trim().length > 0;

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
      <button
        onClick={runCode}
        style={{ padding: "10px", alignSelf: "center" }}
      >
        Run Code
      </button>

      {hasGraphicOutput && (
        <div
          ref={canvasRef}
          style={{
            flexGrow: 1,
            minHeight: 200,
            border: "1px solid black",
            backgroundColor: "white",
            marginTop: 16,
            width: "100%",
            maxHeight: 600,
          }}
        />
      )}

      {hasTextOutput && (
        <pre
          ref={outputRef}
          style={{
            backgroundColor: "#f0f0f0",
            padding: "10px",
            minHeight: 100,
            maxHeight: 200,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            marginTop: hasGraphicOutput ? 16 : 20,
            width: "100%",
            boxSizing: "border-box",
          }}
          dangerouslySetInnerHTML={{ __html: outputText }}
        />
      )}

      {!hasGraphicOutput && !hasTextOutput && (
        <div
          ref={canvasRef}
          style={{
            width: "100%",
            minHeight: 200,
            border: "1px solid black",
            backgroundColor: "white",
            marginTop: 16,
            flexGrow: 1,
            maxHeight: 600,
          }}
        />
      )}
    </div>
  );
};

export default SkulptDisplay;
