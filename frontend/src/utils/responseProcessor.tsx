function processedResponse(response: string): string {
  const lines = response.split("\n");

  let inCodeBlock = false;
  const filteredLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Start or stop collecting lines between triple backticks
    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
      } else {
        break; // Stop processing after the closing ```
      }
      continue;
    }

    if (inCodeBlock || !lines.some(l => l.trim().startsWith("```"))) {
      filteredLines.push(line);
    }
  }

  return filteredLines.join("\n");
}

export default processedResponse;
