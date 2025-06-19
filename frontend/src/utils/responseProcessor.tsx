import React from "react";

function processedResponse(response: string): React.ReactNode[] {
    const result: string[] = [];
    const lines = response.split("\n");

    for (const line of lines) {
        result.push(line);
    }

    let indentLine = false;

    return result.map((value, index) => {
        const trimmed = value.trim();
         console.log(value)

        // Check if line starts with def, if, or else and ends with :
        if (
            (trimmed.startsWith("def") || trimmed.startsWith("if") || trimmed.startsWith("else")) &&
            trimmed.endsWith(":")
        ) {
            indentLine = true;
            return <p key={index}><strong>{value}</strong></p>;
        }

        if (indentLine && value.startsWith("    ")) {
            return <p key={index} style={{ paddingLeft: "20px" }}>{value}</p>;
        }

        indentLine = false;
        console.log(value)
        return <p key={index}>{value}</p>;
    });
}

export default processedResponse;
