import { ftGetTokenMetadata, init_env, type EstimateSwapView, estimateSwap, fetchAllPools } from "@ref-finance/ref-sdk";
import { Elysia } from "elysia"

init_env('testnet');

new Elysia()
    // http://localhost:3300/ref.fakes.testnet
    .get("/:token", async ({ params: { token } }) => {
        const tokenMetadata = await ftGetTokenMetadata(token);
        return tokenMetadata;
    })
    // http://localhost:3300/swap/ref.fakes.testnet/wrap.testnet/1
    .get("/swap/:tokenIn/:tokenOut/:quantity", async ({ params: { tokenIn, tokenOut, quantity } }) => {
        console.log(tokenIn, tokenOut, quantity);
        const { simplePools } = await fetchAllPools();
        const tokenInData = await ftGetTokenMetadata(tokenIn);
        const tokenOutData = await ftGetTokenMetadata(tokenOut);

        const swapTodos: EstimateSwapView[] = await estimateSwap({
            tokenIn: tokenInData,
            tokenOut: tokenOutData,
            amountIn: quantity,
            simplePools,
        });

        return swapTodos;
    })
    .listen(3300)