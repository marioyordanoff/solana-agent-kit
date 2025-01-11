import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import * as dotenv from "dotenv";

dotenv.config();

async function initializeBot() {
    if (!process.env.SOLANA_PRIVATE_KEY || !process.env.RPC_URL || !process.env.OPENAI_API_KEY) {
        throw new Error("Missing required environment variables");
    }

    const solanaAgent = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY,
        process.env.RPC_URL,
        process.env.OPENAI_API_KEY
    );

    const tools = createSolanaTools(solanaAgent) as any;
    console.log("Available tools:", tools.map((t: any) => t.name));

    const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.7,
    });

    const agent = createReactAgent({
        llm,
        tools,
        messageModifier: `
            You are a helpful assistant that specializes in checking token balances on Solana.
            You have access to these tools:
            - solana_balance: Check SOL balance
            - solana_balance_other: Check other token balances
            - solana_request_faucet: Request test SOL from faucet

            Always use the appropriate tool when asked about balances or requesting funds.
            Be concise and clear in your responses.
            If you encounter any errors, explain them in user-friendly terms.
        `
    });

    return { agent };
}

async function main() {
    const { agent } = await initializeBot();
    
    console.log("Bot initialized! Type 'exit' to quit.");
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data: Buffer) => {
        const input = data.toString().trim();
        if (input.toLowerCase() === 'exit') {
            process.exit(0);
        }
        
        try {
            console.log("\nProcessing request:", input);

            const result = await agent.invoke({
                messages: [new HumanMessage(input)]
            });
            
            console.log("Raw result:", result);

            if (result && result.content) {
                console.log("\nBot:", result.content);
            } else {
                console.log("\nBot: Sorry, I couldn't process that request.");
            }
        } catch (error: any) {
            console.error("Error:", error.message);
            console.error("Full error:", error);
        }
    });
}

main().catch(console.error);