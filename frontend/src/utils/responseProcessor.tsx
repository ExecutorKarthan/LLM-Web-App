import React from "react";

function processedResponse(response: string): React.ReactNode[] {
  const lines = response.split("\n");
  let indentLine = false;

  return lines.map((value, index) => {
    const trimmed = value.trim();

    if (
      (trimmed.startsWith("def") || trimmed.startsWith("if") || trimmed.startsWith("else")) &&
      trimmed.endsWith(":")
    ) {
      indentLine = true;
      return <p key={index}><strong>{value}</strong></p>;
    }

    const leadingSpacesMatch = value.match(/^(\s*)/);
    const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[0].length : 0;

    const paddingLeft = leadingSpaces * 5;

    if (indentLine && leadingSpaces > 0) {
      return (
        <p key={index} style={{ paddingLeft: `${paddingLeft}px`, fontFamily: "monospace" }}>
          {value}
        </p>
      );
    }

    indentLine = false;
    return <p key={index} style={{ fontFamily: "monospace" }}>{value}</p>;
  });
}

export default processedResponse;
