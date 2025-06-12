import React, { useEffect, useRef } from "react";

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
    if (outputRef.current) {
      outputRef.current.innerHTML += text;
    }
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

    if (outputRef.current) outputRef.current.innerHTML = "";
    if (canvasRef.current) canvasRef.current.innerHTML = "";

    window.Sk.configure({
      output: outf,
      read: builtinRead,
    });

    window.Sk.TurtleGraphics = {
      target: canvasRef.current,
      width: 400,
      height: 400,
    };

    window.Sk.misceval
      .asyncToPromise(() =>
        window.Sk.importMainWithBody("<stdin>", false, code, true)
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

            if (outputRef.current) {
                outputRef.current.innerHTML +=
                "<br><strong style='color:red'>Error: </strong>" + errorMessage;
            }
        }
      );
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={runCode} style={{ padding: "10px" }}>Run Code</button>

      <h4>Print Output:</h4>
      <pre
        ref={outputRef}
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          minHeight: "100px",
          whiteSpace: "pre-wrap",
        }}
      ></pre>

      <h4>Turtle Graphics:</h4>
      <div
        ref={canvasRef}
        style={{
          width: "400px",
          height: "400px",
          border: "1px solid black",
          backgroundColor: "white",
        }}
      />
    </div>
  );
};

export default SkulptDisplay;