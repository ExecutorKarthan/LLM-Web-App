import Input from "antd/es/input/Input";

interface LLMEntryProps {
    query: string;
    onChange: (newQuery: string) => void;
}

const LLMEntry: React.FC<LLMEntryProps> = ({onChange}) =>{

    return(
        <Input
            showCount
            placeholder="Enter your query to the LLM here."
            style={{ height: 120, resize: 'none' }}
            onChange={(e) => {
                    onChange(e.target.value);
            }}
        />
    )
}

export default LLMEntry;